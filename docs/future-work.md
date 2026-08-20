# Future work (locked scope — one honest sentence each)

- **Full bitemporal longitudinal study (0.746 ceiling at every django major,
  2015→2026):** needs sentinel-interval edges and per-era indexing far beyond
  the submission window.
- **In-engine consensus graph server at production scale:** the cached
  certified graph ships (`docs/certified-graph.md`); serving live multi-arm
  consensus needs ingestion throughput work first.
- **Language #2 (Java via SWE-bench-java + scip-java):** the oracle and
  pipeline port, the corpus build does not fit the window.
- **Field trial (the gate in a real repo's CI for weeks):** requires calendar
  time no hackathon has.
- **LLM-driven abstention on SWE-bench:** the loop is demonstrated with a real
  MCP client and a disclosed scripted policy (`docs/abstention-demo.md`);
  wiring it into an LLM agent and measuring behaviour change at scale is the
  study that follows.
- **Upstream `RecallCert` PR:** drafted in `docs/upstream-issues.md`; opening
  it before the sketch genuinely builds would be theatre.
- **Live public deployment:** the blocker turned out to be our own missing
  secrets file, not the engine (see the #101 correction) — genuinely unblocked
  now, but a demo link stood up in the final hours would not meet the
  fail-closed bar this repo holds itself to.
- **LLM-assisted deep classification of `unique_unconfirmed` edges:** the
  deterministic taxonomy ships; per-edge root-causing (dynamic receiver vs
  decorator vs re-export) wants careful method disclosure and a bigger
  manual sample than the window allows.


## The calibration roadmap (the path to a real positive)

The gate refuses every measured class today. The product becomes an
allocator when a class can *pass* — the roadmap, in order:

1. **Repo-specific labels from real CI history** — mine each repository's
   own fault-revealing tests (the change→test pairs its history recorded).
2. **Calibrated subgroups** — recall by extractor, package, and change
   type; permit selection only where a subgroup's Wilson lower bound
   clears the bar.
3. **Third oracles** — runtime coverage and mutation-based affected-test
   labels beside SWE-bench, with agreement/disagreement reported. The
   coverage oracle concretely: a small pytest plugin that records, per test
   executed, the set of source files/lines it touched (coverage contexts),
   and writes those as dynamic `COVERS` edges — the runtime evidence the
   static walk lacks, collected as a side effect of every normal suite run.
4. **Executor integration** — run the selected subset for real (the fail-closed
   executor pattern fellow entries already ship), so saved wall-clock time becomes the headline metric:
   "X% fewer tests, zero known fault-revealing tests missed, one-sided
   95% bound."
5. **Package split** — `graphguard-core` (parser + gate + Action, installs
   in seconds) separate from the research extras.
