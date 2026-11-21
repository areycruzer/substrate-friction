# Substrate Friction

A tool that measures whether a code call graph can reach the tests that guard a change, and refuses to let test selection skip tests when it cannot.

**TL;DR**
- Graph-based test selection skips the tests a call graph cannot reach from a change. This project measures how often that graph reaches the test known to guard a real bug fix.
- Result: on 172 labelled SWE-bench fixes across 7 repos, the type-resolved graph reaches the guarding test in 72/172 cases (recall 0.419), and in 24/44 on django (0.545). The bar for a safe skip is 0.95. Emitted by `scripts/gate_corpus.py`; full table in [`docs/gate.md`](docs/gate.md).
- Try it offline (needs [`uv`](https://docs.astral.sh/uv/), no engine or Docker): `git clone https://github.com/areycruzer/substrate-friction && cd substrate-friction && uv sync --extra dev && uv run friction verify` re-derives the shipped figures and checks that the README and docs quote them.

[![HydraDB verify](https://github.com/areycruzer/substrate-friction/actions/workflows/hydra-verify.yml/badge.svg)](https://github.com/areycruzer/substrate-friction/actions/workflows/hydra-verify.yml)
[![Self-gate](https://github.com/areycruzer/substrate-friction/actions/workflows/self-gate.yml/badge.svg)](https://github.com/areycruzer/substrate-friction/actions/workflows/self-gate.yml)

**Site:** [areycruzer.github.io/substrate-friction](https://areycruzer.github.io/substrate-friction) · **Full report:** [`docs/gate.md`](docs/gate.md) · **Full write-up:** [`docs/story.md`](docs/story.md)

## Quickstart

Offline. This needs only `uv`; no engine and no Docker.

```bash
git clone https://github.com/areycruzer/substrate-friction && cd substrate-friction
uv sync --extra dev
uv run friction verify             # re-derive every shipped figure; exit 0
uv run friction gate --arm arm_b   # the corpus verdict; exit 1 means RUN_FULL
uv run pytest -q -m "not engine"   # the test suite, no engine needed
```

With the HydraDB engine. This needs Docker.

```bash
./setup.sh                                                   # engine up, package installed, data loaded
uv run friction gate --instance django__django-11551 --live  # the engine runs the selection; parity is asserted
uv run friction diff --live                                  # the arm A vs arm B diff, computed in the engine
```

On a GitHub pull request, run `uv run friction triage <PR URL>`. To label every PR in your own repo, add this workflow:

```yaml
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

Coding agents can call the gate over MCP: `{"mcpServers": {"substrate-friction": {"command": "friction-mcp"}}}`.

## Results

We measured 172 labelled SWE-bench instances across 7 repositories (study S1 in [`docs/studies.md`](docs/studies.md)). A skip counts as safe only if recall reaches 0.95.

| Graph | Recall of the guarding test | Safe to skip? |
|---|---|---|
| Name-matched (how Aider, RepoGraph and LocAgent build graphs) | 0.314 (37/118) | No |
| Type-resolved (scip-python / pyright), pooled | 0.419 (72/172) | No |
| Type-resolved, django only | 0.545 (24/44) | No |
| Type-resolved plus dynamic execution traces (django subset) | 0.67 (12/18) | No |

| Finding | Figure | Details |
|---|---|---|
| Per-repo spread, type-resolved graph | xarray 19/21, django 24/44, matplotlib 0/33, pytest 0/19 | [`docs/gate.md`](docs/gate.md) |
| A better extractor (name match to pyright) | paired recall +0.071 (n=28, McNemar p=0.73) | [`docs/gate.md`](docs/gate.md) |
| Name-match precision on django (a ceiling) | 0.746 | [`docs/precision.md`](docs/precision.md) |
| That ceiling across django 1.11 to 5.0 | flat near 0.75 | [`docs/longitudinal.md`](docs/longitudinal.md) |
| Negative control: delete edges at random | recall falls from 0.545 to 0.000 | [`docs/negative-control.md`](docs/negative-control.md) |
| Arm diff computed inside HydraDB | 4,381 confirmed / 1,492 unconfirmed, equal to the offline join | [`docs/engine-diff.md`](docs/engine-diff.md) |
| Predicting agent failure from graph structure | held-out AUC 0.483 vs 0.628 for patch size (rejected) | [`docs/evaluation.md`](docs/evaluation.md) |

![Recall of every graph class vs the 0.95 bar](docs/plots/fig-recall.svg)

## How it works

1. Each SWE-bench fix comes with `FAIL_TO_PASS` tests. Those are the tests known to guard the fix, so they serve as labels.
2. We build the call graph of the repository at the fix's commit in two ways. Arm A matches calls by name: `x.foo()` links to every function named `foo`. Arm B uses `scip-python` (pyright), so `x.foo()` resolves on the static type of `x`, or to nothing.
3. Both arms load into one HydraDB engine, pinned by image digest, in separate id ranges. That makes the comparison a single-engine query.
4. From the changed function we walk backwards up to 6 hops and check whether a guarding test is reached. The hit rate across the corpus is the recall.
5. `friction gate` turns recall into an exit code. It returns `SKIP_SAFE` (exit 0) only when the one-sided 95% lower bound of recall clears the bar. Otherwise it returns `RUN_FULL` (exit 1), which means run the full suite. No measured graph class clears the bar today.
6. `friction verify` re-derives the shipped figures from the committed artifacts. It checks that this README, `docs/gate.md` and the site quote them exactly.

The gate is available as a CLI, an HTTP API (`friction serve`), an MCP server (`friction-mcp`), SARIF output for code scanning, and a GitHub Action that labels pull requests. This repo runs the action on its own PRs.

![Pipeline: sources feed both arms, both arms load one digest-pinned engine, four surfaces come out](docs/plots/architecture.svg)

The full system diagram is [`docs/plots/system-diagram.svg`](docs/plots/system-diagram.svg). The engine is HydraDB commit `02a40025d2d57e97ab2754c8256219cdbfeab379` (v0.1.1); the image digest is in `docker-compose.yml`. The full write-up, including how HydraDB is used and every finding, is [`docs/story.md`](docs/story.md).

## Repository layout

```
src/friction/       the package: graph builders, gate, verify, triage, CLI, HTTP API, MCP server
scripts/            measurement and figure scripts that produce every shipped number
tests/              pytest suite; tests that need a live engine are marked `engine`
data/shipped/       committed artifacts: both arms' graphs, gate-results.json, the pinned split
docs/               reports, pre-registered studies, retractions, and the GitHub Pages site
web/                source for the site front end
action.yml          composite GitHub Action for PR triage
docker-compose.yml  the digest-pinned HydraDB engine
setup.sh            one-step setup with the engine
```

## Limitations

- Labels come from SWE-bench `FAIL_TO_PASS`. They are good evidence for reachability, but they are not ground truth for a whole CI suite.
- Python only. Every reachability figure is bounded at 6 hops.
- Seven repos, unevenly weighted: n=172 (django 44, sphinx 44, matplotlib 33, xarray 21, pytest 19, requests 8, sympy 3). This sample cannot resolve small effects.
- Precision 0.746 is a ceiling. Arm B emits no edge when a receiver's type is unknown, so it is a type-resolved reference, not ground truth.
- Dynamic traces are partial. Strict mapping reaches 27.6% of executed edges.
- The full 7-repo corpus (about 4.5 GB) does not ship. Its per-instance outcomes do, in `data/shipped/gate-results.json`. See [`data/shipped/README.md`](data/shipped/README.md).
- The `SKIP_SAFE` path is tested but has not fired on any measured graph class. `uv run python scripts/unlock_demo.py` shows it on a disclosed synthetic audit.
- Three results were retracted during the project. They stay published with their causes in [`docs/story.md`](docs/story.md#retracted-results-kept-on-purpose). Known objections and our answers are in [`docs/objections.md`](docs/objections.md).

## Credits

Built by Swyam Sharma ([@areycruzer](https://github.com/areycruzer)) with Jayati Ahuja ([@JAYATIAHUJA](https://github.com/JAYATIAHUJA)) for Hack Hydra 2026 (Track 02B, Code as Graphs), where it placed 3rd. The submission package is [`docs/SUBMISSION.md`](docs/SUBMISSION.md).

We filed four findings upstream to HydraDB: [#81](https://github.com/hydra-db/hydradb/issues/81), [#82](https://github.com/hydra-db/hydradb/pull/82), [#101](https://github.com/hydra-db/hydradb/issues/101) and [#102](https://github.com/hydra-db/hydradb/issues/102).

Built on:
- **HydraDB** graph engine, pinned at v0.1.1, **AGPL-3.0**.
- **SWE-bench** and the **SWE-bench/experiments** submissions, for instances and labels.
- **scip-python** (pyright) for arm B and **tree-sitter** for arm A.
- **aider** (Apache-2.0), whose `RepoMap.get_tags` runs in the fidelity spot-check.
- **Cytoscape.js** (MIT), vendored for the offline graph in `docs/demo.html`.
- **Claude** (Anthropic) assisted in building and measuring this project.

Cited literature is listed in [`docs/story.md`](docs/story.md#attribution) and [`docs/related-work.md`](docs/related-work.md).

## License

This project is **MIT** (see `LICENSE`). The HydraDB engine it queries is **AGPL-3.0** and is used as a pinned external service, not vendored into this source tree; its license governs the engine binary independently of this project's MIT grant.
