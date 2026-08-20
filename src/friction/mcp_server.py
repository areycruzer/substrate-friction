"""MCP server exposing the gate to coding agents.

The abstention literature (AgentAbstain arXiv 2607.10059, ReDAct arXiv
2604.07036) has agents defer on *model-internal* uncertainty. This server
supplies the missing external signal: a measured statement about the graph an
agent's conclusion rests on.

Runs against the **open-source** engine and the committed corpus. It does not
talk to any hosted service.

Configure it the way the ecosystem expects:

    {"mcpServers": {"substrate-friction": {"command": "friction-mcp"}}}

Design note: both tools are task-shaped, not entity-shaped — `gate_explain`
takes a LIST of instance ids and returns a list, so an agent gets its answer in
one round trip instead of a call chain.
"""

from __future__ import annotations

import json

from mcp.server.mcpserver import MCPServer

mcp = MCPServer("substrate-friction")


def gate_check(arm: str = "arm_b", k: int = 6) -> str:
    """Is it safe to skip tests based on this class of code graph?

    Returns a measured verdict: the recall of the test->fix relation for this
    graph class on labelled SWE-bench instances, and the decision it forces.
    """
    from friction.cli import MANIFEST_PATH
    from friction.gate import audit_recall, gate as run_gate

    if arm not in {"arm_a", "arm_b"}:
        return json.dumps({"error": f"unknown arm {arm!r}; "
                                    "use 'arm_a' or 'arm_b'"})

    audit = audit_recall(MANIFEST_PATH, MANIFEST_PATH.parent, arm, k)
    verdict = run_gate(audit)
    return json.dumps({
        "decision": verdict.decision,
        "measured_recall": round(verdict.measured_recall, 4),
        "n": verdict.n,
        "arm": arm,
        "k": k,
        "threshold": verdict.threshold,
        "reason": verdict.reason,
        "advice": (
            "Run the full test suite. This graph class's measured recall of "
            "the test-to-fix relation is below the bar, so a subset selected "
            "by graph traversal would omit tests that guard the change. Do "
            "not present a graph-derived 'affected tests' list as complete."
            if verdict.decision == "RUN_FULL" else
            "A graph-selected subset is defensible at this bar."),
    }, indent=2)


def gate_explain(instance_ids: list[str], arm: str = "arm_b",
                 k: int = 6) -> str:
    """Replay labelled instances: what a selector returns vs what guards them.

    Task-shaped: pass several instance ids in one call and get a list back.
    """
    from friction.cli import MANIFEST_PATH
    from friction.gate import (_edges_path, _iter_manifest, _load_edges,
                               build_selection_cypher, select_tests)

    if arm not in {"arm_a", "arm_b"}:
        return json.dumps({"error": f"unknown arm {arm!r}"})

    wanted = set(instance_ids)
    records = {r["instance_id"]: r for r in _iter_manifest(MANIFEST_PATH)
               if r["instance_id"] in wanted}

    out = []
    for iid in instance_ids:
        record = records.get(iid)
        if record is None:
            out.append({"instance_id": iid, "error": "unknown instance"})
            continue
        entry = record.get(arm) or {}
        fix = list(entry.get("fix_site_ids") or [])
        tests = list(entry.get("test_target_ids") or [])
        edges = _edges_path(MANIFEST_PATH.parent, iid, arm)
        if edges is None:
            out.append({"instance_id": iid, "error": f"no {arm} graph on disk"})
            continue
        result = select_tests(_load_edges(edges), fix, tests, k)
        missed = sorted(set(int(t) for t in tests) - result.selected)
        out.append({
            "instance_id": iid,
            "arm": arm,
            "k": k,
            "guarding_tests": len(tests),
            "selected": len(result.selected),
            "graph_complete": result.graph_complete,
            "dropped_guarding_tests": missed[:50],
            "cypher": (build_selection_cypher(int(fix[0]), "CALLED_BY", k)
                       if fix else None),
            "note": ("graph_complete=true means the walk exhausted every edge "
                     "this graph has. It does not mean the graph has every "
                     "edge."),
        })
    return json.dumps(out, indent=2)


