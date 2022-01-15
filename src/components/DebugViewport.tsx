import { Canvas } from "@react-three/fiber"
import DebugPlane from "./3d/DebugPlane";
import ViewportContext from "./ViewportContext"
import { OrbitControls } from '@react-three/drei'

function DebugViewport({children, ...props}) {
    return (
        <div {...props}>
            <Canvas>
                <ViewportContext>
                    <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                    {children}
                </ViewportContext>
            </Canvas>
        </div>
    );
}

export default DebugViewport;