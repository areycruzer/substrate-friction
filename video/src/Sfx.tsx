import { Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";

// ── The audio map — every cue at its GLOBAL frame (30 fps) ────────────────
// All files are synthesized from scratch (scripts committed in git history);
// nothing is sampled or downloaded, so the render is fully self-contained.

const MUSIC_VOLUME = 0.55; // 48 s bed with its own fade-in/out baked in

// keystrokes ride the Act-1 typing (frames 104–146, one every 3 frames)
const TYPE_FROM = 104;
const TYPE_TO = 146;
const TYPE_STEP = 3;

type Cue = { at: number; src: string; volume: number };

const CUES: Cue[] = [
  // Act 1 — the ask
  { at: 92, src: "rise.wav", volume: 0.3 }, // terminal panel rises
  { at: 150, src: "enter.wav", volume: 0.5 }, // Enter pressed

  // Act 2 — the handoff
  { at: 216, src: "rise.wav", volume: 0.3 }, // terminal expands
  { at: 330, src: "stamp.wav", volume: 0.5 }, // verdict card lands
  { at: 516, src: "key.wav", volume: 0.6 }, // APPROVE click
  { at: 526, src: "stamp.wav", volume: 0.55 }, // exit 1 — merge blocked

  // Act 3 — inside HydraDB (the one hard cut)
  { at: 576, src: "boom.wav", volume: 0.65 }, // THE hard cut
  { at: 700, src: "whoosh.wav", volume: 0.5 }, // whip-pan to the walk
  { at: 746, src: "tick.wav", volume: 0.4 }, // engine result row
  { at: 850, src: "whoosh.wav", volume: 0.5 }, // whip-pan to the proof
  { at: 876, src: "stamp.wav", volume: 0.55 }, // parity = True
  { at: 879, src: "chime.wav", volume: 0.4 }, // …and its shine
  { at: 898, src: "stamp.wav", volume: 0.6 }, // DROPPED
  { at: 1000, src: "whoosh.wav", volume: 0.35 }, // handoff to steps + bot
  { at: 1005, src: "tick.wav", volume: 0.45 }, // step ✓ 1
  { at: 1036, src: "rise.wav", volume: 0.3 }, // bot card arrives
  { at: 1055, src: "tick.wav", volume: 0.45 }, // step ✓ 2
  { at: 1105, src: "tick.wav", volume: 0.45 }, // step ✓ 3
  { at: 1155, src: "tick.wav", volume: 0.45 }, // step ✓ 4
  { at: 1160, src: "stamp.wav", volume: 0.4 }, // verdict step lands

  // Act 4 — proof + brand out
  { at: 1256, src: "whoosh.wav", volume: 0.45 }, // montage slide 1
  { at: 1288, src: "whoosh.wav", volume: 0.45 }, // montage slide 2
  { at: 1300, src: "stamp.wav", volume: 0.45 }, // VERIFY OK stamps…
  { at: 1303, src: "chime.wav", volume: 0.5 }, // …and chimes
  { at: 1320, src: "rise.wav", volume: 0.35 }, // endcard swells in
  { at: 1338, src: "chime.wav", volume: 0.35 }, // the brand note
];

const typeCues: number[] = [];
for (let f = TYPE_FROM; f <= TYPE_TO; f += TYPE_STEP) {
  typeCues.push(f);
}

export const Sfx: React.FC = () => {
  return (
    <>
      <Audio src={staticFile("audio/music.wav")} volume={MUSIC_VOLUME} />
      {typeCues.map((f, i) => (
        <Sequence key={"key-" + f} from={f} durationInFrames={4}>
          {/* deterministic 3-step volume variation so the roll sounds human */}
          <Audio
            src={staticFile("audio/key.wav")}
            volume={0.28 + ((i * 7) % 3) * 0.06}
          />
        </Sequence>
      ))}
      {CUES.map((cue) => (
        <Sequence
          key={cue.src + "-" + cue.at}
          from={cue.at}
          durationInFrames={30}
        >
          <Audio src={staticFile("audio/" + cue.src)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
