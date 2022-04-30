import { useContextBridge } from "@react-three/drei"
import { PotreeManager } from "../3d/managers/PotreeManager"
import { Children, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import CompositeSuspense from "../3d/subcomponents/CompositeSuspense"
import { EditorContext } from "../editor/EditorContext"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ViewerContext } from "../viewer/ViewerContext"
import { SettingsContext, ThemeContext } from "../App"
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

function CameraHelper() {
    const {defaultCameraProps, cameraRef, audioListener} = useContext(ViewerContext)
    const { camera } = useThree()
    useLayoutEffect(()=>{
        cameraRef.current = camera
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
    }, [defaultCameraProps, camera])
    useLayoutEffect(()=>{
        if (camera) {
            audioListener.removeFromParent()
            camera.add(audioListener)
        }
        return ()=>{
            audioListener.removeFromParent()
        }
    }, [camera])
    return null
}

// Convenience component to provide common contexts to viewport children, in the future may include 3DTilesManager, NexusManager, etc which serves to manage 3DTilesObject and NexusObject on each render.
// TODO: Provide a way to change the child manager's parameters, e.g. pointBudget, etc.
function ViewportCanvas({children, ...props}) {
    const ContextBridge = useContextBridge(EditorContext, ViewerContext, SettingsContext, ThemeContext)
    const wrappedChildren = Children.map(children, (child) => (
        <CompositeSuspense>
            {child}
        </CompositeSuspense>
    ))
    return (
        <Canvas linear flat {...props}>
            <EffectComposer>
                {/* <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={160} /> */}
                <Vignette eskil={false} offset={0.1} darkness={0.5} />
            </EffectComposer>
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