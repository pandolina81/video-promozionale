import React from "react";
import { Composition } from "remotion";
import { VideoPromozionale } from "./VideoPromozionale";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoPromozionale"
        component={VideoPromozionale}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
