# Objections, pre-filed

Every objection below is stated in its strongest form — several are quoted
nearly verbatim from adversarial reviews this repo was subjected to during
the build window (two real bugs were found that way and fixed same-day;
see §6, §10, §11). If you are about to raise one of these: it is already
filed here, with its status and receipts. The statuses mean:

- **fixed** — the objection named a defect; the defect is closed, with a test.
- **scoped** — the objection is correct about scope; the repo claims less
  than you feared, and says where.
- **declined** — the objection is a preference, and we prefer otherwise,
  with the reason stated.

---

## 1. "It computes `exit 1` with ~20,000 lines of supporting paperwork."
**declined.** The paperwork is the *measurement that would license a skip*.
Today no graph class earns one, so the visible behaviour is refusal — that
is what fail-closed means. The refusal is not a constant: since §6 the
decision is `wilson_lb(hits, n) ≥ bar`, so a future graph class that
actually clears the bar statistically opens the gate (`SKIP_SAFE`, exit 0,
tested at 99/100). Cost of the paperwork: the gate runs in seconds.
Cost of a refusal: zero extra test runs beyond the status quo — the full
suite is what you were running before you wanted to skip.

## 2. "The pivot is narrative taxidermy — a dead hypothesis with a new animal stapled on."
**scoped.** The first thesis (graph features predict which tickets agents
fail) was pre-registered (S1–S2, `docs/studies.md`) and killed by its own
protocol (held-out AUC 0.483; retraction kept at
`docs/evaluation-v1-retracted.md`). What survived is a different question
asked with the same instrument: *is the graph safe to select tests with?*
We do not claim the second question was the first one succeeding; we claim
the autopsy found something worth shipping. The full lineage — dream spec
verbatim, six daily plans, all falsifications — is the museum wing,
`docs/origin/`.

## 3. "Code graphs are used for navigation and retrieval, not just test selection. You attack a universality the tools don't claim."
**scoped.** We measure **test selection** only and claim nothing about
navigation, retrieval, or context construction (see [`story.md`](story.md#what-we-do-not-claim), *What we do
not claim*). Selection is singled out because it is the one use where a
wrong or missing edge **silently drops a test that guards the change** —
navigation errors are visible, selection errors are not. On the
navigation-adjacent axis we do have a result: the repo-map truncation
itself collapses recall (S4, `docs/budget-curves.md`: 0/44 for K ≤ 200).

## 4. "SWE-bench FAIL_TO_PASS is a narrow oracle — this is not whole-CI recall, not regression preservation, not agent repair."
**scoped.** Correct, and stated: FAIL_TO_PASS reachability measures exactly
one thing — does the bounded static walk reach the human-verified test that
catches this bug. It is also the only free, per-instance, human-verified
label that exists for this relation. Whole-suite CI recall and
regression-preservation are the next rungs (`docs/future-work.md`); we do
not claim them.

## 5. "The label depends on hindsight — fix sites are only known after the patch exists."
**scoped.** Yes. The pre-agent routing product (pick tickets *before* the
agent runs) was the falsified S2 idea. The gate as shipped is a
**post-change CI policy**: it runs when a diff exists
(`friction gate --repo . --changed <file>`), the same position a
test-selection step would occupy. The hindsight objection is an objection
to a product we retracted, not the one we shipped.

## 6. "The gate passes on a point estimate — sympy's 3/3 would clear 0.95. The prose understands uncertainty; the executable gate did not."
**fixed.** `friction.gate.wilson_lb` / `gate()` now require the one-sided
95% Wilson **lower bound** to clear the bar. A perfect 3/3 (LB ≈ 0.53)
refuses; 95/100 (LB ≈ 0.90) refuses with the reason named; 99/100 passes.
Tests pin all three (`tests/test_gate.py`). The rule is stated in
`docs/gate.md` next to the bar itself.

## 7. "The pooled prior is heterogeneous — per-repo recall spans 0.00 to 1.00 — and the decision threw per-repo evidence away."
**fixed (display) / declined (decision).** The live gate's prior note now
carries the per-repo range and the pooled lower bound, so nothing is hidden
at decision time. The decision itself remains pooled-by-class: a class
prior is the honest object until per-repo labelled histories exist. The
lower-bound rule (§6) is what makes heterogeneity bite — pooled LB ≈ 0.35
is nowhere near any bar.

## 8. "0.95 is a preference dressed as a gate."
**declined, with the preference exposed.** Safety bars are policy — 5σ,
99.9% SLAs, 0.95 here. The bar is a flag (`--threshold`); the *evidence*
side is now statistical (§6). Policy belongs to the user; the tool refuses
to let policy outrun evidence.

## 9. "No economic evaluation — minutes saved, cost of false skips, comparison against always-run."
**scoped.** Not shipped, honestly: no cost model is included. The
asymmetry that justifies shipping without one: a refusal costs ~0 extra
(if you were not planning to skip, the gate changes nothing), while a
wrong skip silently drops a guarding test. The time axis exists in
`docs/budget-curves.md` and `docs/throughput.md`. A full cost-sensitive
evaluation is future work and is written down as such.

## 10. "Live mode mixes extractors: `--arm arm_b` built the name-matched graph, labeled it arm B, and applied the arm-B prior."
**fixed.** Found by adversarial review in the build window and closed the
same day: live `--repo` extraction is name-matched, so the verdict is
always judged **and labeled** `arm_a` (`src/friction/cli.py`, `_gate_live`);
an arm-A walk can never wear an arm-B prior. Capture
`docs/captures/09-live-repo.txt` is re-recorded showing the honest label.

## 11. "An empty or broken live graph could inherit SKIP_SAFE from the corpus."
**fixed.** Live abstention, independent of the prior: changed files that
match no symbol, no resolved change sites, no recognised tests, or a
truncated walk each force RUN_FULL with the reason named
(`src/friction/live.py`). Also fixed from the same review: changed-file
matching is module-boundary safe (`core` no longer bleeds into `corex`),
and the graph fingerprint hashes symbol names, not isomorphic integers.

## 12. "`friction verify` re-checks committed outputs but cannot reconstruct the 4.5 GB corpus — 'every number re-checkable' needs an asterisk."
**scoped.** The reproduction ladder, stated plainly:
(1) `friction verify` — re-audits the shipped graphs and re-derives every
quoted figure from committed per-instance rows (seconds, offline);
(2) per-instance shipped graphs — django's arms and the shipped payload are
committed for replay;
(3) full corpus from source — scripted (`scripts/build_corpus3.py`,
`scripts/run_corpus_build.sh`) but ~4.5 GB and hours of extraction, so not
shipped in-repo. "Re-checkable" means (1) and (2); we never claimed (3) was
one command.

## 13. "The package is overgrown — evaluate.py, evaluate4.py, retracted reports, 500+ tests for four steps of logic."
**declined.** The museum wing is deliberate: the retracted results, the
generational evaluators, and the plan series are the provenance that makes
the honesty claims checkable. The production wing is small and findable:
`friction gate|verify`, `src/friction/gate.py`, `src/friction/live.py`.
A slimmed distribution is future work; the evidence stays.

---

*Strongest-form objections welcome — two of the fixes above (§6, §10–11)
were found exactly that way. File them; if they name a defect, they get
the same treatment: fixed, tested, and added to this page.*
