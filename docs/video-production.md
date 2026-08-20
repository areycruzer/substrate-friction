# VIDEO PRODUCTION PACKAGE — the whole thing, shot by shot (FINAL)

> **STATUS v3: final footage recorded and assembled** — the 2:51 pitch cut
> (`substrate-friction-demo-v3-silent.mp4`): landing-scroll intro, terminal
> proof, the PR list with every bot label, the live-engine parity shot, and
> the closing. Narration fitted to it: `docs/video-script.md`.
>
> Previous status: footage recorded and assembled. The 2:12 silent master
> (`substrate-friction-demo-silent.mp4`) was recorded live — every command
> real, screen-captured, machine-cut. The as-recorded narration with final
> timestamps lives in `docs/video-script.md`; the plan below is the
> reference it was shot from.

Hard cap **3:00**. Target cut **2:50–2:55**. Narration below is **~436
words** (≈2:49 at a brisk 155 wpm — rehearse once with a timer; trim
guidance at the bottom if you land hot).

**Research-backed structure** (Devpost judge interviews + winning-pitch
analyses): elevator pitch inside the first seconds; Problem → Solution →
Proof → **Potential**; show-don't-tell via edited real footage (judges respect
a smooth recording over a live crash); explicit requirement compliance —
some rubrics dock a point per 10 s over the cap, so the 2:55 ceiling is not
style, it is scoring. Footage may be speed-ramped; **audio is never
sped up**.

**The strategy, stated plainly:** a human judge feels the wow in the cold
open, the live-engine shot, and the bot working a stranger's real pull
request. An AI reviewer transcribes the audio and OCRs the frames — so every
rubric-relevant fact is **spoken in a full sentence AND visible as on-screen
text**. Section order is the required one: problem → what was built →
working demo → HydraDB. Every number spoken is either a committed,
verify-asserted number or is read off the live product output on screen.
Nothing is staged: every terminal shot is a real command, recorded live
(speed-ramped in edit where noted).

---

## Recording setup (10 minutes, do once)

- Terminal: full-screen, dark background `#0a0a0a` if your theme allows,
  font ≥ 18 pt (JetBrains Mono / Menlo), window ~120×34. Hide the prompt
  clutter: `export PS1="$ "`. The CLI ships a TUI in the HydraDB scheme
  (wordmark banner, `#ff571a` accents): it lights up automatically on a real
  terminal; if piping through `tee`/`script`, set `export FORCE_COLOR=1`
  first. Piped captures stay plain bytes — nothing committed changes.
- Working dir: repo root. Engine up: `docker compose up -d` (wait ~10 s).
  Pre-flight each command once OFF-camera so caches are warm. The triage
  shot needs network; pre-flight it too (and note its output can differ
  from the committed capture if the PR has moved — read the numbers off
  YOUR run, never dub numbers the screen doesn't show).
- Screen recorder: QuickTime (⌘⇧5, record selected portion) or OBS. Record
  each SHOT as a separate clip — you will speed-ramp and trim per clip.
- Browser shots: use the LIVE site (areycruzer.github.io/substrate-friction),
  window at ~1280 px, 100 % zoom.
- Voice: record narration separately over the assembled cut (any phone/mic in
  a quiet room beats live-narrating while typing).
- Fallback stills: every terminal shot has a committed capture in
  `docs/captures/` — if a live take misbehaves, screen-show the capture file
  in the same terminal (`less -R docs/captures/02-replay-10097.txt`).

---

**Burn a tiny section chip top-left of every shot**, mirroring the site's
numbered labels: `01/PROBLEM` `02/WHAT WE BUILT` `03/RESULTS` `04/LIVE DEMO`
`05/HYDRADB` `06/PROOF+POTENTIAL`. A judge (or an AI filter) checking "does
it cover the four required elements, in order?" sees the answer without
rewinding.

## THE TIMELINE

### SHOT 0 — COLD OPEN · 0:00–0:12 · [PROBLEM begins]

**Screen:** terminal, already-run: `friction gate --instance django__django-10097`
(capture 02). Zoom/crop so these three lines dominate:

```
walk was graph-complete           : True
NOT SELECTED — 370 guarding test node(s) are unreachable
```

**Narration:**
> "An AI tool just used its map of this code to pick which tests to run.
> The map says: done. It found **zero** of the **three hundred and seventy**
> tests that would catch this bug. Substrate Friction is the seatbelt that
> stops this."

**On-screen chip (burned in, bottom):** `substrate—friction · the seatbelt
for AI test-skipping`

**Edit:** freeze-frame on `370`, 1-beat silence. The wow and the elevator
pitch land together inside the first twelve seconds — judges reviewing
back-to-back know what this is before Shot 1.

---

### SHOT 1 — THE PROBLEM · 0:12–0:32

**Screen:** site hero → scroll to the WITHOUT/WITH columns → `verdict-flow.svg`
(hold on the yellow "≠ program-complete" box).

**Narration:**
> "Every AI coding tool draws a map of your code and trusts it to skip
> tests. The trap: a map can be perfectly drawn — and still missing roads a
> tool can never warn you about."

**On-screen text carried by the site itself:** "Graph-complete is not
program-complete."

---

### SHOT 2 — WHAT WE BUILT (+ the origin twist + THE BOT) · 0:32–1:04

**Screen:** `system-diagram.svg` full-frame (site §03), slow 5 % zoom-in.
At 0:48 cut to the README's **10-line bot install YAML** (the
`.github/workflows/triage.yml` block in the 60-second section) for 6 s —
this is the "any repo, two minutes" proof frame. At 0:58 flash the
Origin→Now table for 4 s.

