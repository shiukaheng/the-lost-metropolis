import { Canvas } from "@react-three/fiber"
import { PotreeManager } from "./3d/PotreeManager"
import ViewportContext from "./ViewportContext"
import { ReactNode } from "react";

type ViewportProps = {
    children?: ReactNode
}

function Viewport({children, ...props}:ViewportProps) {
    return (
        <div {...props}>
            <Canvas>
                <ViewportContext>
                    {children}
                </ViewportContext>
            </Canvas>
        </div>
    );
}

export default Viewport;