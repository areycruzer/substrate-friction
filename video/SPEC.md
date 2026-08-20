# SPEC — substrate—friction product demo (Remotion)

## 1. Format

- **1080 × 1080 (1:1), 30 fps, 1440 frames = 48 s** (inside the 45–50 s target).
- Composition id: `Demo`. Silent-readable: every claim is on-screen text.
- Role: standalone branded demo covering the four required hackathon
  sections — problem (Act 1) → what we built (Act 2) → working demo
  (Acts 2–3) → HydraDB (Act 3) — plus proof + brand out (Act 4).

## 2. Structure — 4-act beat sheet (FRAME ranges, 30 fps)

| Act | Frames | % | Beat |
|---|---|---|---|
| 1 "The Ask" | **0–215** | 15% | Clean frame, headline, the command types itself at ~36 chars/s |
| 2 "The Handoff" | **216–575** | 25% | UI reacts: graph builds (shimmer), verdict card stamps, merge-blocked confirmation. Full stop №1 at ~560 |
| 3 "The Agent Works" | **576–1223** | 45% | **THE ONE HARD CUT at 576** into HydraDB. Toast→whip-pan×3 (10 fr, out-quint), parity/DROPPED stamp, 1 s hold at 940–970 (full stop №2), step panel ticks, bot PR card |
| 4 "Result + Brand" | **1224–1439** | 15% | 3-screen payoff montage (~30 fr each), endcard held 120 fr (4 s) |

Global rules honored: exactly ONE hard cut (frame 576); every spike →
settle; two full stops (≈560–575, ≈940–970); neutral `#000` dominant,
orange rationed to accents; 3 type tiers (VT323 display / JetBrains Mono
UI / Inter body); fixed disclaimer line bottom, never moves.

## 3. Brand tokens

