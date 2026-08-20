import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── SPEC S1/S2 — editable constants ──────────────────────────────────────
const HEADLINE_1 = "AI AGENTS PICK WHICH";
const HEADLINE_2 = "TESTS TO RUN — USING";
const HEADLINE_3 = "A MAP OF YOUR CODE.";
const HEADLINE_PUNCH = "NOBODY CHECKED THE MAP.";
const MICRO_LABEL = "01 /THE QUESTION";
const TERMINAL_TITLE = "friction · CLI";
const COMMAND = "friction gate --repo fastapi --changed routing.py";

const H1_AT = 8; // frame each headline line enters
const H2_AT = 22;
const H3_AT = 36;
const PUNCH_AT = 56;
const SHRINK_AT = 85; // headline makes room for the terminal
const PANEL_AT = 92; // terminal panel rises
const TYPE_AT = 104; // typing starts (~1.2 chars/frame ≈ 36 chars/s)
const CHARS_PER_FRAME = 1.2;
const ENTER_AT = 150; // Enter pressed, new prompt line appears

const lineIn = (frame: number, at: number) => ({
  opacity: interpolate(frame, [at, at + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  }),
  translate:
    "0px " +
    interpolate(frame, [at, at + 16], [26, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }) +
    "px",
});

export const Act1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typedChars = Math.max(
    0,
    Math.min(COMMAND.length, Math.floor((frame - TYPE_AT) * CHARS_PER_FRAME)),
  );
  const typed = COMMAND.slice(0, typedChars);
  const cursorOn = frame % 24 < 14;
  const panelRise = spring({
    frame: frame - PANEL_AT,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* wordmark, top-left */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 56,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 30,
          color: "#ffffff",
          opacity: interpolate(frame, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        substrate<span style={{ color: "#ff571a" }}>—</span>friction
      </div>

      {/* micro-label, top-right */}
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
          opacity: interpolate(frame, [4, 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {MICRO_LABEL}
      </div>

      {/* headline block — shrinks up when the terminal arrives */}
      <div
        style={{
          position: "absolute",
          top: 170,
          left: 56,
          width: 968,
          scale: String(
            interpolate(frame, [SHRINK_AT, SHRINK_AT + 24], [1, 0.66], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          ),
          translate:
            "0px " +
            interpolate(frame, [SHRINK_AT, SHRINK_AT + 24], [0, -58], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }) +
            "px",
          transformOrigin: "top left",
        }}
      >
        <div
          style={{
            fontFamily: "VT323, monospace",
            fontSize: 72,
            whiteSpace: "nowrap",
            lineHeight: 1.05,
            color: "#ffffff",
            ...lineIn(frame, H1_AT),
          }}
        >
          {HEADLINE_1}
        </div>
        <div
          style={{
            fontFamily: "VT323, monospace",
            fontSize: 72,
            whiteSpace: "nowrap",
            lineHeight: 1.05,
            color: "#ffffff",
            ...lineIn(frame, H2_AT),
          }}
        >
          {HEADLINE_2}
        </div>
        <div
          style={{
            fontFamily: "VT323, monospace",
            fontSize: 72,
            whiteSpace: "nowrap",
            lineHeight: 1.05,
            color: "#ffffff",
            ...lineIn(frame, H3_AT),
          }}
        >
          {HEADLINE_3}
        </div>
        <div
          style={{
            fontFamily: "VT323, monospace",
            fontSize: 72,
            whiteSpace: "nowrap",
            lineHeight: 1.15,
            color: "#ff571a",
            marginTop: 14,
            ...lineIn(frame, PUNCH_AT),
          }}
        >
          {HEADLINE_PUNCH}
        </div>
      </div>

      {/* terminal panel — same geometry Act 2 keeps (left 90/top 560/900x430) */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 560,
          width: 900,
          height: 430,
          backgroundColor: "#0a0a0a",
          border: "1px solid #2e2e2e",
          opacity: panelRise,
          translate:
            "0px " +
            interpolate(panelRise, [0, 1], [90, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }) +
            "px",
        }}
      >
        <div
          style={{
            height: 52,
            borderBottom: "1px solid #2e2e2e",
            display: "flex",
            alignItems: "center",
            paddingLeft: 22,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 17,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#747474",
          }}
        >
          {TERMINAL_TITLE}
        </div>
        <div
          style={{
            padding: "26px 28px",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 25,
            lineHeight: 1.75,
            color: "#dadada",
          }}
        >
          <div>
            <span style={{ color: "#747474" }}>$ </span>
            <span>{typed}</span>
            {frame < ENTER_AT ? (
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 27,
                  backgroundColor: cursorOn ? "#ff571a" : "transparent",
                  verticalAlign: "text-bottom",
                }}
              />
            ) : null}
          </div>
          {frame >= ENTER_AT ? (
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 27,
                  backgroundColor: cursorOn ? "#ff571a" : "transparent",
                  verticalAlign: "text-bottom",
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
