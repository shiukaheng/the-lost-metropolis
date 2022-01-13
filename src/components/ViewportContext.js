import { useContextBridge } from "@react-three/drei"
import { CursorDataContext } from "../App"
import { PotreeManager } from "./3d/PotreeManager"

// Convenience component to provide common contexts to viewport children, in the future may include 3DTilesManager, NexusManager, etc which serves to manage 3DTilesObject and NexusObject on each render.
// TODO: Provide a way to change the child manager's parameters, e.g. pointBudget, etc.
function ViewportContext({children, ...props}) {
    const ContextBridge = useContextBridge(CursorDataContext)
    return (
        <ContextBridge>
            <PotreeManager pointBudget={1000000}>
                {children}
            </PotreeManager>
        </ContextBridge>
    );
}

export default ViewportContext;