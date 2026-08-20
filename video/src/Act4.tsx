import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── SPEC S10/S11 — editable constants (local frames: act starts at 1224) ──
const MICRO_LABEL = "04 /PROOF";
const CAPTION_1 = "measured on 172 real, human-labelled bug fixes";
const CAPTION_2 = "any repo · ten lines";
const CAPTION_3 = "one command re-derives every number";
const BAR_A_LABEL = "name-matched map";
const BAR_A = 31; // % — shipped corpus figure
const BAR_B_LABEL = "type-resolved map";
const BAR_B = 42;
const BAR_MARK = 95;
const YAML_LINES = [
  "# .github/workflows/triage.yml",
  "name: Triage",
  "on: {pull_request: {types: [opened, synchronize, reopened]}}",
  "permissions: {issues: write, pull-requests: write}",
  "jobs:",
  "  triage:",
  "    runs-on: ubuntu-latest",
  "    steps:",
  "      - uses: actions/checkout@v4",
  "      - uses: areycruzer/substrate-friction@main",
];
const VERIFY_STAMP = "VERIFY OK";
const TAGLINE = "measure the map before you trust it.";
const URL_CHIP = "github.com/areycruzer/substrate-friction";

const SLIDE_1 = 32; // montage strip: card 1 → card 2 (10 fr)
const SLIDE_2 = 64; // card 2 → card 3
const ENDCARD_AT = 96; // endcard fades over; fully static from 126 (>3 s hold)

const slide = (frame: number, at: number) =>
  interpolate(frame, [at, at + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

export const Act4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stripX = -1080 * slide(frame, SLIDE_1) - 1080 * slide(frame, SLIDE_2);
  const verifyIn = spring({
    frame: frame - (SLIDE_2 + 12),
    fps,
    config: { damping: 13, stiffness: 170 },
  });
  const endIn = interpolate(frame, [ENDCARD_AT, ENDCARD_AT + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const barRow = (label: string, pct: number, at: number) => (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
        <span style={{ color: "#747474" }}>{label}</span>
        <span style={{ color: "#ffffff" }}>{pct}%</span>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 8,
          height: 26,
          border: "1px solid #2e2e2e",
          backgroundColor: "#000000",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width:
              interpolate(frame, [at, at + 24], [0, pct], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }) + "%",
            backgroundColor: "#ff571a",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -5,
            left: BAR_MARK + "%",
            width: 3,
            height: 36,
            backgroundColor: "#f9c425",
          }}
        />
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* wordmark + micro-label (hidden once the endcard owns the frame) */}
      <div style={{ opacity: 1 - endIn }}>
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 56,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 30,
            color: "#ffffff",
          }}
        >
          substrate<span style={{ color: "#ff571a" }}>—</span>friction
        </div>
        <div
          style={{
            position: "absolute",
            top: 52,
            right: 56,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 18,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#747474",
          }}
        >
          {MICRO_LABEL}
        </div>
      </div>

      {/* S10 — the payoff montage strip (continuous slide, no cuts) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 3240,
          height: 1080,
          translate:
            stripX +
            interpolate(frame, [0, 14], [140, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }) +
            "px 0px",
          opacity:
            interpolate(frame, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }) *
            (1 - endIn),
        }}
      >
        {/* card 1 — the measurement */}
        <div
          style={{
            position: "absolute",
          top: 280,
          width: 900,
          backgroundColor: "#0a0a0a",
          border: "1px solid #2e2e2e",
          padding: "34px 38px",
          fontFamily: "JetBrains Mono, monospace",
          color: "#dadada",
            left: 90,
          }}
        >
          <div
            style={{
              fontFamily: "VT323, monospace",
              fontSize: 50,
              color: "#ffffff",
            }}
          >
            HOW OFTEN THE MAP FINDS THE GUARDING TEST
          </div>
          {barRow(BAR_A_LABEL, BAR_A, 4)}
          {barRow(BAR_B_LABEL, BAR_B, 12)}
          <div style={{ marginTop: 10, fontSize: 20, color: "#f9c425" }}>
            bar for skipping: {BAR_MARK}%
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: "Inter, sans-serif",
              fontSize: 22,
              color: "#dadada",
            }}
          >
            {CAPTION_1}
          </div>
        </div>

        {/* card 2 — the ten-line install */}
        <div
          style={{
            position: "absolute",
          top: 240,
          width: 900,
          backgroundColor: "#0a0a0a",
          border: "1px solid #2e2e2e",
          padding: "34px 38px",
          fontFamily: "JetBrains Mono, monospace",
          color: "#dadada",
            left: 1170,
          }}
        >
          <div
            style={{
              fontFamily: "VT323, monospace",
              fontSize: 50,
              color: "#ffffff",
              marginBottom: 14,
            }}
          >
            THE BOT, INSTALLED
          </div>
          <div
            style={{
              border: "1px solid #2e2e2e",
              backgroundColor: "#000000",
              padding: "14px 18px",
              fontSize: 18.5,
              lineHeight: 1.55,
              whiteSpace: "pre",
            }}
          >
            {YAML_LINES.map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.startsWith("#")
                    ? "#747474"
                    : line.includes("areycruzer")
                      ? "#ff571a"
                      : "#dadada",
                }}
              >
                {line}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: "Inter, sans-serif",
              fontSize: 22,
              color: "#dadada",
            }}
          >
            {CAPTION_2}
          </div>
        </div>

        {/* card 3 — verify */}
        <div
          style={{
            position: "absolute",
          top: 360,
          width: 900,
          backgroundColor: "#0a0a0a",
          border: "1px solid #2e2e2e",
          padding: "34px 38px",
          fontFamily: "JetBrains Mono, monospace",
          color: "#dadada",
            left: 2250,
          }}
        >
          <div
            style={{
              display: "inline-block",
              border: "2px solid #2fbf71",
              color: "#2fbf71",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 52,
              padding: "14px 30px",
              opacity: verifyIn,
              scale: String(
                interpolate(verifyIn, [0, 1], [1.6, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              ),
            }}
          >
            {VERIFY_STAMP}
          </div>
          <div
            style={{
              marginTop: 20,
              fontFamily: "Inter, sans-serif",
              fontSize: 24,
              color: "#dadada",
            }}
          >
            {CAPTION_3}
          </div>
        </div>
      </div>

      {/* S11 — endcard: tree, wordmark, tagline. Static hold ≥ 3 s. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1080,
          opacity: endIn,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
        }}
      >
        <Img
          src={staticFile("substrate-tree.svg")}
          style={{
            width: 380,
            height: 380,
            scale: String(
              interpolate(frame, [ENDCARD_AT, 215], [1, 1.02], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            ),
          }}
        />
        <div
          style={{
            fontFamily: "VT323, monospace",
            fontSize: 96,
            color: "#ffffff",
          }}
        >
          substrate<span style={{ color: "#ff571a" }}>—</span>friction
        </div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 30,
            color: "#dadada",
          }}
        >
          {TAGLINE}
        </div>
        <div
          style={{
            border: "1px solid #2e2e2e",
            color: "#747474",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 21,
            padding: "8px 18px",
          }}
        >
          {URL_CHIP}
        </div>
      </div>
    </AbsoluteFill>
  );
};
