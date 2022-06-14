import { VRCanvas } from "@react-three/xr";
import { TilesObject } from "../3d/TilesObject";
import DOMControls from "../utilities/controls/DOMControls";
import { Viewer } from "../viewer/Viewer";

function Debug3D() {
    return (
        <div className="absolute w-full h-full bg-black">
            <VRCanvas className="w-full h-full viewport-canvas">
                <DOMControls/>
                <TilesObject objectID="test" scale={0.2} url={"https://storage.googleapis.com/the-lost-metropolis-production-static/salon_xs/tileset.json"}/>
            </VRCanvas>
        </div>
    );
}

export default Debug3D