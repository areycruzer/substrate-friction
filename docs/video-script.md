# Video narration — FINAL v3 (fitted to the 2:51 machine-cut master)

Read over `substrate-friction-demo-v3-silent.mp4` (2:51). ~395 words at a
calm 150 wpm — it fits with breathing room. The timestamps are when the
screen changes under you; the `·` marks are breaths. Record in one quiet
take on your phone, then hand the audio file back for muxing.

**Rule: speak only numbers the frame shows.**

## 0:00–0:08 · landing hero
> "Every AI coding agent navigates your code with a map — and decides
> which tests to run by trusting it."

## 0:08–0:16 · the quote
> "Everyone is making agents smarter. We asked the cheaper question nobody
> asked: · is the map itself any good?"

## 0:16–0:26 · the missing-edges graph
> "Here's the trap: your program has edges the map never recorded. The
> agent can finish its walk perfectly — and still miss the road that
> mattered."

## 0:26–0:40 · a gate under the agent
> "So we built substrate—friction — a gate under the agent. It measures
> whether the map reaches the tests guarding a change, and when it can't
> prove safety, it refuses. · CLI, API, MCP tool, GitHub bot."

## 0:40–0:52 · terminal: 0 of 370
> "The evidence. A real Django bug, human-verified: three hundred seventy
> tests would catch it. The map completes its walk — and selects
> **zero**. · A tool skipping on this map ships the bug silently."

## 0:52–1:04 · terminal: FastAPI verdict, exit 1
> "On FastAPI, live: the gate builds the map, selects twenty-three of
> seven hundred ninety-nine tests — and refuses to certify the skip,
> because this map class measures fifty percent. Exit one blocks the
> merge."

## 1:04–1:18 · terminal: the executor
> "The executor turns the verdict into commands: the exact pytest line for
> the selected few — and the full-suite fallback always beside it. ·
> Nothing is skipped on an unmeasured map. That's the invariant."

## 1:18–1:27 · the PR list, every label
> "And it's not a demo — the bot runs this repo. Every pull request gets
> triaged and labeled, automatically."

## 1:27–1:41 · the ai-autonomy PR
> "This one earned AI-autonomy: eleven of six hundred forty-six tests in
> the blast radius, safe to skip — under a policy bar the operator
> disclosed, with the full evidence in the comment."

## 1:41–1:57 · the engine proves it live
> "Now the part that makes this HydraDB-native. Sixty-one thousand edges
> load into the engine, live — and the database runs the check itself, in
> milliseconds. Parity: true. The engine reproduces our answer and proves
> the dropped test. · Not our word — the database's."

## 1:57–2:05 · verify
> "Every number you've seen re-derives from committed data with one
> command. It fails loudly if anything drifts."

## 2:05–2:15 · the distance table
> "And we published the distance to autonomy for every graph class —
> bounds, gaps, and the projects at zero. · Honesty is the product."

## 2:15–2:29 · the walkthrough
> "The walkthrough tells the whole story on one page — a real bug, real
> commands, verbatim records. It runs nothing and requires nothing."

## 2:29–2:41 · the repository
> "It's all open: one hundred seventy-two labelled bug fixes, seven
> repositories, five pre-registered studies, and four findings filed
> upstream to HydraDB itself."

## 2:41–2:51 · closing
> "substrate—friction. The certification gate for agent test selection. ·
> Measure the map — before you trust it."
