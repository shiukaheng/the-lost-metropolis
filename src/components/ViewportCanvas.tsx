import { useContextBridge } from "@react-three/drei"
import { CursorDataContext } from "./App"
import { PotreeManager } from "./3d/PotreeManager"
import { Children } from "react"
import CompositeSuspense from "./3d/CompositeSuspense"
import { EditorContext, TestContext } from "./editor/Editor"
import { Canvas } from "@react-three/fiber"

// Convenience component to provide common contexts to viewport children, in the future may include 3DTilesManager, NexusManager, etc which serves to manage 3DTilesObject and NexusObject on each render.
// TODO: Provide a way to change the child manager's parameters, e.g. pointBudget, etc.
function ViewportCanvas({children, ...props}) {
    const ContextBridge = useContextBridge(CursorDataContext, TestContext, EditorContext)
    const wrappedChildren = Children.map(children, (child) => (
        <CompositeSuspense>
            {child}
        </CompositeSuspense>
    ))
    return (
        <Canvas>
            <ContextBridge>
                <PotreeManager pointBudget={1000000}>
                    {wrappedChildren}
                </PotreeManager>
            </ContextBridge>
        </Canvas>
    );
}

export default ViewportCanvas;