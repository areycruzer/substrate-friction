import "./index.css";
import { Composition } from "remotion";
import { Demo } from "./Demo";

// SPEC.md: 1080x1080 (1:1), 30 fps, 1440 frames = 48 s
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Demo"
      component={Demo}
      durationInFrames={1440}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