- Background `#000000`, raised panel `#0a0a0a`, hover `#202020`
- Border `#2e2e2e` (1 px), strong `#353535` — **border-radius 0 everywhere**
- Accent `#ff571a` · warning `#f9c425` · ok green (terminal) `#2fbf71`
- Text `#ffffff` (headings) · `#dadada` (body) · `#747474` (muted)
- Fonts via `@remotion/google-fonts`: **VT323** (display), **JetBrains
  Mono** (UI/code — site's mono fallback), **Inter** (body)
- Wordmark: text `substrate—friction`, the `—` in `#ff571a`
- Logo asset: `public/substrate-tree.svg` (copied from docs/plots/), via `staticFile()`
- Micro-labels: uppercase, 18 px, letter-spacing 0.08 em, `#747474`, numbered (`01 /THE QUESTION`)
- Fixed disclaimer (all acts, bottom, 16 px muted): `every number on screen is emitted by a committed script · re-derive: friction verify`

## 4. Scene list

### Act 1 — frames 0–215 · micro-label `01 /THE QUESTION`
- **S1 · 0–95 · Headline.** Purpose: the problem in one read. Black frame,
  wordmark top-left fades in (spring). Headline (VT323, 76 px, white),
  lines staggered:
  - `AI AGENTS PICK WHICH TESTS TO RUN`
  - `USING A MAP OF YOUR CODE.` (second line, 20 fr later)
  - orange line, 20 fr later: `NOBODY CHECKED THE MAP.`
  Motion: opacity+translateY springs; settle by 90.
- **S2 · 95–215 · The command types itself.** Terminal panel (raised
  `#0a0a0a`, 1 px `#2e2e2e`, sharp corners, mac-less — just a title chip
  `friction · CLI`). Prompt `$ ` + typed at ~36 chars/s (≈1.2 chars/frame):
  `friction gate --repo fastapi --changed routing.py`
  (50 chars ≈ 42 fr: 100–142). Block cursor blinks (16-fr cycle). Enter
  flash at 150; output begins Act 2. Headline shrinks/slides up to make room.

### Act 2 — frames 216–575 · micro-label `02 /THE VERDICT`
- **S3 · 216–330 · The map builds.** Purpose: UI reacts, "working" status.
  In-terminal status rows appear with shimmer sweep (translating gradient
  highlight): `building the map…` then counters count up (interpolate):
  `1,551 nodes · 1,721 edges`, `799 tests found`, `23 tests selected`.
  Numbers tick as odometers; shimmer stops when each lands.
- **S4 · 330–470 · The verdict stamps.** Verdict card slides up (spring):
  header bar `[FAIL]  RUN_FULL` (white on `#ff571a`), rows (JetBrains Mono):
  - `measured test→fix recall   0.545`
  - `bar for skipping           0.95`
  - recall bar: 54.5% orange fill vs a `#f9c425` bar marker at 95%, fill
    animates 0→54.5% over 30 fr.
  Sub-line (Inter, `#dadada`): `the map missed roads — a skip would silently drop guarding tests`
- **S5 · 470–575 · The handoff moment.** Confirmation row appears:
  `run the FULL suite?` with an `APPROVE ✓` chip that gets a cursor-click
  ring at 520; on approve, stamped chip `exit 1 — merge blocked` (yellow
  border) springs in. Then everything settles; **full stop 560–575**
  (nothing moves but the cursor blink).

### Act 3 — frames 576–1223 · micro-label `03 /INSIDE HYDRADB` — THE HARD CUT
- **S6 · 576–700 · Load.** HARD CUT (no transition) to near-black stage,
  orange micro-label `03 /INSIDE HYDRADB`. Toast (bottom-left, 2–4 fr
  before the move): `loading both maps…`. Whip-pan (10 fr,
  Easing.bezier(0.16,1,0.3,1)) onto a load panel: odometer counters
  `28,353 nodes` / `61,536 edges`, chip `pinned engine · ghcr.io/hydra-db/hydradb@sha256:db78309a…`.
- **S7 · 700–850 · Walk in-engine.** Toast `walking CALLED_BY*1..6 in-engine…`
  → whip-pan to query panel (code block):
  `MATCH (s {id: …})-[:CALLED_BY*1..6]->(n) RETURN n.id`
  result row stamps: `engine  2.6 ms · 2 nodes reached`.
- **S8 · 850–1000 · The proof.** Toast `checking parity…` → whip-pan to
  stamp area. `parity = True` stamps (spring scale 1.6→1, green). 12 fr
  later: `DROPPED: 1 guarding test` stamps (yellow border), sub-line
  (Inter): `the engine itself proves the miss.` **Hold 940–970** — one
  full second, nothing moves.
- **S9 · 1000–1223 · Steps + the bot.** Left side panel (raised) with
  4 steps ticking top-to-bottom, ✓ stamps left-to-right with spring, 1 per
  ~50 fr: `load both maps ✓` (1005) · `walk in-engine ✓` (1055) ·
  `parity check ✓` (1105) · `verdict: RUN_FULL ✓` (1155).
  Main area: toast `triaging a real PR…` then GitHub-style bot comment
  card slides in (spring): avatar square, `substrate-friction (bot)`,
  label chip `triage/human-verification` (orange border), rows:
  - `blast radius: 1 of 316 tests`
  - `review focus — the head start: start where the graph points, finish everywhere.`

### Act 4 — frames 1224–1439 · micro-label `04 /PROOF`
- **S10 · 1224–1320 · Payoff montage** (~32 fr each, continuous slide, no cuts):
  1. Recall bars: `name-matched 31%` / `type-resolved 42%` vs `bar 95%`
     (bars animate), caption `measured on 172 real, human-labelled bug fixes`
  2. Install block (10-line YAML, code panel), caption `any repo · ten lines`
  3. `VERIFY OK` stamp, caption `one command re-derives every number`
- **S11 · 1320–1439 · Endcard.** Pixel tree (staticFile SVG, centered,
  gentle 1.02 scale drift), wordmark `substrate—friction` (VT323 96 px,
  `—` orange), tagline (Inter): `measure the map before you trust it.`,
  URL chip `github.com/areycruzer/substrate-friction`. Static from 1350 —
  **held 90+ fr (3 s ≥ 2 s minimum)**. Disclaimer line still fixed.

## 5. Numbers policy

Every on-screen number is a shipped, verify-asserted figure: 0.545/24-44,
0.95, 31%/42%, 172, 1,551/1,721/799/23 (live fastapi run), 28,353/61,536,
2.6 ms, parity/DROPPED (capture 03), 1 of 316 (capture 16), digest prefix.
No invented data anywhere — "fake realistic data" is NOT used; the real
product's real numbers are the demo data.

## 6. Audio (added)

All sound is **synthesized from scratch** (pure sine/noise synthesis, no
samples, no downloads — zero licensing exposure; generator committed in git
history, output WAVs in `public/audio/`):

- `music.wav` — the 48 s bed: A1 drone + soft 96 BPM eighth-note pulse;
  an energy lift (airy hats + added fifth) enters exactly at the hard cut
  (19.2 s / frame 576); fade-in 1.2 s, fade-out from 45.5 s. Volume 0.55.
- Cues (frame-accurate, see `src/Sfx.tsx` CUES map): typing roll
  (104–146, every 3 fr, deterministic velocity variation) · Enter thock
  (150) · panel rises (92/216) · verdict stamp (330) · APPROVE click
  (516) · merge-blocked stamp (526) · **hard-cut boom (576)** · whip-pan
  whooshes (700/850/1000/1256/1288) · engine tick (746) · parity stamp +
  chime (876/879) · DROPPED stamp (898) · step ticks
  (1005/1055/1105/1155) · VERIFY stamp + chime (1300/1303) · endcard
  rise + brand note (1320/1338).
- Mix discipline: music never exceeds 0.55; every spike-cue sits on a
  motion event that already exists on screen — no sound without a visual.
