import { useContextBridge } from "@react-three/drei"
import { CursorDataContext } from "./App"
import { PotreeManager } from "./3d/PotreeManager"
import { Children } from "react"
import CompositeSuspense from "./3d/CompositeSuspense"

// Convenience component to provide common contexts to viewport children, in the future may include 3DTilesManager, NexusManager, etc which serves to manage 3DTilesObject and NexusObject on each render.
// TODO: Provide a way to change the child manager's parameters, e.g. pointBudget, etc.
function ViewportContext({children, ...props}) {
    const ContextBridge = useContextBridge(CursorDataContext)
    const wrappedChildren = Children.map(children, (child) => (
        <CompositeSuspense>
            {child}
        </CompositeSuspense>
    ))
    return (
        <ContextBridge>
            <PotreeManager pointBudget={1000000}>
                {wrappedChildren}
            </PotreeManager>
        </ContextBridge>
    );
}

export default ViewportContext;