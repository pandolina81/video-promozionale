import React from "react";
import { Composition } from "remotion";
import { VideoPromozionale } from "./VideoPromozionale";
import { Tabelline } from "./Tabelline";

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
      <Composition
        id="Tabelline"
        component={Tabelline}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
