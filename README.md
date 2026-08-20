# Substrate Friction

[![HydraDB verify](https://github.com/areycruzer/substrate-friction/actions/workflows/hydra-verify.yml/badge.svg)](https://github.com/areycruzer/substrate-friction/actions/workflows/hydra-verify.yml)
![License: MIT](https://img.shields.io/badge/license-MIT-1f883d)
![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-3776ab)
![engine](https://img.shields.io/badge/engine-digest--pinned%20db78309a-ff571a)

**Before your tool skips a test, measure the graph it trusted.**

> *Everyone is trying to make coding agents smarter. Nobody is asking the
> cheaper question.* — this project's founding brief
> ([`docs/origin/`](docs/ORIGIN.md)), which set out to predict **where agents
> fail** and route those tickets to humans. The prediction died by its own
> pre-registered protocol. The autopsy found something better: **the ground
> under every agent was never load-bearing — and nobody had weighed it.**

Graph-based test selection is a good idea: build a call graph, walk backwards
from the change, run the tests it reaches, skip the rest. It is also unsafe in
a way that is invisible from inside the tool — the walk can be provably
complete with respect to the **graph** while the graph is missing the edge
that mattered in the **program**. The map is not the territory; we measured
the gap. **An extractor cannot fail-closed on an edge it never knew existed —
so we built the thing that can.**

`friction gate` is the founding brief's triage gate, one level deeper. The
brief asked *"which tickets should we not give the robot?"* — the gate asks
the question under that question: **which graphs should the robot not trust?**
It measures the load-bearing number — what fraction of tests known to guard a
fix does this graph let you reach? — and its `RUN_FULL` verdict is the same
move the brief called *"route to human"*: when the evidence is thin, abstain.
The label is free — SWE-bench's `FAIL_TO_PASS` test *is* the test that guards
the fix. Friction, as it turns out, was real all along: it is **what the
substrate charges you before the agent even starts.**

![friction gate --live: the engine loads the graph, executes the selection in 2.6 ms, agrees exactly with the offline walk, and proves the dropped guarding test](docs/plots/hero-terminal.svg)
*A real capture — the engine itself proves the miss. Source: `docs/captures/03-live-parity.txt`; rendered by `scripts/render_assets.py`.*

**Guarding-test recall: 0.545 on django (n=44), 0.419 pooled across 7 repos
(n=172) — the per-repo spread is the finding, not an inconsistency — and the
underlying precision ceiling is flat across eight years of django (S5).**
Every figure names its scope; every figure is emitted by a committed script.

**Site:** [areycruzer.github.io/substrate-friction](https://areycruzer.github.io/substrate-friction) · **Full report:** [`docs/gate.md`](docs/gate.md)

---

## The 60-second version (no jargon)

Every AI coding agent wants more autonomy: pick which tests matter, ship on
its own say-so. The question nobody can answer today is the triage question:
**this edit — can the AI handle it, or does it need a human?**

The answer depends on one measurable thing: the **map of your code** the
agent trusts. **We measured it.** Against 172 real, human-verified bug
fixes, the map reaches the one test that would catch the bug **42% of the
time** (the quick map most tools use: 31%; on some projects: **0%**) — and
it has been that way for eight years, so it is not fixing itself.

**So this tool is the triage.** Before any change goes autonomous,
`friction gate` asks: *has this map earned autonomy?* The measured answer
today is no — so it routes the change to **human verification: run
everything, don't gamble.** That refusal is the triage working. The
autonomous path (`SKIP_SAFE`, exit 0 — the AI can handle it) exists and is
tested: it requires the measured recall's one-sided 95% lower bound to
clear the bar, so no small-sample fluke can grant autonomy — and it unlocks
the day a graph class earns that. None has yet.

It plugs in three places, all built and working:

1. **Your CI** — a failed gate blocks the merge (and can show up in GitHub's
   security tab as an "unsafe test skip" finding).
2. **The AI agent itself** — over MCP, the agent asks the gate before
   trusting its own map, and backs off when refused.
3. **Your terminal** — point it at any repo:
   `friction gate --repo . --changed <file>`.

**Install the bot in any repo — two minutes, ten lines.** Every PR gets a
triage label (`triage/human-verification` · `triage/needs-human` ·
`triage/out-of-scope` · `triage/ai-autonomy`) and a comment with the
evidence — including the **review focus**: which handful of tests the graph's
evidence points at, so the human head-starts instead of starting cold.

```yaml
# .github/workflows/triage.yml
name: Triage
on: {pull_request: {types: [opened, synchronize, reopened]}}
permissions: {issues: write, pull-requests: write, contents: read}
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: areycruzer/substrate-friction@main
```

Optional `.github/friction-policy.yml` sets your own bar (`threshold: 0.95`
is the shipped default; a non-default bar is loudly disclosed in every
comment). Live proof: this repo triages [its own pull requests](https://github.com/areycruzer/substrate-friction/pulls?q=is%3Apr).

Everything below is the deep version — how the map was measured, in a graph
database, with every number re-checkable by one command. The presenter's
plain-language cheat-sheet is [`docs/MINDMAP.md`](docs/MINDMAP.md); the
honest 10-parameter self-assessment, receipts included, is
[`docs/scorecard.md`](docs/scorecard.md). The
problem itself is not our claim: ten independent, citable facts — an
acquired ML-test-skipping industry, measured CI-cost pressure, documented
agent short-cutting, and an empty certification seat — are collected in
[`docs/market.md`](docs/market.md).

---

## What it is

**Origin → now, in one table** (the long version is
[`docs/ORIGIN.md`](docs/ORIGIN.md); the founding brief is committed verbatim):

| | The original bet (Aug 12) | What shipped (and why it is stronger) |
|---|---|---|
| Question | Will the *agent* fail this ticket? | Can the *graph* reach the tests that guard this change? |
| Answerable from a graph? | No — held-out AUC **0.483**, at/below chance | Yes — deterministic: it reaches or it does not |
| Verdict | "route to human" (predicted, probabilistic) | `RUN_FULL`, exit 1 (measured, fail-closed) |
| Fate of the metric | six "friction" components, retracted twice | one recall number, negative-controlled 0.545→0.000 |
| What survived | the *instinct* — abstain when evidence is thin | the instinct, with a measurement under it |

Take one SWE-bench ticket. To reason about it structurally you first need a
call graph, and *how you build that graph* is a choice with consequences nobody
in this space had measured against a type-resolved reference on real code. We
build the same repository two ways and compare them edge-for-edge:

- **Arm A — name-matched.** A call `x.foo()` becomes an edge to *every*
  function named `foo`. This is how Aider's repo map, RepoGraph
  (arXiv 2410.14684), and LocAgent (arXiv 2503.09089) build their graphs.
- **Arm B — type-resolved.** The same repository indexed with `scip-python`
  (pyright-backed), so `x.foo()` resolves on the *actual static type* of `x`,
  or to nothing when the receiver's type is unknown.

Same repo, same commit, same extraction of definitions. Only edge resolution
differs. Both arms are resident in one HydraDB engine at once, in disjoint id
bands, so the comparison is a single-engine operation.

![Pipeline: sources feed both arms, both arms load one digest-pinned engine, four surfaces come out](docs/plots/architecture.svg)
*The compact pipeline. Generated by `scripts/render_assets.py`.*

![System diagram: labels and repos feed three arms, an identity join and the engine feed five measurements, one committed artifact feeds five surfaces, friction verify closes the loop](docs/plots/system-diagram.svg)
*The full system — every figure flows left to right into one committed artifact, and `friction verify` closes the loop. Generated by `scripts/render_figures.py`.*

| **The gate** | **The measurement** | **The certified graph** |
|---|---|---|
| `friction gate` — recall vs labels becomes an exit code. `--repo` gates your checkout; `--instance --live` executes in-engine with parity asserted; `--sarif` emits a code-scanning finding; `--split` reports the pinned holdout. | Two arms diffed edge-for-edge (`docs/graph-delta.md`), direction measured (`docs/connectivity.md`), dynamic traces folded in (`docs/covers.md`), the anti-join reproduced *inside* the engine (`docs/engine-diff.md`). | `data/shipped/consensus.json` + MCP `graph_query`: every edge labelled `confirmed` / `name_only` with arm provenance, source commit and engine digest — a graph with receipts (`docs/certified-graph.md`). |

### Quickstart

```bash
git clone https://github.com/areycruzer/substrate-friction && cd substrate-friction
./setup.sh                                   # engine up, package installed, shipped
                                             # working set loaded, live gate warmed
friction gate --arm arm_b                    # the verdict (exit 1: RUN_FULL)
friction gate --instance django__django-11551 --live   # engine executes it, parity asserted
friction diff --live                         # the anti-join, in-engine
friction gate --distance                     # every class's distance from the bar — the chances, computed
friction run --repo /tmp/fastapi --changed fastapi/routing.py   # the executor: selected few + full-suite fallback, always together
friction verify --certificate cert.json      # a build certificate: figures, artifact digest, head, timestamp
friction verify                              # re-derive every shipped figure
```

`setup.sh` runs from a clean clone with no manual steps (cold: about 77 s to a
working gate — honest, not sub-60s). Cache-backed commands (`compare`,
`precision`, `connectivity`, `eval`, `list`) read committed reports and need no
engine; `gate --live`, `diff --live`, `check` and `serve` touch the running
engine. The 7-repo corpus itself (~4.5 GB) cannot ship in a 50 MB payload; what
ships is its committed output — per-instance outcomes in
`data/shipped/gate-results.json`, re-derivable by `friction verify` — with the
cut documented in [`data/shipped/README.md`](data/shipped/README.md).

**CLI:** `friction gate / verify / diff / check / compare / precision / connectivity / eval / list / serve / triage`.
**API:** `GET /health /gate /gate/{id} /instances /check/{id} /compare/{id} /precision /connectivity`.

### Triage any PR or issue on GitHub

Paste a link, get the tier — the change's real diff (or an issue's disclosed
fix-file candidates), the live gate, and a four-tier verdict:

```bash
friction triage https://github.com/fastapi/fastapi/pull/16159
# tier: human-verification — blast radius 23 of 846 tests, prior + bound, exit 1
friction triage https://github.com/fastapi/fastapi/issues/16010
# issues that NAME their files: disclosed text mentions (fail-closed regardless);
# issues that name none are triaged out-of-scope — we do not guess
```

Or install it on any repository as a GitHub Action — every PR gets a triage
label and a verdict comment, numbers emitted by the gate itself:

```yaml
# .github/workflows/triage.yml — in YOUR repo
name: Triage
on: pull_request
permissions:
  issues: write
  pull-requests: write
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: areycruzer/substrate-friction@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

Four tiers, three of which vary per PR today: `triage/ai-autonomy` (the
recall's one-sided 95% lower bound cleared the bar — statistical unlock only),
`triage/human-verification` (measured refusal; the comment carries the blast
radius, selected tests, prior and bound), `triage/needs-human` (the gate is
blind on this change: unresolved files, no tests, or a truncated walk), and
`triage/out-of-scope` (no Python signal — no clone, no graph, ~1 s). This
repository dogfoods the action on its own PRs (`.github/workflows/triage.yml`).
Every comment now carries a **snapshot id** (graph digest @ commit — same
pair, same verdict; drift means re-triage), **evidence chains** (the actual
change → … → test call path per selected test), ranked tests-to-watch, a
generated-file provenance warning, and the **runnable pytest command** for
the selected few beside the full-suite fallback. One invariant underneath it
all: *no test is skipped on an unmeasured graph — the gate re-proves it on
every PR.*

Two scope statements, so nothing overreads: *autonomy* here means autonomous
**test selection** on a proven graph class — nothing is claimed about
end-to-end agent outcomes; and the counts in the comment are graph symbols
matching test markers, not framework-collected node IDs.

Want to see the autonomous tier fire once? `uv run python scripts/unlock_demo.py`
builds a **disclosed synthetic** 99/100 recall audit and shows the gate opening —
`SKIP_SAFE`, exit 0 — the way a real graph class would have to earn it (the
Wilson lower bound clearing the bar). No measured class is there yet; the demo
exists so the unlock is visible, not hypothetical.

### Use it from a coding agent (MCP)

The 2026 abstention literature (AgentAbstain, ReDAct) has agents defer on their
own *internal* uncertainty — and finds that ability does not scale with model
size. The gate supplies the missing **external** signal: any agent conclusion
built on a graph traversal — affected tests, blast radius, related files —
inherits that graph's recall.

```json
{"mcpServers": {"substrate-friction": {"command": "friction-mcp"}}}
```

Three task-shaped tools (several targets per call, one round trip):
`gate_check` — is a skip defensible on this graph class? — `gate_explain` —
replay labelled instances, dropped guarding tests and the engine Cypher
included — and `graph_query` — certified edges with trust labels and
provenance. Open-source engine and committed corpus only; no hosted service,
no credentials.

---

## The verdict

On **172 labelled SWE-bench instances across 7 repositories** (study S1,
`docs/studies.md`; emitted by `scripts/gate_corpus.py`):

| Graph | Recall of the guarding test | Safe to skip? |
|---|---|---|
| Name-matched — the class Aider, RepoGraph and LocAgent build | **0.314** (37/118) | **No** |
| Type-resolved — scip-python / pyright | **0.419** (72/172) pooled · **0.545** (24/44) django | **No** |
| Type-resolved + dynamic execution traces (django subset) | **0.67** (12/18) | **No** |

![The verdict flow: change, bounded walk, graph-complete is not program-complete, measured recall, RUN_FULL exit 1](docs/plots/verdict-flow.svg)
*The decision, end to end — fail-closed by construction. Generated by `scripts/render_figures.py`.*

![Recall of every graph class vs the 0.95 bar](docs/plots/fig-recall.svg)
*Every class refuses. Source: `data/shipped/gate-results.json` + `docs/covers.md`.*

![Per-repo recall spread on the type-resolved arm](docs/plots/fig-perrepo.svg)
*The per-repo spread — 1.00 down to 0.00 — is itself the finding. Source: `data/shipped/gate-results.json`.*

Bar for skipping: 0.95 (a CLI flag). Nothing measured here comes close, the
ranking does not depend on where the bar sits, and **a gate that refuses below
0.95 is the product working** — RUN_FULL with exit code 1 is the intended CI
semantics, not a failure mode.

Per-repo spread is enormous — django 24/44, xarray 19/21, **matplotlib 0/33
and pytest 0/19** (guarding tests in a *different graph component*: dynamic
dispatch is invisible to both extractors), and two tiny repos at 1.0
(requests 8/8, sympy 3/3 — n too small to clear any bar). Full table and
Wilson intervals: [`docs/gate.md`](docs/gate.md).

**"Use a better extractor" is not a fix.** The full name-match → pyright
type-resolution upgrade moves paired recall by **+0.071** (n=28, exact McNemar
p=0.73). Sui et al. (ICSE 2020) reported the same separation for Java:
precision and recall of a static analysis are separate concerns.

---

## How HydraDB is used

**Both arms resident at once, in disjoint id bands.** Arm A and arm B of the same commit live in one `default` graph in non-overlapping integer-`id` bands, so "diff the name-matched graph against the type-resolved graph" is a single-engine operation, not a cross-database join. Every edge count in the substrate measurement depends on this.

**Bounded reachability, in-engine.** `MATCH (s {id:N})-[:CALLS*1..k]->(n) RETURN count(*)` lowers to a masked GraphBLAS BFS whose cost is `O(m)` per hop, bounded by the *visited set*, not by walk volume. The frontier is finite; the path set is not. That is why the cost is bounded by the reachable-set size and always returns — flat in `k` for a typical source, and still only a few seconds from the busiest hub (`docs/latency.md`) — where enumeration is exponential in `k`. The variable-length pattern carries a mandatory upper bound, is single-typed, and matches on integer `id`.

**The anti-join, in-engine.** `friction diff --live` reifies every compared edge as a node and every distinct `(src, dst)` identity as a `Sig` node, then asks the engine — per arm-A edge, as a 2-hop bounded outward traversal at **2.0 ms** each — whether any arm-B edge shares its signature. The engine's answer, **4,381 confirmed / 1,492 unconfirmed, exactly reproduces the offline join and is enforced by exception** (`docs/engine-diff.md`). The image is **pinned by digest** — the exact build every number was measured against.

**Why a vector index structurally cannot do this.** The relations here — a bounded reachable set, a directed `test → fix` connection, the confirmed-vs-unconfirmed edge split — are defined over **reachable sets and cuts in a specific edge set.** Paths and cuts do not exist in an embedding space. Two functions with near-identical text sit adjacent in vector space while lying on completely disconnected call paths; nearest-neighbour retrieval is blind to precisely the property being measured.

_Source: `docs/latency.md`, `docs/engine-diff.md`, `src/friction/reach.py`, `src/friction/engine_diff.py`, `tests/test_reach.py` (`@pytest.mark.engine`), `docs/engine-scaling.md`. Pinned engine commit `02a40025d2d57e97ab2754c8256219cdbfeab379` (v0.1.1, AGPL-3.0), image `ghcr.io/hydra-db/hydradb@sha256:db78309a…` in `docker-compose.yml`._

---

## How we know this is real

Rigor is a feature. Every claim below is a committed, runnable check.

- **Pre-registered studies** (`docs/studies.md`) — hypothesis, data, metric and
  analysis plan written **before** each run. Two hypotheses came back wrong
  (S1: pooled recall is *below* the django band; S3: unique-name edges
  dominate, not builtin collisions) and ship as-written.
![Negative control: recall falls monotonically from 0.545 to zero as edges are deleted](docs/plots/fig-negative-control.svg)
*The instrument detects degradation, provably. Source: `docs/negative-control.md`.*

- **The negative control** (`docs/negative-control.md`) — delete a seeded
  random fraction of edges and recall falls monotonically **0.545 → 0.455 →
  0.295 → 0.068 → 0.000**, reproducing the headline exactly at 0% deletion. An
  instrument that always said RUN_FULL would be measuring nothing; this one
  provably is not.
- **The auditor is audited** (`docs/audit-the-auditor.md`, study S2) — arm B,
  the reference every precision figure is measured against, misses **1/12**
  execution-proven connections on the traced subset — reported as a **floor**
  (trace mapping runs 15–67%), and exactly the direction the ceiling framing
  assumed.
- **Fidelity to deployed tools** (`docs/fidelity-differential.md`) — running
  **aider's actual `RepoMap.get_tags`** on the same files: **119/119**
  definitions seen by arm A (2-file spot-check; edge-level claims explicitly
  out of scope — aider builds no edges).
- **`friction verify`** — independently re-audits the shipped graphs,
  re-derives the corpus summary from per-instance rows, and asserts the
  README *and the website* quote the artifact exactly. Nonzero exit on any
  drift — it caught a real one on its first run.
- **The pinned split** (`data/shipped/split.json`) — dev/sealed partition by
  `sha256(instance_id)`, committed **before** measurement. No fitted
  parameters exist, so this is a consistency check, not a train/test split:
  dev 0.548 vs sealed 0.538 on arm B (`docs/gate.md`).
- **In-engine parity, everywhere** — `gate --live` and `diff --live` must
  agree exactly with their offline counterparts or they refuse to answer.
- **The abstention loop is demonstrated, not argued**
  (`docs/abstention-demo.md`) — a real MCP client over stdio calls
  `gate_check` and changes behaviour on the verdict; the decision policy is
  scripted and disclosed as such.
- **The repo gates itself** — `.github/workflows/self-gate.yml` runs
  `friction gate --repo src` on our own package every push and asserts the
  gate *refuses*; the corpus verdict ships as a SARIF code-scanning finding.
  Live verdicts carry a **staleness fingerprint** (`graph_sha` + repo HEAD).
- **The origin is the integrity proof** (`docs/ORIGIN.md`) — the actual plan
  series, superseded versions included: the dream, the protocol that killed
  it, and what the autopsy found.

---

## The measurement findings

### Finding 1 — the substrate: what name matching costs

On django (commit `b9cf764`), arm A produced 18,774 call edges. Restricting to edges whose source is in scope and mappable onto the shared identity space leaves **5,873** arm-A edges to compare against arm B's internal edges:

| Measure | Value |
|---|---:|
| Compared (in scope) | **5,873** |
| Confirmed by arm B (both) | **4,381** |
| In arm A only, unconfirmed | **1,492** |
| True edges arm A missed (only in arm B) | **8,064** |
| **Arm A precision (ceiling)** | **0.746** |
| Arm A recall of the true graph | **0.352** |
| Jaccard | **0.3143** |

![Pruning wrong edges on django-11490: 21 name-matched edges, 12 confirmed, 9 unconfirmed in red](docs/plots/prune.png)
*The fix-site neighbourhood of `get_combinator_sql()` in `django__django-11490`: the name-matched arm draws **21** edges; type resolution confirms **12** and leaves **9** unconfirmed (red) — four of the nine are one `list.extend` collision. Source: `docs/demo.html`, `docs/graph-delta.md`.*

![Where unconfirmed name-matched edges point: extend, lower, cursor, import_module, search](docs/plots/fig-offenders.svg)
*Source: `docs/graph-delta.md`; the `cursor` block is the counter-example where arm A was right.*

The unconfirmed edges are not random. They cluster on container-method names that collide across the codebase, and the full 1,492 are classified by deterministic rules in **the wrong-edge taxonomy** (`docs/edge-taxonomy.md`, study S3): `unique_unconfirmed` **70.5%**, `builtin_method` 21.4%, `ambiguous_name` 7.9%, `dunder` 0.1%.

**`0.746` is a ceiling — read it in both directions.** pyright emits **no** occurrence when a receiver's type is unknown; it never invents an edge. So an arm-A edge missing from arm B is *either* a genuine false positive *or* a real call pyright declined to resolve. True precision is `>= 0.746`, never `<=`. The `cursor` block of **54** unconfirmed edges is the clean counter-example: real `self.connection.cursor()` calls on an untyped receiver — **arm A was right and the type-resolved graph is the incomplete one.** The taxonomy's 70.5% `unique_unconfirmed` share says this class dominates.

**What the wrong edges cost — a projection, not a measurement.** Projected localization cost of a name-matched graph of this quality: **1.2pp to 2.0pp** of resolve rate (interval `[0.0119, 0.0197]`). This is **an analogy to ARISE's published ablation band (arXiv 2605.03117: resolve 17.3% → 22.0%), not a resolve-rate delta we measured** — we did not run SWE-bench. Corroborating, cited not reproduced: SHERLOC (arXiv 2606.24820) +5.95pp mean with negative transfer from bad localization; RGFL (arXiv 2601.18044) wrong-element localization implicated in 53% of unresolved instances.

_Source: `docs/precision.md`, `docs/graph-delta.md`. Reproduce: `uv run python scripts/graph_delta.py --repo data/repos/django --out docs/graph-delta.md`._

### Finding 2 — direction: the relation every prior version measured backwards

Measured over 44 django instances carrying both endpoint sets, bounded at 6 hops:

| Direction | Connected | What it means |
|---|---:|---|
| **fix → test** (directed) | **0/44 (0%)** | Code does not call tests. The direction every prior spec used was backwards. |
| **test → fix** (directed) | **24/44 (55%)** | The clean semantic: tests call the code they exercise. |
| **undirected** | **43/44 (98%)** | "Shares a neighbourhood" — *not* "the test exercises this code." |

![Direction: fix-to-test 0%, test-to-fix 55%, undirected 98%](docs/plots/fig-direction.svg)
*Source: `docs/connectivity.md`.*

The jump from 55% to 98% is the pytest fixture / `setUp` / `parametrize` / framework-dispatch closure: a test reaches its code through dispatch a static call graph structurally cannot record. **Every v1/v2 friction number used `relDirection: 'both'`** and therefore measured the weaker symmetric property. Report the two measures separately; never present the undirected number as coverage.

_Source: `docs/connectivity.md`._

### Finding 3 — dynamic COVERS: what execution recovers, and what it cannot

The build spec called an executed `Test -> Function` edge "the important one and the hardest to get right." `src/friction/trace.py` + `src/friction/covers3.py` build it: each instance's own `FAIL_TO_PASS` tests run under `sys.settrace` at `base_commit` in a version-matched `uv`-provisioned interpreter. **18 instances traced live, all succeeded** (~2 s per test module; e.g. `django__django-11163`: 5,921 call edges / 3,215 functions / 6.9 s). 63% of fix sites have their module executed.

Folding COVERS in moves the directed gate **11/18 → 12/18 (61% → 67%)** — one instance flips (`django__django-11265`). Real and modest; it does not rescue anything and we do not claim it does. The residual is diagnosed, not hand-waved: strict mapping reaches only **27.6%** of executed edges because `type(self).__name__` gives the **runtime subclass** while the code object's file is the **base-class definition site** — runtime identity and definition-site identity disagree, which corroborates the substrate headline from the dynamic side. (The first run mapped 0.3% due to an unqualified-name artifact — see the retractions section; the correction is recorded in `docs/covers.md`, not silently replaced.)

_Source: `docs/covers.md`. The full schema census (5 node types, 7 edge types, `COVERS` as a sparse honest overlay of 36 edges vs 57,314 `CALLS`) is in `docs/schema.md`._

### Finding 4 — the engine: bounded reachability vs the enumeration wall

The metric the original spec asked for — bounded path *counts* between node sets — is **#P-complete** (Valiant 1979). On a dense django graph the engine's `algo.MSpaths` enumeration hit the hard **30,000 ms** timeout. The tractable reformulation is bounded reachable-set size via `count(*)`, exact against a networkx reference at every k (a standing `@pytest.mark.engine` test).

![Reachability latency vs the enumeration wall, log scale](docs/plots/fig-latency.svg)
*Measured on one 34,000-node django-density graph: `count(*)` answers in 6–10 ms typical / ≤6.5 s from the busiest hub; enumeration costs ~15–24 s and times out in cold runs. Honest ratio ~1,500–2,300× at the typical operating point, unbounded at the hub. Source: `docs/latency.md` (the earlier single "~2,500×" compared two different graphs and is retracted — see below).*

**Syntax findings that matter:** `RETURN count(n)` after a traversal is rejected (`count(*)` is the working form), and incoming variable-length patterns are rejected outright — the backwards walk is an outward walk over a materialised `CALLED_BY` relation. Both are encoded in `docs/engine-capabilities.md` and exercised by CI.

### Finding 5 — budget curves: what a context window costs

![Recall vs identifier budget: both arms collapse under top-K truncation](docs/plots/budget-curves.svg)
*Study S4 (`docs/budget-curves.md`, drawn from `data/shipped/budget-curves.json` by `scripts/render_assets.py`): keeping the top-K PageRank identifiers — what a repo map does — collapses guarding-test recall to 0/44 (arm B) for K ≤ 200; the full-graph row reproduces the gate headline exactly. A repo map is a second truncation stacked on an already-lossy graph.*

### Finding 6 — the longitudinal ceiling: flat across eight years

![The longitudinal ceiling: flat at ~0.75 across django 1.11 to 5.0](docs/plots/fig-longitudinal.svg)
*Five eras, one flat line. Source: `data/shipped/longitudinal.json`.*

Study S5 (`docs/longitudinal.md`, pre-registered): the same two-arm pipeline
applied to django at 1.11 / 2.2 / 3.2 / 4.2 / 5.0. The registered hypothesis —
that the ceiling declines as a codebase grows — is **wrong, the third
falsified pre-registration in this project**: the ceiling sits flat in a
~0.75 band (0.753 / 0.749 / 0.757 / 0.762 / 0.758) while the graph grows.
Name-match imprecision is a **stable property of the technique at any scale**,
which makes the 0.746 headline a durable constant of the substrate, not a
snapshot — and means waiting for the problem to change is not a strategy. No
prior art measures graph-fidelity drift over a project lifetime.

---

## Retracted results, kept on purpose

Three figures were withdrawn during this project. They stay published, with
causes, because the discipline that caught them is the same discipline the
product sells.

**1. The v1 predictor AUC (0.565).** *Claim:* directional structure predicts
per-instance agent failure. *Why retracted:* measured on a graph where
**73.9%** of resolved `CALLS` edges were name-collision artifacts (`super()` →
`BlockNode.super` **1,321×**, `.lower()` → a template filter, `.extend()` → a
GIS class) — it measured the artifacts, not the thesis. *Replaced by:* the
substrate measurement itself; the collisions became Finding 1 and the taxonomy.

**2. The v2 predictor AUC (0.631).** *Claim:* the friction score beats
baselines. *Why retracted:* computed from path multiplicity only (the cache
stored counts, not node lists) and it **lost to `patch_lines` at 0.637** — a
structure signal that loses to patch size is not evidence for the structure
thesis. *Replaced by:* the honest NO-GO below.

**3. The "~2,500×" latency ratio.** *Claim:* reachability beats enumeration by
~2,500×. *Why retracted:* it compared a 1,000-node graph's query against a
34,000-node graph's timeout. *Replaced by:* both queries measured on **one**
graph — ~1,500–2,300× typical, unbounded at the hub (`docs/latency.md`).

**The prediction idea itself is a reported NO-GO, and it is why the gate
exists.** At n=172, leave-one-repo-out (so repo identity cannot be memorised):
pooled held-out AUC of the structure features **0.483** (at or below chance)
vs `patch_lines` **0.628**; in-sample best feature 0.567 vs baseline 0.656;
DeLong **z = −1.996, p = 0.046**; bootstrap ΔAUC **−0.089, 95% CI [−0.178,
−0.003]**. Patch size wins, significantly. Per-repo held-out AUC: django 0.494,
matplotlib 0.474, pytest 0.444, requests 0.688, sphinx 0.551, xarray 0.620,
sympy n/a (single class). The repo-identity confound (AUC 0.596/0.613 under
weaker systems, 0.382 under the strong primary) is exactly what
leave-one-repo-out neutralises. By Hanley–McNeil, the observed 0.089 gap is
resolved; no smaller effect is distinguishable at n=172, and none is claimed.
Class balance 86 failed / 86 resolved; ground truth
`20241029_OpenHands-CodeAct-2.1-sonnet-20241022`.

The diagnosis: a call graph carries no information about whether a language
model will succeed. The gate asks the graph to report a property of *itself* —
deterministic, and measurable. *Source: `docs/evaluation.md`,
`docs/evaluation-v1-retracted.md`. Reproduce: `uv run python -m
friction.harness`.*

The dynamic-tracer identity artifact (0.3% mapping, false RED — corrected to
27.6%) is recorded in Finding 3 and `docs/covers.md` under the same policy:
corrections are reported, never silently replaced.

---

## What we do not claim

The strongest forms of the common objections — including two real bugs an
adversarial review found in the build window and were fixed same-day — are
**pre-filed, with status and receipts, in
[`docs/objections.md`](docs/objections.md)**. Highlights of what we do not
claim:

- **Per-instance failure prediction** — solved elsewhere at AUC **0.841**
  (Agent Psychometrics, arXiv 2604.00594; 0.787 from problem text alone,
  0.718 task-agnostic prior). Our features are not competitive and are not
  meant to be; those rows are published, not reproduced. GRADE
  (arXiv 2606.22741) predicts from the agent's *run* graph — adjacent, and it
  leaves the static repository call graph unclaimed.
- **A resolve-rate delta** — the 1.2–2.0pp localization cost is an analogy to
  ARISE's published band, never a measurement.
- **Comparability to PyCG/Java recall studies** — those measure single-edge
  presence; we measure bounded transitive reachability of a labelled pair, a
  harder relation.
- **That undirected connectivity means coverage** — it means "shares a
  neighbourhood," and is always labelled so.
- **A clean AUC ceiling** — label contamination is structural: SWE-Bench+
  (arXiv 2410.06992) measured 32.7% solution leakage / 31% weak tests; OpenAI
  reports 59.4% of o3's Verified failures were test flaws — and OpenAI has
  since [stopped evaluating on SWE-bench
  Verified](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/)
  for those reasons. FAIL_TO_PASS remains useful evidence for reachability;
  it is not whole-CI ground truth, and we do not treat it as one.

## Limitations

- **The engine CI job was red for a day, and the story is kept** — we
  mis-attributed it to a runner-filesystem bug, filed it upstream, then found
  the real cause by strace: our own gitignored `secrets/token` (Docker
  bind-mounts a missing path as a *directory*). We retracted the wrong
  conclusion on the issue itself, retitled it to the residual diagnosability
  ask, and the job is now **green on the runner** — boot, Bolt round trip,
  wipe-and-restart, full engine test suite
  ([#101](https://github.com/hydra-db/hydradb/issues/101)).
- **Precision is a ceiling** (arm B under-reports on untyped receivers), and
  the same property means arm B is a type-resolved *reference*, not ground
  truth — see study S2 for its own audited misses.
- **Python only; `maxLen 6`;** the type-resolved arm depends on
  scip-python/pyright and every reachability figure is bounded at 6 hops.
- **Seven repos, unevenly weighted, underpowered for small effects** — n=172
  (django 44, sphinx 44, matplotlib 33, xarray 21, pytest 19, requests 8,
  sympy 3) resolves the observed ~0.09 predictor gap (p=0.046) but not a
  general +0.05 effect (~584 needed); big scientific repos are
  under-represented because a full scip index runs 12–18+ min/instance.
- **COVERS is partial** — 27.6% strict mapping (runtime-class vs
  definition-site identity), and the v1 name-collision counts (e.g. `super()`
  → `BlockNode.super` 1,321×) are build-log figures from gitignored v1 caches,
  cited as such and not recomputable from committed data.

---

## Where this sits in the field

The full placement — 25 years of safe regression-test selection (Rothermel &
Harrold 1998; Legunsen FSE 2016), call-graph recall studies (Sui ICSE 2020;
PyCG ICSE 2021; *Total Recall?* ISSTA 2024), the 2026 agent-abstention
literature, and the category incumbent whose otherwise-exemplary benchmarks
measure everything downstream of its graph and never the graph itself — is in
[`docs/related-work.md`](docs/related-work.md). Where the commercial
selection market sits — and why it has no certification layer — is in
[`docs/market.md`](docs/market.md). What was reused from whom, and
what deliberately was not, is in [`docs/reuse-policy.md`](docs/reuse-policy.md).
Deliberately deferred work is one honest sentence each in
[`docs/future-work.md`](docs/future-work.md).

Two honest qualifications made there and repeated here: coverage-backed
selection (which the strongest incumbent uses for its test recommendations) is
genuinely stronger than static-graph selection, and our figures are **not
comparable** to PyCG's 70% or Java's 0.884 — those measure single-edge
presence; we measure bounded transitive reachability of a labelled pair, a
harder relation.

## Upstream contributions

Four contributions to `github.com/hydra-db/hydradb`, surfaced by this project:

- **[Issue #81](https://github.com/hydra-db/hydradb/issues/81)** — manifest GC fails under the documented `CLOUD_PROVIDER=local`: after enough sustained writes every write fails permanently while reads keep serving, so a read-only health check reports the node healthy while it is silently write-dead.
- **[PR #82](https://github.com/hydra-db/hydradb/pull/82)** — cypher-compatibility docs covering 7 measured behaviours of the pinned build (inlined-literal set queries, `count(*)` vs rejected `count(n)`, `SSpaths` integer `sourceNode`, and the rest).
- **[Issue #101](https://github.com/hydra-db/hydradb/issues/101)** — startup exits with a raw `Os {NotFound}/{IsADirectory}` when the auth-token file is missing or a directory; originally mis-filed as a runner-FS bootstrap bug, corrected on-thread after strace found the real cause (our gitignored secrets file), and retitled to the diagnosability ask: name the attempted path in the error.
- **[Issue #102](https://github.com/hydra-db/hydradb/issues/102)** — proposal for an `algo.RecallCert` procedure: in-engine certification of a selection result against labels, with `friction gate` as the motivating consumer.

## Attribution

- **HydraDB** graph engine, pinned at `02a40025d2d57e97ab2754c8256219cdbfeab379` (v0.1.1), **AGPL-3.0** — the graph substrate every measurement runs against.
- **SWE-bench** and the **SWE-bench/experiments** submissions — ground-truth instances and agent pass/fail labels.
- **`scip-python`** (pyright-backed) — the type-resolved arm B index.
- **tree-sitter** — the name-matched arm A parse.
- **aider** (Apache-2.0) — its real `RepoMap.get_tags` is executed in the fidelity spot-check.
- **Cytoscape.js** (MIT) — the offline interactive graph in `docs/demo.html` (vendored, no CDN).
- Cited literature, all published-not-reproduced: Agent Psychometrics (arXiv 2604.00594), GRADE (arXiv 2606.22741), ARISE (arXiv 2605.03117), SHERLOC (arXiv 2606.24820), RGFL (arXiv 2601.18044), RepoGraph (arXiv 2410.14684), LocAgent (arXiv 2503.09089), SWE-Bench+ (arXiv 2410.06992).
- **Claude** (Anthropic) assisted in building and measuring this project.

## License

This project is **MIT** (see `LICENSE`). The HydraDB engine it queries is **AGPL-3.0** and is used as a pinned external service, not vendored into this source tree; its license governs the engine binary independently of this project's MIT grant.
<!-- verified: the pinned action ran on this PR -->
<!-- engine-parity job proof -->
