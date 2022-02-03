import { Canvas } from "@react-three/fiber"
import { PotreeManager } from "./3d/managers/PotreeManager"
import ViewportCanvas from "./ViewportCanvas"
import { ReactNode } from "react";

type ViewportProps = {
    children?: ReactNode
}

function Viewport({children, ...props}:ViewportProps) {
    return (
        <div {...props}>
            <ViewportCanvas>
                {children}
            </ViewportCanvas>
        </div>
    );
}

export default Viewport;