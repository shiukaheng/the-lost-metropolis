import { Canvas } from "@react-three/fiber"
import { PotreeManager } from "./3d/PotreeManager"

function Viewport({children, ...props}) {
    return (
        <div {...props}>
            <Canvas>
                <PotreeManager pointBudget={1000000}>
                    {children}
                </PotreeManager>
            </Canvas>
        </div>
    );
}

export default Viewport;