import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── SPEC S6–S9 — editable constants (local frames: act starts at 576) ─────
const MICRO_LABEL = "03 /INSIDE HYDRADB";
const TOAST_LOAD = "loading both maps…";
const TOAST_WALK = "walking CALLED_BY*1..6 in-engine…";
const TOAST_PARITY = "checking parity…";
const TOAST_TRIAGE = "triaging a real PR…";
const LOAD_NODES = 28353; // capture 03 (live engine run)
const LOAD_EDGES = 61536;
const DIGEST_CHIP = "pinned engine · ghcr.io/hydra-db/hydradb@sha256:db78309a…";
const CYPHER_1 = "MATCH (s {id: 920310000127})";
const CYPHER_2 = "      -[:CALLED_BY*1..6]->(n)";
const CYPHER_3 = "RETURN n.id AS id";
const ENGINE_ROW = "engine  2.6 ms · 2 nodes reached";
const PARITY_STAMP = "parity = True";
const DROPPED_STAMP = "DROPPED: 1 guarding test";
const PROOF_SUB = "the engine itself proves the miss.";
const STEPS = [
  "load both maps",
  "walk in-engine",
  "parity check",
  "verdict: RUN_FULL",
];
const BOT_NAME = "substrate-friction (bot)";
const BOT_META = "commented · just now";
const BOT_LABEL = "triage/human-verification";
const BOT_ROW_1 = "blast radius: 1 of 316 tests";
const BOT_ROW_2 =
  "review focus — the head start: start where the graph points, finish everywhere.";

const WHIP_1 = 124; // strip 0 → -1080 (10 fr, out-quint)
const WHIP_2 = 274; // strip -1080 → -2160
const COUNT_AT = 10;
const ENGINE_ROW_AT = 170;
const PARITY_AT = 300;
const DROPPED_AT = 322;
const PROOF_SUB_AT = 342;
// FULL HOLD: 364–394 (global 940–970) — nothing moves
const HANDOFF_AT = 424; // strip yields to steps + bot card
const STEP_TICKS = [429, 479, 529, 579];
const BOT_CARD_AT = 460;

