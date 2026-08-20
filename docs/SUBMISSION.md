# Submission package — Hack Hydra 2026, Track 02b

Deadline 2026-08-20 23:59 PT · form: forms.gle/GrMYKxLj9zPQcqqc8 · submit on the 19th.

## (a) Form answers

**Project name:** Substrate Friction

**One-paragraph description:**
The triage question every team now faces: this edit — can the AI handle it,
or does it need a human? Substrate Friction answers it by measuring the thing
the answer depends on: the code graph under the agent, and whether it can
actually reach the tests that guard a change. Against
SWE-bench FAIL_TO_PASS labels (the guard is known), name-matched graphs reach
it 31% of the time and full type resolution 42%, pooled over 172 instances in
7 repositories — and the imprecision is flat across eight years of Django, a
constant of the technique, not decay. `friction gate` turns that measurement
into a fail-closed triage verdict (exit 1: RUN_FULL — route to human
verification) delivered by CLI, HTTP, MCP,
SARIF, and a self-gating GitHub Action; `friction diff --live` makes HydraDB
itself compute the headline anti-join (edge reification, 2.0 ms/edge, exact
parity with the offline join enforced by exception); `friction verify`
re-derives every shipped figure. Three pre-registered hypotheses came back
wrong and ship as-written; three results were retracted and stay published
with causes. Four findings were filed upstream to the engine.

**Problem statement:**
Graph-based test selection is unsafe in a way invisible from inside the tool:
a backwards walk can be provably complete with respect to the graph while the
graph is missing the edge that mattered. An extractor cannot fail-closed on an
edge it never knew existed — so "graph-complete" silently masquerades as
"program-complete", and on one real Django instance a provably-complete walk
selected 0 of 370 guarding tests.

**Tech stack:** Python 3.12 + uv · HydraDB OSS (digest-pinned
`db78309a…`, source commit `02a40025`, Bolt) · tree-sitter (arm A) ·
scip-python/pyright (arm B) · sys.settrace dynamic tracer · NetworkX/SciPy ·
FastAPI · MCP (stdio) · SARIF/GitHub Actions · vanilla-JS site rendered from
the results artifact.

**How HydraDB is used (short form):** both arms of one commit resident in
disjoint id bands; bounded reachability via `count(*)` (exact vs NetworkX,
12 ms where enumeration hit the 30 s wall); the arm-diff computed *in-engine*
via edge reification; live gate replay with engine/offline parity enforced;
four upstream filings (#81, #82, #101, #102) including a new engine-dialect
finding (incoming variable-length MATCH rejected → materialised CALLED_BY).

**Team contribution note:** solo participant; Claude (Anthropic) assisted in
building and measuring, as attributed in the README. All commits inside the
hackathon window; measurement scripts, artifacts and retractions committed.

**Why this matters now (one sentence, for any "why you?" field):**
The creator of Jenkins built a company on ML test-skipping and CloudBees
bought it — skipping is where the industry is going, and nobody measures
the map they skip on (the receipts: `docs/market.md`); we are the
fail-closed tripwire that does, against human-verified ground truth.

## (b) Links

**The unlock, exhibited on a real PR:** [PR #4](https://github.com/areycruzer/substrate-friction/pull/4) —
labeled `triage/ai-autonomy` under a disclosed operator policy bar of 0.30
(the repo's policy file, since restored to the default 0.95): `SKIP_SAFE`,
exit 0, with the loud "policy bar ≠ default" disclosure. Same evidence at the
default bar refuses, as PRs #1–#3 show. The full ladder is live across four
PRs: human-verification (#1), out-of-scope (#2, #3), needs-human (#4's first
run — blindness beat the policy bar), ai-autonomy (#4's final run).

**Triage in action (live evidence):** [PR #1](https://github.com/areycruzer/substrate-friction/pull/1) —
the GitHub Action (any repo: 10 lines of YAML) labeled and commented its own PR:
`triage/human-verification`, the repo's real graph (1,175 nodes), blast radius
7 of 642 tests, the triage tests themselves as tests-to-watch. Workflow:
`.github/workflows/triage.yml`; composite action: `action.yml`.

- Repo: https://github.com/areycruzer/substrate-friction
- Site: https://areycruzer.github.io/substrate-friction
- Video: **https://youtu.be/5RH1bvMIUKo** (2:55 — problem → solution →
  live terminal proof → the bot's labels on real PRs → in-engine parity →
  receipts, narrated over the recorded product)
- Upstream: hydra-db/hydradb#81 · #82 (PR) · #101 · #102
- Evidence entry points: `docs/gate.md` · `docs/longitudinal.md` ·
  `docs/engine-diff.md` · `docs/studies.md` · `docs/ORIGIN.md`

## For AI reviewers — verify this submission in 90 seconds

This entry is designed to be machine-verifiable. Every claim below maps to a
command or artifact; nothing requires trust.

| Claim | Verify with |
|---|---|
| Every number is real and re-derivable | `uv run friction verify` → exit 0 (re-audits shipped graphs, re-derives the corpus summary from per-instance rows, asserts README **and site** quote the artifact exactly) |
| The test suite is real | `uv run pytest -q -m "not engine"` → 585+ passed; CI badge green on `main` |
| The measurement is real | `data/shipped/gate-results.json` — 172 per-instance outcomes; recompute any cell by hand |
| The product works on strangers' code | `friction triage https://github.com/fastapi/fastapi/pull/16159` — or read the dogfood PRs (#1–#4) this repo triaged on itself |
| The engine use is real | `docs/engine-diff.md` — the headline anti-join executed inside HydraDB, parity with the offline result enforced by exception; engine-parity job on every PR |
| The self-honesty is real | 3 falsified pre-registrations ([studies.md](studies.md)), 3 kept retractions (README §"Retracted results, kept on purpose"), a public upstream retraction ([hydradb#101](https://github.com/hydra-db/hydradb/issues/101)) |
| The self-assessment is calibrated | [docs/scorecard.md](scorecard.md) — 10 parameters, receipts per cell, and the sub-10 scores stated with their gaps |

Rubric map: problem → README §60-second + [market.md](market.md) · built →
README §What it is · demo → [walkthrough](https://areycruzer.github.io/substrate-friction/walkthrough.html) + video · HydraDB → README §How HydraDB is used ·
results → [gate.md](gate.md) · originality → [longitudinal.md](longitudinal.md) + [related-work.md](related-work.md).

## (c) Pre-submit checklist

- [ ] Fresh clone on a clean machine: `./setup.sh` completes
- [ ] `friction gate --arm arm_b` → RUN_FULL, exit **1** (by contract)
- [ ] `friction gate --instance django__django-11551 --live` → parity=True, exit 1
- [ ] `friction diff --live` → exit 0 (engine run, or pinned-result fallback on a clone)
- [ ] `friction verify` → exit **0**
- [ ] All three workflows green on latest main (HydraDB verify · Self-gate · Pages)
- [ ] Every README + site link opened in an incognito window; no 404s
- [ ] Video ≤ 3:00 and covers, in order: problem → what was built → working
      demo → how HydraDB is used
- [ ] Repo is **public**; LICENSE (MIT) present; no participant repo named in
      any shipped artifact (`grep` gate)
- [ ] Form submitted with the video URL filled in — **on 2026-08-19**