def route(question: str) -> str:
    """Which tool answers this question? Cheap probe first, escalate second,
    abstain last — the routing order itself is the discipline.

    Graph/edge/symbol questions -> graph_query. Skip-safety questions ->
    gate_check. Anything else -> an honest abstain with both options named.
    """
    q = question.lower()
    if any(w in q for w in ("edge", "symbol", "graph", "call", "calls",
                            "confirmed", "trust")):
        return json.dumps({"route": "graph_query",
                           "why": "structural question — the certified graph "
                                  "answers it with per-edge trust labels"})
    if any(w in q for w in ("skip", "safe", "run all", "test selection",
                            "subset")):
        return json.dumps({"route": "gate_check",
                           "why": "selection-safety question — the measured "
                                  "gate answers it"})
    return json.dumps({"route": "abstain",
                       "why": "not a graph or selection-safety question",
                       "options": ["graph_query", "gate_check"]})


def context_pack(changed: list[str]) -> str:
    """A token-budgeted context pack for THIS checkout: the changed symbols
    and the tests the walk reaches, each with its evidence chain and a
    'why' — plus what was omitted. Receipts, not vibes."""
    from pathlib import Path
    from friction.live import gate_repo
    g = gate_repo(Path.cwd(), changed)
    items = []
    for t in g.selected_tests[:20]:
        chain = g.evidence.get(t, ())
        items.append({
            "kind": "test", "symbol": t,
            "why": (" → ".join(chain)) if chain else "selected by the walk",
            "estimated_tokens": max(24, len(t) // 3),
        })
    return json.dumps({
        "snapshot": {"graph_sha": g.graph_sha, "repo_head": g.repo_head},
        "verdict": g.verdict.decision,
        "items": items,
        "omitted": max(0, len(g.selected_tests) - 20),
        "note": "at measured recall the full suite is the safety net — the "
                "pack is a review head start, never a skip licence",
    }, indent=2)


mcp.tool()(gate_check)
mcp.tool()(gate_explain)
mcp.tool()(route)
mcp.tool()(context_pack)


def run() -> None:
    mcp.run()


if __name__ == "__main__":
    run()


def graph_query(symbols: list[str], trust: str = "any",
                limit: int = 50) -> str:
    """Certified call-graph edges touching the given symbols — with receipts.

    Task-shaped: several symbols per call. Every edge carries a trust label
    (`confirmed` = both extraction arms agree; `name_only` = name-matched
    only, unconfirmed by type resolution), the arms that produced it, and the
    source commit. An agent consuming this graph knows exactly how much to
    believe each edge — which no raw repo map tells it.
    """
    import json as _json
    from pathlib import Path as _P

    path = _P("data/shipped/consensus.json")
    if not path.exists():
        return _json.dumps({"error": "consensus artifact absent"})
    doc = _json.loads(path.read_text(encoding="utf-8"))
    if trust not in {"any", "confirmed", "name_only"}:
        return _json.dumps({"error": f"unknown trust filter {trust!r}"})

    wanted = [s.lower() for s in symbols]
    hits = []
    for e in doc["edges"]:
        if trust != "any" and e["trust"] != trust:
            continue
        hay = f"{e['src']} {e['dst']}".lower()
        if any(w in hay for w in wanted):
            hits.append(e)
            if len(hits) >= limit:
                break
    return _json.dumps({
        "commit": doc["commit"],
        "engine_digest": doc["engine_digest"],
        "counts": doc["counts"],
        "matched": len(hits),
        "edges": hits,
        "note": ("trust=confirmed edges are agreed by both arms; name_only "
                 "edges are unconfirmed by type resolution and include the "
                 "collision classes in docs/edge-taxonomy.md. The arm-B-only "
                 "recall gap is counted in `counts.b_only`."),
    }, indent=2)


mcp.tool()(graph_query)