**Narration:**
> "We started out predicting which tickets AI fails at. Our own rules
> killed that idea — so we asked a simpler question: is the map any good?
> Nobody had checked. We built the checker — the code mapped two ways, a
> HydraDB engine measuring, a seatbelt deciding — shipped five ways:
> command line, API, a tool the AI itself can ask, a security finding, and
> a bot that installs on any repo in ten lines and triages every pull
> request: safe for AI, or needs a human."

**Rubric coverage (spoken):** completeness surfaces enumerated; originality
(origin story + "nobody had checked"); the bot = day-one usefulness.

---

### SHOT 3 — THE NUMBERS · 1:04–1:26 · [RESULTS]

**Screen:** `fig-recall.svg` (4 s) → `fig-perrepo.svg` (4 s) →
`fig-longitudinal.svg` (hold).

**Narration:**
> "Tested against one hundred seventy-two real bug fixes: the map most
> tools use finds the bug-catching test thirty-one percent of the time. The
> careful map: forty-two. On two major projects: **never**. And across
> eight years of Django it never improved. Not a bug that ages out — it's
> how the map is made."

---

### SHOT 4 — LIVE DEMO · 1:26–2:16 · [WORKING DEMO]

Four real commands, recorded live, speed-ramped. Small caption chip
bottom-left names each command (OCR bait).

**4a (1:26–1:34)** `friction gate --arm arm_b` — hold on `[FAIL] RUN_FULL`
and the recall line; **exit code 1 visible** (`echo $?` after).
> "The seatbelt: hit rate measured, bar at ninety-five percent, verdict —
> run everything. Exit code one blocks the merge."

**4b (1:34–1:50)** `friction gate --instance django__django-11551 --live` —
**speed-ramp the 16 s load to 4 s** (timer chip "8×"), then REAL TIME on:
`engine 2.6 ms … parity=True … DROPPED`.
> "Now the graph database does it itself: sixty-one thousand connections
> loaded live, the check runs **inside HydraDB** in two-point-six
> milliseconds, matching our answer exactly — or refusing to answer at all."

**4c (1:50–2:07) — THE BOT ON A STRANGER'S PR**
`friction triage https://github.com/fastapi/fastapi/pull/13827` (fallback:
capture 16). Speed-ramp the fetch, then hold REAL TIME on the rendered
comment: the `human-verification` label, the **blast radius** line
(`1 of 316 tests`), and the **review focus — the head start** paragraph.
> "Here's the bot on a real FastAPI pull request it has never seen.
> Verdict in seconds: needs a human — start with this one test of three
> hundred sixteen. Even saying no, it hands the reviewer a head start."

