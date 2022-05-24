import { VRCanvas } from "@react-three/xr";
import { ProtoTilesObject } from "../3d/subcomponents/ProtoTilesObject";
import { TilesObject } from "../3d/TilesObject";
import GameControls from "../utilities/GameControls";
import { Viewer } from "../viewer/Viewer";

function Debug3D() {
    return (
        <div className="absolute w-full h-full">
            <VRCanvas className="w-full h-full viewport-canvas">
                <GameControls/>
                {/* <CameraPosSetter/> */}
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <planeBufferGeometry attach="geometry" args={[10, 10]} />
                    <meshBasicMaterial attach="material" wireframe color="red" />
                </mesh>
                <ProtoTilesObject scale={0.2} url={"https://storage.googleapis.com/the-lost-metropolis-production-static/salon_xs/tileset.json"}/>
            </VRCanvas>
        </div>
    );
}

export default Debug3D