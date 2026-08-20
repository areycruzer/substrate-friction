import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── SPEC S3/S4/S5 — editable constants (local frames: act starts at 216) ──
const MICRO_LABEL = "02 /THE VERDICT";
const TERMINAL_TITLE = "friction · CLI";
const COMMAND = "friction gate --repo fastapi --changed routing.py";
const STATUS_TEXT = "building the map…";
const NODES = 1551; // live fastapi run (shipped numbers)
const EDGES = 1721;
const TESTS_FOUND = 799;
const TESTS_SELECTED = 23;
const RECALL = 0.545; // measured on the labelled corpus (24/44)
const BAR = 0.95;
const VERDICT_HEAD = "[FAIL]  RUN_FULL";
const VERDICT_SUB =
  "the map missed roads — a skip would silently drop guarding tests";
const APPROVE_Q = "run the FULL suite?";
const APPROVE_CHIP = "APPROVE ✓";
const BLOCKED_CHIP = "exit 1 — merge blocked";

const EXPAND_AT = 0; // panel grows, headline fades (frames 0–24 local)
const STATUS_AT = 24;
const COUNT1_AT = 34; // nodes/edges odometer
const COUNT2_AT = 64; // tests found/selected odometer
const CARD_AT = 114; // verdict card springs in
const BARS_AT = 140; // recall bar fills
const SUB_AT = 200;
const ASK_AT = 254; // approve row
const CLICK_AT = 300; // click ring on APPROVE
const BLOCKED_AT = 310; // yellow chip stamps
// full stop: 344–359 (nothing moves but the cursor)

