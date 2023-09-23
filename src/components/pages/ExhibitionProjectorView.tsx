import { useLoader } from "@react-three/fiber";
import View, { ProjectorView } from "./View";
import { FileLoader } from "three";
import { usePost } from "../../utilities";
import { useProjectorInfo } from "../viewer/ViewportCanvas";
import { useMemo } from "react";
import { PotreeObject } from "../3d/PotreeObject";
import { ExhibitionScene } from "./Exhibition";

function ExhibitionProjectorView() {
  const [localPost, _] = usePost("web_exhibition", false); // Check if there is a local override
  return (
    <div className="w-full h-full absolute">
      <ProjectorView
        defaultCameraProps={{
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          fov: 90,
        }}
      >
        <ExhibitionScene/>
      </ProjectorView>
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background:
            "radial-gradient(circle at center, transparent 40%, black 100%)",
        }}
      ></div>
    </div>
  );
}

export default ExhibitionProjectorView;