const whip = (frame: number, at: number) =>
  interpolate(frame, [at, at + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const odo = (frame: number, at: number, target: number, dur: number): string =>
  Math.floor(
    interpolate(frame, [at, at + dur], [0, target], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
  ).toLocaleString("en-US");

const Toast: React.FC<{ frame: number; at: number; until: number; text: string }> = ({
  frame,
  at,
  until,
  text,
}) => {
  if (frame < at) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        bottom: 96,
        border: "1px solid #2e2e2e",
        backgroundColor: "#0a0a0a",
        color: "#dadada",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 20,
        padding: "8px 16px",
        opacity: interpolate(
          frame,
          [at, at + 8, until, until + 8],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
        translate:
          "0px " +
          interpolate(frame, [at, at + 8], [16, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }) +
          "px",
      }}
    >
      <span style={{ color: "#ff571a" }}>▸ </span>
      {text}
    </div>
  );
};

export const Act3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stripX = -1080 * whip(frame, WHIP_1) - 1080 * whip(frame, WHIP_2);
  const parityIn = spring({
    frame: frame - PARITY_AT,
    fps,
    config: { damping: 13, stiffness: 170 },
  });
  const droppedIn = spring({
    frame: frame - DROPPED_AT,
    fps,
    config: { damping: 13, stiffness: 170 },
  });
  const cardIn = spring({
    frame: frame - BOT_CARD_AT,
    fps,
    config: { damping: 200 },
  });
  const stripOut = interpolate(frame, [HANDOFF_AT, HANDOFF_AT + 14], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        opacity: interpolate(frame, [634, 646], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {/* wordmark */}
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
      {/* orange micro-label — this is the HydraDB act */}
      <div
        style={{
          position: "absolute",
          top: 52,
          right: 56,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 18,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#ff571a",
        }}
      >
        {MICRO_LABEL}
      </div>

      {/* the whip-pan strip: LOAD · QUERY · PROOF */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 3240,
          height: 1080,
          translate: stripX + "px 0px",
          opacity: stripOut,
        }}
      >
        {/* S6 — LOAD */}
        <div
          style={{
            position: "absolute",
          top: 300,
          left: 90,
          width: 900,
          backgroundColor: "#0a0a0a",
          border: "1px solid #2e2e2e",
          padding: "34px 38px",
          fontFamily: "JetBrains Mono, monospace",
          color: "#dadada",
          }}
        >
          <div
            style={{
              fontFamily: "VT323, monospace",
              fontSize: 56,
              color: "#ffffff",
              marginBottom: 18,
            }}
          >
            BOTH MAPS, LOADED LIVE
          </div>
          <div style={{ fontSize: 44, lineHeight: 1.6 }}>
            <span style={{ color: "#ffffff" }}>
              {odo(frame, COUNT_AT, LOAD_NODES, 50)}
            </span>
            <span style={{ color: "#747474" }}> nodes</span>
          </div>
          <div style={{ fontSize: 44, lineHeight: 1.6 }}>
            <span style={{ color: "#ff571a" }}>
              {odo(frame, COUNT_AT, LOAD_EDGES, 50)}
            </span>
            <span style={{ color: "#747474" }}> edges</span>
          </div>
          <div
            style={{
              marginTop: 22,
              display: "inline-block",
              border: "1px solid #2e2e2e",
              color: "#747474",
              fontSize: 17,
              padding: "6px 12px",
            }}
          >
            {DIGEST_CHIP}
          </div>
        </div>

        {/* S7 — QUERY */}
        <div
          style={{
            position: "absolute",
          top: 300,
          left: 1170,
          width: 900,
          backgroundColor: "#0a0a0a",
          border: "1px solid #2e2e2e",
          padding: "34px 38px",
          fontFamily: "JetBrains Mono, monospace",
          color: "#dadada",
          }}
        >
          <div
            style={{
              fontFamily: "VT323, monospace",
              fontSize: 56,
              color: "#ffffff",
              marginBottom: 18,
            }}
          >
            THE WALK RUNS IN-ENGINE
          </div>
          <div
            style={{
              border: "1px solid #2e2e2e",
              backgroundColor: "#000000",
              padding: "18px 20px",
              fontSize: 26,
              lineHeight: 1.6,
              color: "#dadada",
            }}
          >
            <div>{CYPHER_1}</div>
            <div>
              <span style={{ color: "#ff571a" }}>{CYPHER_2}</span>
            </div>
            <div>{CYPHER_3}</div>
          </div>
          {frame >= ENGINE_ROW_AT ? (
            <div
              style={{
                marginTop: 20,
                fontSize: 30,
                color: "#ffffff",
                opacity: interpolate(
                  frame,
                  [ENGINE_ROW_AT, ENGINE_ROW_AT + 10],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                ),
              }}
            >
              <span style={{ color: "#2fbf71" }}>●</span> {ENGINE_ROW}
            </div>
          ) : null}
        </div>

        {/* S8 — PROOF */}
        <div
          style={{
            position: "absolute",
          top: 260,
          left: 2250,
          width: 900,
          backgroundColor: "#0a0a0a",
          border: "1px solid #2e2e2e",
          padding: "34px 38px",
          fontFamily: "JetBrains Mono, monospace",
          color: "#dadada",
          }}
        >
          <div
            style={{
              fontFamily: "VT323, monospace",
              fontSize: 56,
              color: "#ffffff",
              marginBottom: 24,
            }}
          >
            NOT OUR WORD. THE DATABASE'S.
          </div>
          {frame >= PARITY_AT ? (
            <div
              style={{
                display: "inline-block",
                border: "2px solid #2fbf71",
                color: "#2fbf71",
                fontSize: 42,
                padding: "10px 22px",
                opacity: parityIn,
                scale: String(
                  interpolate(parityIn, [0, 1], [1.6, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                ),
              }}
            >
              {PARITY_STAMP}
            </div>
          ) : null}
          {frame >= DROPPED_AT ? (
            <div
              style={{
                marginTop: 18,
                display: "inline-block",
                border: "2px solid #f9c425",
                color: "#f9c425",
                fontSize: 42,
                padding: "10px 22px",
                opacity: droppedIn,
                scale: String(
                  interpolate(droppedIn, [0, 1], [1.6, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                ),
              }}
            >
              {DROPPED_STAMP}
            </div>
          ) : null}
          {frame >= PROOF_SUB_AT ? (
            <div
              style={{
                marginTop: 22,
                fontFamily: "Inter, sans-serif",
                fontSize: 26,
                color: "#dadada",
                opacity: interpolate(
                  frame,
                  [PROOF_SUB_AT, PROOF_SUB_AT + 12],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                ),
              }}
            >
              {PROOF_SUB}
            </div>
          ) : null}
        </div>
      </div>

      {/* S9 — step panel + the bot card */}
      {frame >= HANDOFF_AT ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1080,
            height: 1080,
            opacity: interpolate(frame, [HANDOFF_AT, HANDOFF_AT + 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {/* step side panel */}
          <div
            style={{
              position: "absolute",
              top: 200,
              left: 56,
              width: 330,
              backgroundColor: "#0a0a0a",
              border: "1px solid #2e2e2e",
              padding: "22px 22px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 21,
              translate:
                interpolate(frame, [HANDOFF_AT, HANDOFF_AT + 16], [-60, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }) + "px 0px",
            }}
          >
            {STEPS.map((step, i) => {
              const tick = STEP_TICKS[i];
              const done = frame >= tick;
              return (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    color: done ? "#ffffff" : "#747474",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 30,
                      height: 30,
                      border: done ? "1px solid #2fbf71" : "1px solid #2e2e2e",
                      color: "#2fbf71",
                      fontSize: 20,
                      scale: done
                        ? String(
                            interpolate(
                              spring({
                                frame: frame - tick,
                                fps: 30,
                                config: { damping: 12, stiffness: 180 },
                              }),
                              [0, 1],
                              [1.5, 1],
                              {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                              },
                            ),
                          )
                        : "1",
                    }}
                  >
                    {done ? "✓" : ""}
                  </span>
                  {step}
                </div>
              );
            })}
          </div>

          {/* the bot PR comment card */}
          {frame >= BOT_CARD_AT ? (
            <div
              style={{
                position: "absolute",
                top: 200,
                left: 428,
                width: 596,
                backgroundColor: "#0a0a0a",
                border: "1px solid #2e2e2e",
                fontFamily: "JetBrains Mono, monospace",
                opacity: cardIn,
                translate:
                  interpolate(cardIn, [0, 1], [70, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }) + "px 0px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 20px",
                  borderBottom: "1px solid #2e2e2e",
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    backgroundColor: "#ff571a",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000000",
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  sf
                </span>
                <span style={{ color: "#ffffff", fontSize: 20 }}>{BOT_NAME}</span>
                <span style={{ color: "#747474", fontSize: 17 }}>{BOT_META}</span>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <span
                  style={{
                    display: "inline-block",
                    border: "1px solid #ff571a",
                    color: "#ff571a",
                    fontSize: 19,
                    padding: "4px 12px",
                    marginBottom: 16,
                  }}
                >
                  {BOT_LABEL}
                </span>
                <div style={{ color: "#ffffff", fontSize: 23, lineHeight: 1.7 }}>
                  {BOT_ROW_1}
                </div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: "#dadada",
                    fontSize: 21,
                    lineHeight: 1.6,
                    marginTop: 10,
                  }}
                >
                  {BOT_ROW_2}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* toasts — each precedes its move by 2–4 frames */}
      <Toast frame={frame} at={2} until={WHIP_1 - 4} text={TOAST_LOAD} />
      <Toast frame={frame} at={WHIP_1 - 4} until={WHIP_2 - 4} text={TOAST_WALK} />
      <Toast frame={frame} at={WHIP_2 - 4} until={360} text={TOAST_PARITY} />
      <Toast
        frame={frame}
        at={HANDOFF_AT + 10}
        until={BOT_CARD_AT + 40}
        text={TOAST_TRIAGE}
      />
    </AbsoluteFill>
  );
};
