import { useContextBridge } from "@react-three/drei"
import { CursorDataContext } from "./App"
import { PotreeManager } from "./3d/managers/PotreeManager"
import { Children, useContext, useEffect, useLayoutEffect, useRef } from "react"
import CompositeSuspense from "./3d/CompositeSuspense"
import { EditorContext } from "./editor/EditorContext"
import { Canvas, useThree } from "@react-three/fiber"
import { ViewerContext } from "./viewer/ViewerContext"

function CameraHelper() {
    const {defaultCameraProps, cameraRef} = useContext(ViewerContext)
    useThree(({camera})=>{
        cameraRef.current = camera
    })
    useLayoutEffect(()=>{
        const camera = cameraRef.current
        if (camera) {
            if (defaultCameraProps.position) {
                camera.position.fromArray(defaultCameraProps.position)
            }
            if (defaultCameraProps.rotation) {
                camera.rotation.fromArray(defaultCameraProps.rotation)
            }
            if (defaultCameraProps.fov) {
                camera.fov = defaultCameraProps.fov
            }
            if (defaultCameraProps.position || defaultCameraProps.rotation || defaultCameraProps.fov) {
                camera.updateProjectionMatrix()
            }
        }
    }, [defaultCameraProps])
    return null
}

// Convenience component to provide common contexts to viewport children, in the future may include 3DTilesManager, NexusManager, etc which serves to manage 3DTilesObject and NexusObject on each render.
// TODO: Provide a way to change the child manager's parameters, e.g. pointBudget, etc.
function ViewportCanvas({children, ...props}) {
    const ContextBridge = useContextBridge(CursorDataContext, EditorContext, ViewerContext)
    const wrappedChildren = Children.map(children, (child) => (
        <CompositeSuspense>
            {child}
        </CompositeSuspense>
    ))
    return (
        <Canvas {...props}>
            <ContextBridge>
                <CameraHelper/>
                <PotreeManager pointBudget={1000000}>
                    {wrappedChildren}
                </PotreeManager>
            </ContextBridge>
        </Canvas>
    );
}

export default ViewportCanvas;