"""The gate: is it safe to skip tests based on this code graph?

Every graph-based test selector answers "which tests does this change affect?"
by walking the call graph backwards from the changed symbol — tests call code,
so an affected test sits upstream. Whatever the walk does not reach gets skipped.

That is only safe if the graph's *recall* of the test -> code relation is known.
This module reproduces the selection (`select_tests`), measures its recall
against labelled ground truth (`audit_recall`), turns the measurement into a
decision (`gate`), and compares the two extraction arms on the same instances
(`compare_arms`).

The distinction the product rests on: a walk that exhausts its frontier is
**graph-complete** — complete with respect to the edges the graph contains. It
is not **program-complete**. An extractor cannot fail-closed on an edge it never
knew existed, so graph-completeness is silent about missing edges. Only a recall
measurement against labels can speak to those.

Prior art, deliberately not re-claimed: safe regression test selection is
Rothermel & Harrold (IEEE TSE 1998); static RTS unsafety is Legunsen et al.
(FSE 2016); reflection as its cause is Shi et al. (OOPSLA 2019). What is new
here is the domain (the graph class LLM coding agents build), the oracle
(SWE-bench FAIL_TO_PASS rather than a dynamic RTS tool), and the link to agent
abstention. See docs/related-work.md.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Iterable

import networkx as nx

from friction.connectivity import instance_dir, load_graph

# The bar for "safe to skip". Chosen, not measured: dropping the guarding test
# 1 run in 20 is already a poor trade against the minutes a full suite costs.
# It is a parameter precisely because it is a judgement call — but no graph
# class measured in this project comes close to it, so the verdict does not
# turn on where exactly the bar sits.
SAFE_SKIP_RECALL = 0.95

DEFAULT_SPLIT_PATH = Path("data/shipped/split.json")


def _check_bound(k: int) -> None:
    if isinstance(k, bool) or not isinstance(k, int) or k < 1:
        raise ValueError("k must be a positive integer (the bound is mandatory)")


@dataclass(frozen=True)
class SelectionResult:
    """The tests a graph-based selector would run for one change.

    `graph_complete` records whether the backwards walk exhausted its frontier
    before hitting the bound `k`. True means no test reachable *in this graph*
    was cut off by the bound. It says nothing about edges the graph is missing.
    """

    selected: frozenset[int]
    k: int
    graph_complete: bool


def select_tests(g: nx.DiGraph, changed_ids: Iterable[int],
                 candidate_test_ids: Iterable[int], k: int) -> SelectionResult:
    """Tests within `k` reverse hops of any changed symbol.

    Direction matters and is easy to get backwards: production code has no edge
    to the test that guards it, so the walk runs along *predecessors*. Measured
    on this corpus, the forward direction (fix -> test) connects 0/44 instances.
    """
    _check_bound(k)

    changed = {int(c) for c in changed_ids}
    candidates = {int(t) for t in candidate_test_ids}
    if not changed or not candidates:
        return SelectionResult(frozenset(), k, False)

    selected = changed & candidates
    frontier = {c for c in changed if c in g}
    visited = set(frontier)

    for _ in range(k):
        nxt: set[int] = set()
        for u in frontier:
            nxt.update(g.predecessors(u))
        nxt -= visited
        if not nxt:
            return SelectionResult(frozenset(selected), k, True)
        selected |= nxt & candidates
        visited |= nxt
        frontier = nxt

    return SelectionResult(frozenset(selected), k, False)


@lru_cache(maxsize=8)
def _load_split(split_path: str) -> dict:
    p = Path(split_path)
    if not p.exists():
        return {}
    return json.loads(p.read_text(encoding="utf-8")).get("assignments") or {}


def split_of(instance_id: str,
             split_path: Path = DEFAULT_SPLIT_PATH) -> str | None:
    """Which half is this instance in? None when it is not in the pinned file.

    Returning None rather than guessing matters: an instance added after the
    split was pinned must not be silently folded into either half.
    """
    return _load_split(str(split_path)).get(instance_id)


@dataclass(frozen=True)
class RecallAudit:
    """Measured recall of a graph-based selector against labelled instances.

    The label is free: SWE-bench's FAIL_TO_PASS test *is* the test that guards
    the fix. If the selector does not return it, a tool that skipped on this
    graph would have dropped the one test that catches the bug.

    This is the field's standard safety measure with a different oracle.
    Legunsen et al. (FSE 2016) compute safety violation against Ekstazi, a
    dynamic RTS tool. Using a human-curated label instead removes the
    dependence on a second tool being right.
    """

    arm: str
    k: int
    n: int
    hits: int
    misses: tuple[str, ...]
    per_repo: dict[str, tuple[int, int]]
    split: str | None = field(default=None)

    @property
    def recall(self) -> float:
        return self.hits / self.n if self.n else 0.0


def _repo_of(instance_id: str) -> str:
    return instance_id.split("__", 1)[0]


def _iter_manifest(manifest_path: Path):
    with Path(manifest_path).open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                yield json.loads(line)


def _edges_path(arms_root: Path, instance_id: str, arm: str) -> Path | None:
    """Resolve the edge file across the two on-disk layouts.

    The working corpus keeps one file per arm
    (``<id>/<arm>/edges.ndjson``); the shipped payload keeps one gzipped file
    per instance with BOTH arms merged (``<id>/edges.ndjson.gz``). The merge is
    safe to walk directly because the arms live in disjoint integer id bands,
    so no edge can cross from one arm into the other.
    """
    base = instance_dir(arms_root, instance_id)
    per_arm = instance_dir(base, arm) / "edges.ndjson"
    if per_arm.exists():
        return per_arm
    merged = base / "edges.ndjson.gz"
    if merged.exists():
        return merged
    return None


def _load_edges(path: Path) -> nx.DiGraph:
    """`connectivity.load_graph` plus transparent gzip support."""
    if path.suffix != ".gz":
        return load_graph(path)
    import gzip
    g = nx.DiGraph()
    with gzip.open(path, "rt", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                row = json.loads(line)
                g.add_edge(int(row["src"]), int(row["dst"]))
    return g


def _instance_hit(record: dict, arms_root: Path, arm: str,
                  k: int) -> bool | None:
    """Did the selector return the guarding test for this instance?

    Returns None when the instance is not measurable on this arm — either
    endpoint set empty, or no graph on disk. Callers must exclude those from
    `n` rather than score them, exactly as connectivity.measure_corpus does:
    counting an unmeasurable instance either way would be a fabricated number.
    """
    entry = record.get(arm) or {}
    fix = list(entry.get("fix_site_ids") or [])
    tests = list(entry.get("test_target_ids") or [])
    if not fix or not tests:
        return None

    edges = _edges_path(arms_root, record["instance_id"], arm)
    if edges is None:
        return None

    return bool(select_tests(_load_edges(edges), fix, tests, k).selected)


def audit_recall(manifest_path: Path, arms_root: Path, arm: str, k: int,
                 split: str | None = None,
                 split_path: Path = DEFAULT_SPLIT_PATH) -> RecallAudit:
    """Run the selector over every labelled instance and count the misses.

    `split` restricts to one half of the pinned split ("dev" or "sealed").
    Instances absent from the split file are excluded when `split` is set,
    never silently included.
    """
    n = hits = 0
    misses: list[str] = []
    per_repo: dict[str, list[int]] = {}

    for record in _iter_manifest(manifest_path):
        if split is not None:
            if split_of(record["instance_id"], split_path) != split:
                continue
        hit = _instance_hit(record, Path(arms_root), arm, k)
        if hit is None:
            continue

        n += 1
        bucket = per_repo.setdefault(_repo_of(record["instance_id"]), [0, 0])
        bucket[1] += 1
        if hit:
            hits += 1
            bucket[0] += 1
        else:
            misses.append(record["instance_id"])

    return RecallAudit(
        arm=arm, k=k, n=n, hits=hits,
        misses=tuple(misses),
        per_repo={r: (h, t) for r, (h, t) in per_repo.items()},
        split=split,
    )


@dataclass(frozen=True)
class GateVerdict:
    decision: str            # "SKIP_SAFE" | "RUN_FULL"
    measured_recall: float
    n: int
    arm: str
    k: int
    threshold: float
    reason: str


def wilson_lb(hits: int, n: int, z: float = 1.645) -> float:
    """One-sided 95% Wilson lower bound on a binomial proportion.

    The gate skips only when THIS clears the bar — never the point estimate
    alone — so a perfect tiny sample (3/3) can never license a skip.
    """
    import math
    if n == 0:
        return 0.0
    p = hits / n
    denom = 1 + z * z / n
    centre = p + z * z / (2 * n)
    margin = z * math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)
    return (centre - margin) / denom


def gate(audit: RecallAudit, threshold: float = SAFE_SKIP_RECALL) -> GateVerdict:
    """Turn a measured recall into a decision about skipping tests."""
    if not 0.0 < threshold <= 1.0:
        raise ValueError(
            f"threshold must be in (0, 1], got {threshold}: recall is a "
            f"proportion, so a bar outside that range can never be a "
            f"meaningful skip criterion")
    recall = audit.recall

    if audit.n == 0:
        return GateVerdict(
            "RUN_FULL", 0.0, 0, audit.arm, audit.k, threshold,
            "recall is unmeasured on this graph: with no labelled instances "
            "there is no evidence that a skip would keep the guarding test, so "
            "the only defensible decision is to run everything",
        )

    lb = wilson_lb(audit.hits, audit.n)
    if recall >= threshold:
        if lb >= threshold:
            return GateVerdict(
                "SKIP_SAFE", recall, audit.n, audit.arm, audit.k, threshold,
                f"measured test->fix recall {recall:.3f} on n={audit.n} "
                f"labelled instances meets the {threshold:.2f} bar and so does "
                f"its one-sided 95% lower bound ({lb:.3f})",
            )
        return GateVerdict(
            "RUN_FULL", recall, audit.n, audit.arm, audit.k, threshold,
            f"measured test->fix recall {recall:.3f} meets the "
            f"{threshold:.2f} bar but the one-sided 95% lower bound "
            f"({lb:.3f}) does not: n={audit.n} labelled instances is too "
            f"little evidence to license a skip — a perfect 3/3 would fail "
            f"this test too",
        )

    dropped = round((1.0 - recall) * 100)
    return GateVerdict(
        "RUN_FULL", recall, audit.n, audit.arm, audit.k, threshold,
        f"measured test->fix recall {recall:.3f} on n={audit.n} labelled "
        f"instances is below the {threshold:.2f} bar: {dropped}% of tests known "
        f"to guard their fix are not reachable in this graph, so a skip would "
        f"silently drop them",
    )


@dataclass(frozen=True)
class ArmComparison:
    """Name-matched vs type-resolved recall, on the SAME instances.

    Arm A is measurable on fewer instances than arm B, so an unpaired
    comparison would compare different instance sets. Every count below is
    restricted to instances measurable on both arms.

    `p_value` is an exact McNemar test on the discordant cells (`a_only` vs
    `b_only`) — the correct test for paired binary outcomes. It answers: given
    the instances where the two arms disagree, is the split further from 50/50
    than chance explains?
    """

    n_paired: int
    a_hits: int
    b_hits: int
    both_hit: int
    a_only: int
    b_only: int
    neither: int
    p_value: float

    @property
    def a_recall(self) -> float:
        return self.a_hits / self.n_paired if self.n_paired else 0.0

    @property
    def b_recall(self) -> float:
        return self.b_hits / self.n_paired if self.n_paired else 0.0

    @property
    def recall_delta(self) -> float:
        return self.b_recall - self.a_recall


def _mcnemar_exact(a_only: int, b_only: int) -> float:
    """Two-sided exact McNemar p-value from the discordant counts."""
    discordant = a_only + b_only
    if discordant == 0:
        return 1.0
    from scipy.stats import binomtest
    return float(binomtest(b_only, discordant, 0.5).pvalue)


def compare_arms(manifest_path: Path, arms_root: Path, k: int) -> ArmComparison:
    """Paired arm comparison over instances measurable on both arms."""
    arms_root = Path(arms_root)
    both_hit = a_only = b_only = neither = 0

    for record in _iter_manifest(manifest_path):
        hit_a = _instance_hit(record, arms_root, "arm_a", k)
        hit_b = _instance_hit(record, arms_root, "arm_b", k)
        if hit_a is None or hit_b is None:
            continue
        if hit_a and hit_b:
            both_hit += 1
        elif hit_a:
            a_only += 1
        elif hit_b:
            b_only += 1
        else:
            neither += 1

    n_paired = both_hit + a_only + b_only + neither
    return ArmComparison(
        n_paired=n_paired,
        a_hits=both_hit + a_only,
        b_hits=both_hit + b_only,
        both_hit=both_hit,
        a_only=a_only,
        b_only=b_only,
        neither=neither,
        p_value=_mcnemar_exact(a_only, b_only),
    )


def live_selection(transport, record: dict, arms_root: Path, arm: str,
                   k: int, band_offset: int = 900_000_000_000) -> dict:
    """Run one instance's selection IN THE ENGINE and compare with offline.

    Loads the instance's arm graph into the running engine (both the CALLS
    edges and the materialised CALLED_BY reverse — the engine rejects incoming
    variable-length patterns), executes ``build_selection_cypher`` per fix
    site, and returns the selected set, per-query latency, and parity with the
    offline walk. Ids are shifted by ``band_offset`` so a live load never
    collides with anything already resident.
    """
    import time

    entry = record.get(arm) or {}
    fix = [int(x) for x in (entry.get("fix_site_ids") or [])]
    tests = {int(x) for x in (entry.get("test_target_ids") or [])}
    edges_file = _edges_path(arms_root, record["instance_id"], arm)
    if not fix or not tests or edges_file is None:
        raise ValueError("instance is not measurable on this arm")

    g = _load_edges(edges_file)
    off = band_offset

    def _chunks(seq, size=500):
        for i in range(0, len(seq), size):
            yield seq[i:i + size]

    node_rows = [{"id": n + off, "sid": str(n)} for n in g.nodes]
    call_rows = [{"src": u + off, "dst": v + off} for u, v in g.edges]
    rev_rows = [{"src": v + off, "dst": u + off} for u, v in g.edges]

    t0 = time.perf_counter()
    for chunk in _chunks(node_rows):
        transport.query("UNWIND $rows AS row MERGE (n {id: row.id}) "
                        "SET n:Sym, n.sid = row.sid", {"rows": chunk})
    for stmt_rel, rows in (("CALLS", call_rows), ("CALLED_BY", rev_rows)):
        for chunk in _chunks(rows):
            transport.query(
                f"UNWIND $rows AS row CREATE (a {{id: row.src}})"
                f"-[:{stmt_rel}]->(b {{id: row.dst}})", {"rows": chunk})
    load_ms = (time.perf_counter() - t0) * 1000

    selected: set[int] = set()
    queries = []
    for f in fix:
        cypher = build_selection_cypher(f + off, "CALLED_BY", k)
        t1 = time.perf_counter()
        rows = transport.query(cypher)
        ms = (time.perf_counter() - t1) * 1000
        reached = {int(r["id"]) - off for r in rows if r.get("id") is not None}
        selected |= reached & tests
        queries.append({"cypher": cypher, "engine_ms": round(ms, 1),
                        "reached": len(reached)})

    offline = select_tests(g, fix, tests, k)
    return {
        "instance_id": record["instance_id"],
        "arm": arm,
        "k": k,
        "nodes_loaded": g.number_of_nodes(),
        "edges_loaded": g.number_of_edges(),
        "load_ms": round(load_ms, 1),
        "queries": queries,
        "engine_selected": len(selected),
        "offline_selected": len(offline.selected),
        "parity": selected == set(offline.selected),
        "guarding_tests": len(tests),
        "dropped_guarding_tests": len(tests - selected),
    }


def build_selection_cypher(node_id: int, rel_type: str = "CALLED_BY",
                           k: int = 6) -> str:
    """In-engine backwards selection from a changed symbol.

    Engine-verified form (2026-08-17, pinned commit): the incoming
    variable-length pattern ``(s {id})<-[:CALLS*1..k]-(n)`` is REJECTED —
    *"variable-length MATCH requires a fixed source id"* — the engine only
    anchors a variable-length walk on the pattern's source side. So the
    backwards walk is expressed as an **outward** walk over the reversed
    relationship (``CALLED_BY``), which ingest materialises alongside ``CALLS``.

    ``RETURN n.id`` is deliberate: ``count(n)`` on a node is rejected too
    ("property values support integer, float, boolean, and string literals"),
    and ``n.id`` is a verified-working projection.
    """
    if isinstance(node_id, bool) or not isinstance(node_id, int):
        raise TypeError("node_id must be an integer graph id")
    _check_bound(k)
    return (f"MATCH (s {{id: {node_id}}})-[:{rel_type}*1..{k}]->(n) "
            f"RETURN n.id AS id")