const odometer = (
  frame: number,
  at: number,
  target: number,
  dur: number,
): string =>
  Math.floor(
    interpolate(frame, [at, at + dur], [0, target], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
  ).toLocaleString("en-US");

export const Act2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cursorOn = frame % 24 < 14;
  const cardIn = spring({ frame: frame - CARD_AT, fps, config: { damping: 200 } });
  const blockedIn = spring({
    frame: frame - BLOCKED_AT,
    fps,
    config: { damping: 14, stiffness: 160 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* wordmark (steady) */}
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

      {/* micro-label crossfades from Act 1's */}
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
          opacity: interpolate(frame, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {MICRO_LABEL}
      </div>

      {/* Act 1's shrunk headline, fading away as the terminal takes over */}
      <div
        style={{
          position: "absolute",
          top: 170,
          left: 56,
          width: 968,
          scale: "0.66",
          translate: "0px -58px",
          transformOrigin: "top left",
          opacity: interpolate(frame, [0, 22], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          fontFamily: "VT323, monospace",
          fontSize: 72,
          lineHeight: 1.05,
          color: "#ffffff",
          whiteSpace: "nowrap",
        }}
      >
        <div>AI AGENTS PICK WHICH</div>
        <div>TESTS TO RUN — USING</div>
        <div>A MAP OF YOUR CODE.</div>
        <div style={{ color: "#ff571a", marginTop: 14, lineHeight: 1.15 }}>
          NOBODY CHECKED THE MAP.
        </div>
      </div>

      {/* the terminal — starts at Act 1's exact geometry, grows upward */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: interpolate(frame, [EXPAND_AT, EXPAND_AT + 26], [560, 130], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          width: 900,
          height: interpolate(frame, [EXPAND_AT, EXPAND_AT + 26], [430, 880], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          backgroundColor: "#0a0a0a",
          border: "1px solid #2e2e2e",
          overflow: "hidden",
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
            <span>{COMMAND}</span>
          </div>

          {/* S3 — working status with shimmer */}
          {frame >= STATUS_AT ? (
            <div style={{ position: "relative", color: "#747474" }}>
              {STATUS_TEXT}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 260,
                  height: "100%",
                  translate:
                    interpolate(frame, [STATUS_AT, CARD_AT], [-260, 900], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }) + "px 0px",
                  backgroundImage:
                    "linear-gradient(90deg, rgba(255,87,26,0) 0%, rgba(255,87,26,0.14) 50%, rgba(255,87,26,0) 100%)",
                  opacity: frame < CARD_AT ? 1 : 0,
                }}
              />
            </div>
          ) : null}
          {frame >= COUNT1_AT ? (
            <div>
              <span style={{ color: "#ffffff" }}>
                {odometer(frame, COUNT1_AT, NODES, 34)}
              </span>
              <span style={{ color: "#747474" }}> nodes · </span>
              <span style={{ color: "#ffffff" }}>
                {odometer(frame, COUNT1_AT, EDGES, 34)}
              </span>
              <span style={{ color: "#747474" }}> edges</span>
            </div>
          ) : null}
          {frame >= COUNT2_AT ? (
            <div>
              <span style={{ color: "#ffffff" }}>
                {odometer(frame, COUNT2_AT, TESTS_FOUND, 30)}
              </span>
              <span style={{ color: "#747474" }}> tests found · </span>
              <span style={{ color: "#ff571a" }}>
                {odometer(frame, COUNT2_AT, TESTS_SELECTED, 30)}
              </span>
              <span style={{ color: "#747474" }}> selected</span>
            </div>
          ) : null}

          {/* S4 — the verdict card */}
          {frame >= CARD_AT ? (
            <div
              style={{
                marginTop: 20,
                border: "1px solid #353535",
                opacity: cardIn,
                translate:
                  "0px " +
                  interpolate(cardIn, [0, 1], [36, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }) +
                  "px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ff571a",
                  color: "#000000",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 27,
                  fontWeight: 700,
                  padding: "10px 18px",
                  letterSpacing: "0.04em",
                }}
              >
                {VERDICT_HEAD}
              </div>
              <div style={{ padding: "16px 18px 18px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#747474" }}>
                    measured test→fix recall
                  </span>
                  <span style={{ color: "#ffffff" }}>{RECALL.toFixed(3)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#747474" }}>bar for skipping</span>
                  <span style={{ color: "#f9c425" }}>{BAR.toFixed(2)}</span>
                </div>
                {/* recall bar with the 95% marker */}
                <div
                  style={{
                    position: "relative",
                    marginTop: 14,
                    height: 22,
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
                        interpolate(frame, [BARS_AT, BARS_AT + 30], [0, 54.5], {
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
                      left: "95%",
                      width: 3,
                      height: 32,
                      backgroundColor: "#f9c425",
                    }}
                  />
                </div>
                {frame >= SUB_AT ? (
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: "Inter, sans-serif",
                      fontSize: 21,
                      color: "#dadada",
                      opacity: interpolate(frame, [SUB_AT, SUB_AT + 14], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    {VERDICT_SUB}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* S5 — the handoff: approve, then merge blocked */}
          {frame >= ASK_AT ? (
            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: interpolate(frame, [ASK_AT, ASK_AT + 12], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <span style={{ color: "#dadada" }}>{APPROVE_Q}</span>
              <span
                style={{
                  position: "relative",
                  border: "1px solid #ff571a",
                  color: "#ff571a",
                  padding: "4px 14px",
                  fontSize: 22,
                }}
              >
                {APPROVE_CHIP}
                {/* click ring */}
                {frame >= CLICK_AT ? (
                  <span
                    style={{
                      position: "absolute",
                      top: -8,
                      left: -8,
                      right: -8,
                      bottom: -8,
                      border: "2px solid #ff571a",
                      opacity: interpolate(
                        frame,
                        [CLICK_AT, CLICK_AT + 12],
                        [0.9, 0],
                        {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        },
                      ),
                      scale: String(
                        interpolate(frame, [CLICK_AT, CLICK_AT + 12], [0.9, 1.25], {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        }),
                      ),
                    }}
                  />
                ) : null}
              </span>
              {frame >= BLOCKED_AT ? (
                <span
                  style={{
                    border: "1px solid #f9c425",
                    color: "#f9c425",
                    padding: "4px 14px",
                    fontSize: 22,
                    opacity: blockedIn,
                    scale: String(
                      interpolate(blockedIn, [0, 1], [1.35, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    ),
                  }}
                >
                  {BLOCKED_CHIP}
                </span>
              ) : null}
            </div>
          ) : null}

          {/* resting cursor (the only motion during the full stop 344–359) */}
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
        </div>
      </div>
    </AbsoluteFill>
  );
};