*(If your live run prints different numbers — the PR moved — speak the
numbers on YOUR screen. Never dub a number the frame doesn't show.)*

**4d (2:07–2:16)** `uv run python scripts/abstention_demo.py` (capture 07) —
hold on `[agent] ABSTAIN … running the FULL suite`.
> "And an AI agent asks the seatbelt before trusting its own map — and
> backs off. That's the safety signal agents can't generate for
> themselves."

---

### SHOT 5 — HOW HYDRADB IS USED · 2:16–2:35 · [required section]

**Screen:** site §05 THE ENGINE → flash `fig-latency.svg` (3 s) → the
`friction diff --live` parity block (`CONFIRMED 4,381 / UNCONFIRMED 1,492 …
parity EXACT — enforced`, from `docs/engine-diff.md`) for 4 s → the four
upstream links in the footer.

**Narration:**
> "HydraDB holds both maps at once and answers in milliseconds where the
> naive approach hit a thirty-second wall. Even our headline number is computed in-engine,
> reproduced exactly or not at all. We pinned the build and sent four
> findings upstream — including one we got wrong and
> publicly retracted."

---

### SHOT 6 — PROOF + POTENTIAL · 2:35–2:55

**Screen:** `fig-negative-control.svg` (3 s) → terminal `friction verify` →
`VERIFY OK` (capture 08) → **`docs/scorecard.md` scrolled slowly for 3 s
(the receipts column visible)** → end card: site hero with the pixel tree,
URL + repo overlaid.

**Narration:**
> "Is this real? We broke our own meter on purpose — the score falls to
> zero, as it should. We published the predictions that came back wrong,
> scored ourselves out of a hundred, and showed every receipt. One command
> re-derives every number you just watched. Substrate Friction: measure the
> map before you trust it."

**Edit:** end card holds to exactly 2:50–2:55. HARD STOP before 3:00.

---

## AI-REVIEWER RUBRIC MAP (put this in the submission description too)

| Criterion | Timestamp | The exact spoken sentence that answers it |
|---|---|---|
| Problem | 0:00, 0:12 | "found zero of the 370 tests" / "can never warn you about a road its map doesn't have" |
| What was built | 0:32 | two arms + engine + "shipped five ways: CLI, API, MCP, security finding, bot" |
| Working demo | 1:26–2:16 | four live commands; exit code shown; parity shown; a real third-party PR triaged on camera |
| Use of HydraDB | 1:34 (in-engine selection + refuse-on-mismatch), 2:16 (in-engine anti-join, digest pin, latency, upstream ×4) | |
| Quality of results | 1:04 | n=172 / 7 repos, per-repo zeros, 8-year longitudinal flat ceiling |
| Originality | 0:32 (origin twist + "nobody had checked"), 1:04 flat-ceiling phenomenon, 2:07 abstention-over-MCP | |
| Day-one usefulness | 0:32 (ten-line install), 1:50 (head start on a PR the gate has never seen) | |
| Integrity (their tiebreak) | 2:35 | negative control, retractions kept, self-scorecard with receipts, `friction verify` |

**Submission description block (paste alongside the video URL):** one line
per row above + repo, site, and `docs/SUBMISSION.md` links — SUBMISSION.md
carries the **"verify this submission in 90 seconds"** claim→command table
and `docs/scorecard.md` carries the 10-parameter self-assessment. AI filters
read the description; give them the rubric answered in text as well.

## Shot-source checklist

| Shot | Live command | Fallback capture |
|---|---|---|
| 0 | `friction gate --instance django__django-10097` | captures/02 |
| 4a | `friction gate --arm arm_b; echo $?` | captures/01 |
| 4b | `friction gate --instance django__django-11551 --live` | captures/03 |
| 4c | `friction triage https://github.com/fastapi/fastapi/pull/13827` | captures/16 |
| 4d | `uv run python scripts/abstention_demo.py --out /tmp/a.md` | captures/07 |
| 5 | `friction diff --live` (result block only) | docs/engine-diff.md table |
| 6 | `friction verify` | captures/08 |
| bonus b-roll | `friction gate --repo src --changed friction/gate.py` (self-gate) | captures/09 |

## Edit timeline cheat-sheet

| Clip | Raw len | Treatment | Final |
|---|---|---|---|
| cold open | 6 s | freeze on 370 +1 s | 12 s |
| site scrolls | as recorded | 1.5× speed, cut on section starts | 20+32 s |
| bot-install YAML | still | hard cut in/out, no fade | 6 s |
| figures | stills | 3–5 s each, hard cuts, no fades | 22 s |
| 4b load | ~16 s | 8× ramp with "8×" chip, real-time for the 2.6 ms line | 16 s |
| 4c triage fetch | ~20–60 s | jump-cut to the rendered comment, hold the head-start line | 17 s |
| diff --live block | still | inside Shot 5, 4 s | — |
| scorecard scroll | ~6 s | 1.5× speed | 3 s |
| end card | still | og.png or site hero, URL text | 3–5 s |

Total ≈ 2:50–2:55. **If over:** cut the Origin table flash (−4 s), then
Shot 5's latency flash (−3 s), then shorten 4d to end at "backs off"
(−4 s). **Never cut the cold open, 4b, or 4c** — they carry problem,
engine depth, and day-one usefulness respectively.
