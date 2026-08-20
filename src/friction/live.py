"""Gate a real repository at a real commit for a real diff.

Everything else in this package measures the committed corpus. This runs the
same selection against a repository the user actually has, which is what makes
the gate usable rather than merely demonstrated.

The one thing it cannot do is measure recall on that repository: recall needs
labels saying which test guards which fix, and an arbitrary repo has none. So
the gate identifies which *class* of graph was built and applies that class's
recall as measured on the labelled corpus. The output says so explicitly — a
prior presented as a measurement would be exactly the kind of borrowed number
this project exists to object to.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import networkx as nx

from friction.gate import (GateVerdict, audit_recall, gate, select_tests,
                          wilson_lb)

TEST_MARKERS = ("test_", "_test", "tests.", ".tests", "conftest")


@dataclass(frozen=True)
class LiveGate:
    repo: Path
    graph_sha: str
    repo_head: str
    arm: str
    k: int
    graph_nodes: int
    graph_edges: int
    changed_symbols: int
    total_tests: int
    selected_tests: tuple[str, ...]
    graph_complete: bool
    unmatched_changed: tuple[str, ...]
    verdict: GateVerdict
    prior_n: int
    prior_note: str
    evidence: dict[str, tuple[str, ...]] = field(default_factory=dict)


def _is_test(node: str) -> bool:
    """Test-role comes from the MODULE PATH, never from a symbol's name.

    A symbol under tests/, in test_*.py / *_test.py, or in conftest.py is a
    test. A production function whose NAME happens to contain 'test'
    (select_tests, run_tests, latest_patch) is NOT — name-matching here once
    misclassified `friction.gate::select_tests` as a test on this very repo
    (found by adversarial review, fixed with a regression test).
    """
    module = node.split("::", 1)[0].rsplit(".", 1)[-1].lower()
    segs = node.split("::", 1)[0].replace("\\", "/").lower().split("/")
    stem = module
    if any(seg.startswith("test_") or seg.endswith("_test")
           or seg in ("tests", "test", "conftest") for seg in segs):
        return True
    return stem.startswith("test_") or stem.endswith("_test") \
        or stem == "conftest"


def _module_prefixes(path: str) -> tuple[str, ...]:
    """`src/requests/sessions.py` -> dotted qualname prefixes a node may carry.

    tree-sitter qualnames are dotted from the repo root and KEEP layout dirs
    (`src.requests.sessions.Session::__init__`), so the full dotted path is the
    primary candidate; the src/lib-stripped variant covers repos whose parse
    root sat below the layout dir.
    """
    p = path.replace("\\", "/")
    if p.endswith(".py"):
        p = p[:-3]
    full = p.replace("/", ".")
    out = [full]
    for strip in ("src/", "lib/"):
        if p.startswith(strip):
            out.append(p[len(strip):].replace("/", "."))
    return tuple(out)


def gate_repo(repo: Path, changed_files: list[str], arm: str = "arm_a",
              k: int = 6, threshold: float | None = None) -> LiveGate:
    """Build a graph of `repo`, select tests for `changed_files`, and decide."""
    repo = Path(repo)
    if not repo.is_dir():
        raise NotADirectoryError(f"{repo} is not a directory")

    from friction.namematch.graph import build as build_arm_a
    edges, _stats = build_arm_a(repo)

    # Intern qualname nodes to the integer ids select_tests works in.
    index: dict[str, int] = {}

    def nid(name: str) -> int:
        if name not in index:
            index[name] = len(index) + 1
        return index[name]

    g = nx.DiGraph()
    for e in edges:
        g.add_edge(nid(e.src), nid(e.dst))

    wanted = {c.replace("\\", "/") for c in changed_files}
    prefixes = {w: _module_prefixes(w) for w in wanted}
    changed_ids: set[int] = set()
    matched: set[str] = set()
    for name, node_id in index.items():
        for w, prefs in prefixes.items():
            # module-boundary match: "core" must not bleed into "corex"
            if any(name == pref or name.startswith(pref + ".")
                   or name.startswith(pref + "::")
                   for pref in prefs if pref):
                changed_ids.add(node_id)
                matched.add(w)

    test_ids = {node_id for name, node_id in index.items() if _is_test(name)}
    by_id = {v: k_ for k_, v in index.items()}

    by_id = {v: k_ for k_, v in index.items()}
    result = select_tests(g, changed_ids, test_ids, k)
    # evidence chains: per selected test, the shortest call path from a
    # changed symbol to it (test -> ... -> change), reconstructed from a
    # parent-BFS over the same predecessor walk the selector used.
    parent: dict[int, int] = {}
    frontier = {c for c in changed_ids if c in g}
    visited = set(frontier)
    for _ in range(k):
        nxt = set()
        for u in frontier:
            for v in g.predecessors(u):
                if v not in visited:
                    visited.add(v)
                    parent[v] = u
                    nxt.add(v)
        if not nxt:
            break
        frontier = nxt
    evidence: dict[str, tuple[str, ...]] = {}
    for t in result.selected:
        chain = [t]
        cur = t
        while cur in parent:
            cur = parent[cur]
            chain.append(cur)
        chain.reverse()              # change -> ... -> test
        evidence[by_id.get(t, str(t))] = tuple(by_id.get(n, str(n))
                                               for n in chain)

    # Staleness fingerprint: a verdict is about THIS graph of THIS commit.
    # Consumers can detect a stale answer by re-hashing.
    import hashlib
    import subprocess
    h = hashlib.sha256()
    for name in sorted(index):
        h.update(f"{name};".encode())
    for u, v in sorted(g.edges):
        h.update(f"{by_id[u]}->{by_id[v]};".encode())
    graph_sha = h.hexdigest()[:16]
    try:
        repo_head = subprocess.run(
            ["git", "-C", str(repo), "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True, timeout=5).stdout.strip() or "n/a"
    except Exception:
        repo_head = "n/a"

    # Recall is a corpus prior, never a measurement on this repo.
    from friction.cli import MANIFEST_PATH
    audit = audit_recall(MANIFEST_PATH, MANIFEST_PATH.parent, arm, k)
    from friction.gate import SAFE_SKIP_RECALL
    verdict = gate(audit, threshold if threshold is not None
                   else SAFE_SKIP_RECALL)
    live_note = None
    if changed_ids and len(matched) < len(wanted):
        live_note = (f"{len(wanted) - len(matched)} changed file(s) matched no "
                     f"symbol in this graph")
    elif not changed_ids:
        live_note = "no changed symbol resolved in this graph"
    elif not test_ids:
        live_note = "no test recognised in this graph"
    elif not result.graph_complete:
        live_note = "the walk was truncated (graph-incomplete)"
    if live_note:
        verdict = GateVerdict(
            "RUN_FULL", verdict.measured_recall, verdict.n, arm, k,
            verdict.threshold,
            f"live abstention, independent of the corpus prior: {live_note} — "
            f"refusing to license any skip on it")

    return LiveGate(
        repo=repo, graph_sha=graph_sha, repo_head=repo_head, arm=arm, k=k,
        graph_nodes=g.number_of_nodes(), graph_edges=g.number_of_edges(),
        changed_symbols=len(changed_ids),
        total_tests=len(test_ids),
        selected_tests=tuple(sorted(by_id[i] for i in result.selected)),
        evidence=evidence,
        graph_complete=result.graph_complete,
        unmatched_changed=tuple(sorted(wanted - matched)),
        verdict=verdict,
        prior_n=audit.n,
        prior_note=(
            f"Recall {verdict.measured_recall:.3f} is the value measured for "
            f"'{arm}'-class graphs on the labelled corpus (n={audit.n}), not a "
            f"measurement on {repo.name}. An unlabelled repository cannot yield "
            f"a recall figure; this is that class's prior, applied. Per-repo "
            f"recall spans "
            f"{min(h / t for h, t in audit.per_repo.values() if t):.2f}–"
            f"{max(h / t for h, t in audit.per_repo.values() if t):.2f} "
            f"across {len(audit.per_repo)} "
            f"{'repo' if len(audit.per_repo) == 1 else 'repos'}; "
            f"the pooled one-sided 95% "
            f"lower bound is {wilson_lb(audit.hits, audit.n):.3f}."),
    )
