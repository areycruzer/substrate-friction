"""Fix-site <-> test-target connectivity — the framing measurement, productised.

The original spec asked whether a change's fix sites reach the tests that guard
them: `sourceValues: $fixSiteIds -> targetValues: $testTargetIds`. Measured on
the 50 built instances, that direction is **backwards**. Code does not call its
tests; tests call code. So the directionally-honest question is *test -> fix*,
and the near-total coverage only appears once you drop direction entirely —
`relDirection: 'both'`, which silently means "shares a neighbourhood", not "the
test exercises this code".

This module measures all three, statically over each instance's `edges.ndjson`
(NOT the engine — this is a property of the built graph, computed with a bounded
BFS in networkx so the k bound is explicit and the result is reproducible
without a running node):

* **fix -> test** (directed): the original spec's direction. ~0%.
* **test -> fix** (directed): the natural direction. The clean directed signal.
* **undirected** at k=6 and k=10: the broad, weaker relation.

The gap between directed test->fix and undirected is the pytest fixture / setUp
/ parametrize / framework-dispatch closure that a static call graph never sees:
a test reaches the code it exercises through machinery no `CALLS` edge records.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

import networkx as nx


@dataclass(frozen=True)
class ConnectivityReport:
    n: int
    fix_to_test: int
    test_to_fix: int
    undirected_6: int
    undirected_10: int
    per_instance: dict[str, dict] = field(default_factory=dict)


def connected_within(g: nx.DiGraph, srcs: Iterable[int], dsts: Iterable[int],
                     k: int, undirected: bool) -> bool | None:
    """Is any node in `srcs` within `k` hops of any node in `dsts`?

    Returns None when either endpoint set is empty (nothing to measure), else a
    bool. Directed by default; `undirected=True` traverses in- and out-edges
    alike (the `relDirection: 'both'` semantics). The bound `k` is mandatory and
    counts hops: a shared node is connected at distance 0, a direct edge at 1.
    """
    src_set = {int(s) for s in srcs}
    dst_set = {int(d) for d in dsts}
    if not src_set or not dst_set:
        return None
    if src_set & dst_set:
        return True

    frontier = {s for s in src_set if s in g}
    visited = set(frontier)
    for _ in range(k):
        nxt: set[int] = set()
        for u in frontier:
            nxt.update(g.successors(u))
            if undirected:
                nxt.update(g.predecessors(u))
        nxt -= visited
        if not nxt:
            break
        if nxt & dst_set:
            return True
        visited |= nxt
        frontier = nxt
    return False


def instance_dir(root: Path | str, instance_id: str) -> Path:
    """``root/instance_id``, refusing ids that would leave ``root``.

    Instance ids reach here from HTTP path parameters, so an id such as
    ``..`` or an absolute path must not select a file outside the corpus.
    """
    base = os.path.abspath(root)
    full = os.path.normpath(os.path.join(base, instance_id))
    if not full.startswith(base + os.sep):
        raise ValueError(f"invalid instance id: {instance_id!r}")
    return Path(full)


def load_graph(edges_path: Path) -> nx.DiGraph:
    """Build a directed graph from an instance's `edges.ndjson`.

    Every line is `{"src", "dst", ...}`; direction is preserved. Undirected
    queries reinterpret the same directed graph at query time rather than
    materialising a second copy.
    """
    g = nx.DiGraph()
    with Path(edges_path).open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            g.add_edge(int(row["src"]), int(row["dst"]))
    return g


def _endpoints(entry: dict) -> tuple[list[int], list[int]]:
    fix = list(entry.get("fix_site_ids") or [])
    test = list(entry.get("test_target_ids") or [])
    return fix, test


def measure_corpus(manifest_path: Path, arms_root: Path,
                   arm: str) -> ConnectivityReport:
    """Measure connectivity across every instance in `manifest_path` for `arm`.

    Only instances whose `arm` entry carries BOTH a non-empty fix-site set and a
    non-empty test-target set are counted — the rest have nothing to connect. The
    per-instance graph is read from `arms_root/<instance_id>/<arm>/edges.ndjson`.
    """
    manifest_path = Path(manifest_path)
    arms_root = Path(arms_root)

    per_instance: dict[str, dict] = {}
    with manifest_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            instance_id = record["instance_id"]
            entry = record.get(arm) or {}
            fix, test = _endpoints(entry)
            if not fix or not test:
                continue

            edges_path = arms_root / instance_id / arm / "edges.ndjson"
            if not edges_path.exists():
                continue
            g = load_graph(edges_path)

            per_instance[instance_id] = {
                "fix_to_test": connected_within(g, fix, test, 6, undirected=False),
                "test_to_fix": connected_within(g, test, fix, 6, undirected=False),
                "undirected_6": connected_within(g, fix, test, 6, undirected=True),
                "undirected_10": connected_within(g, fix, test, 10, undirected=True),
                "n_fix": len(fix),
                "n_test": len(test),
                "edges": g.number_of_edges(),
            }

    def _count(key: str) -> int:
        return sum(1 for r in per_instance.values() if r[key] is True)

    return ConnectivityReport(
        n=len(per_instance),
        fix_to_test=_count("fix_to_test"),
        test_to_fix=_count("test_to_fix"),
        undirected_6=_count("undirected_6"),
        undirected_10=_count("undirected_10"),
        per_instance=per_instance,
    )


def _pct(num: int, denom: int) -> str:
    if denom == 0:
        return "n/a"
    return f"{num}/{denom} ({100.0 * num / denom:.0f}%)"


def write_report(report_b: ConnectivityReport, report_a: ConnectivityReport,
                 path: Path) -> None:
    """Generate `docs/connectivity.md` from the two arm reports."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    b, a = report_b, report_a
    lines: list[str] = []
    lines.append("# Fix-site <-> test-target connectivity")
    lines.append("")
    lines.append(
        "Measured statically over each instance's `edges.ndjson` with a bounded "
        "BFS (networkx, not the engine — this is a property of the built graph). "
        "An instance is counted only when its arm carries both a non-empty "
        "fix-site set and a non-empty test-target set.")
    lines.append("")
    lines.append(f"- **arm B** (type-resolved via `scip-python`): {b.n} "
                 "instances with both endpoints.")
    lines.append(f"- **arm A** (name-matched): {a.n} instances with both "
                 "endpoints.")
    lines.append("")

    lines.append("## Direction table (arm B, bounded at 6 hops)")
    lines.append("")
    lines.append("| Direction | Connected | Note |")
    lines.append("|---|---|---|")
    lines.append(f"| **fix -> test** (directed) | **{_pct(b.fix_to_test, b.n)}** "
                 "| Backwards. Code does not call tests. |")
    lines.append(f"| **test -> fix** (directed) | **{_pct(b.test_to_fix, b.n)}** "
                 "| The natural direction: tests call code. |")
    lines.append(f"| **undirected** (`relDirection: 'both'`) | "
                 f"**{_pct(b.undirected_6, b.n)}** | Weaker semantics, near-total "
                 "coverage. |")
    lines.append("")
    lines.append(f"Undirected at 10 hops: {_pct(b.undirected_10, b.n)}.")
    lines.append("")

    lines.append("## arm A (name-matched)")
    lines.append("")
    lines.append("| Direction | Connected |")
    lines.append("|---|---|")
    lines.append(f"| fix -> test (directed) | {_pct(a.fix_to_test, a.n)} |")
    lines.append(f"| test -> fix (directed) | {_pct(a.test_to_fix, a.n)} |")
    lines.append(f"| undirected @6 | {_pct(a.undirected_6, a.n)} |")
    lines.append(f"| undirected @10 | {_pct(a.undirected_10, a.n)} |")
    lines.append("")

    lines.append("## What these numbers mean")
    lines.append("")
    lines.append(
        f"**fix -> test is {_pct(b.fix_to_test, b.n)} because code does not call "
        "tests.** The original spec's `sourceValues: $fixSiteIds -> targetValues: "
        "$testTargetIds` runs the relation the wrong way down the call graph. "
        "Production code has no edge to the test that guards it; the test has an "
        "edge to the code. So the directed measure that carries signal is "
        "**test -> fix**.")
    lines.append("")
    lines.append(
        f"**The jump from directed test -> fix ({_pct(b.test_to_fix, b.n)}) to "
        f"undirected ({_pct(b.undirected_6, b.n)}) is the fixture closure.** The "
        "missing edges are the pytest fixture / `setUp` / `parametrize` / "
        "framework-dispatch machinery: a test reaches the code it exercises "
        "through dispatch a static call graph never records. Dropping direction "
        "recovers those instances, but it recovers them by measuring a weaker "
        "relation.")
    lines.append("")
    lines.append(
        "**Undirected reachability means \"shares a neighbourhood\", NOT \"the "
        "test exercises this code\".** Two nodes are undirected-connected whenever "
        "any chain of calls in either direction links them; that is a symmetric, "
        "much looser property than \"this test runs this code\". Report the two "
        "measures separately and never present the undirected number as evidence "
        "that a test covers a fix.")
    lines.append("")
    lines.append(
        "**Consequence for v1/v2.** Every v1/v2 friction number was computed with "
        "`relDirection: 'both'` — i.e. on the undirected relation. Those numbers "
        "measured the weaker \"shares a neighbourhood\" property, not directed "
        "test -> fix coverage. The clean directed semantic is "
        f"**test -> fix at {_pct(b.test_to_fix, b.n)}**; the undirected "
        f"{_pct(b.undirected_6, b.n)} is a different, broader claim.")
    lines.append("")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
