import { AbsoluteFill, Sequence } from "remotion";
import { loadFont as loadVT323 } from "@remotion/google-fonts/VT323";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Act1 } from "./Act1";
import { Act2 } from "./Act2";
import { Act3 } from "./Act3";
import { Act4 } from "./Act4";
import { Sfx } from "./Sfx";

loadVT323();
loadJetBrainsMono();
loadInter();

// ── SPEC.md §2 — act frame ranges (30 fps) ────────────────────────────────
const ACT1_FROM = 0; //    0–215  "The Ask"
const ACT2_FROM = 216; //  216–575  "The Handoff"
const ACT3_FROM = 576; //  576–1223 "The Agent Works" — THE ONE HARD CUT
const ACT4_FROM = 1224; // 1224–1439 "Result + Brand"

const DISCLAIMER =
  "every number on screen is emitted by a committed script · re-derive: friction verify";

export const Demo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <Sfx />
      <Sequence name="Act 1 — The Ask" from={ACT1_FROM} durationInFrames={216}>
        <Act1 />
      </Sequence>
      <Sequence
        name="Act 2 — The Handoff"
        from={ACT2_FROM}
        durationInFrames={360}
      >
        <Act2 />
      </Sequence>
      <Sequence
        name="Act 3 — Inside HydraDB"
        from={ACT3_FROM}
        durationInFrames={648}
      >
        <Act3 />
      </Sequence>
      <Sequence
        name="Act 4 — Proof + Brand"
        from={ACT4_FROM}
        durationInFrames={216}
      >
        <Act4 />
      </Sequence>

      {/* SPEC global rule: the disclaimer stays fixed and never moves */}
      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: 0,
          width: 1080,
          textAlign: "center",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 16,
          letterSpacing: "0.06em",
          color: "#747474",
        }}
      >
        {DISCLAIMER}
      </div>
    </AbsoluteFill>
  );
};
