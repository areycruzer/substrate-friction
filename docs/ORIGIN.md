# Origin: the dream, the protocol that killed it, and what the autopsy found

This project began as a different product: **predict, from repository graph
structure, whether an AI coding agent will fail a task — and route the hard
ones to a human.** The founding brief is committed verbatim at
[`docs/origin/2026-08-12-BUILD-SPEC.md`](origin/2026-08-12-BUILD-SPEC.md) —
"a pre-flight check that looks at the *structure* of the code around a bug and
predicts whether an AI coding agent will fail on it — before the agent burns
tokens trying." Its own Part 6 defined the GO/NO-GO bar that later killed it,
and its own Part 12 ordered us never to hide the negative result. The plans in
`docs/origin/` are the working documents that followed, superseded versions
included.

The arc they record:

1. **The dream** (plans of Aug 13–14): a six-component "friction" score over
   bounded paths between fix sites and guarding tests, with a pre-committed
   GO/NO-GO bar (AUC ≥ 0.65).
2. **The protocol killed it.** The metric was #P-complete as specified; the
   engine timed out at 30 s; the first two AUCs (0.565, 0.631) fell to
   measurement artifacts and were retracted; the fair leave-one-repo-out test
   at n=172 landed at **0.483 — at or below chance** — and patch size beat
   every structural feature, significantly ([story.md](story.md#retracted-results-kept-on-purpose), "Retracted results, kept
   on purpose").
3. **What the autopsy found** was worth more than the dream: the graphs
   themselves were the unmeasured variable. Precision ceiling 0.746; guarding
   tests reachable 55% (django) / 41.9% (7 repos); direction inverted in every
   prior version; the ceiling **flat across eight years** of django
   (`docs/longitudinal.md`). The gate — refuse to skip tests on an unmeasured
   graph — is that autopsy productised.

The original spec's rules did the killing: *do not hide a negative result* and
a pre-committed NO-GO bar. This document exists so the origin story is also
the integrity proof.
