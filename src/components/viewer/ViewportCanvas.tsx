import { useContextBridge } from "@react-three/drei"
import { PotreeManager } from "../3d/managers/PotreeManager"
import { Children, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import CompositeSuspense from "../3d/subcomponents/CompositeSuspense"
import { EditorContext } from "../editor/EditorContext"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ViewerContext } from "../viewer/ViewerContext"
import { SettingsContext, ThemeContext } from "../App"
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { InteractionManager, XR } from "@react-three/xr"
import { useRequestXR } from "../utilities/useRequestXR"

/**
 * Helper component that helps ViewerManager set camera position during mount, and keep audio listener with camera.
 * @returns 
 */
function CameraHelper() {
    const {defaultCameraProps, defaultXRCameraProps, cameraRef, audioListener, xrMode} = useContext(ViewerContext)
    const { camera } = useThree()
    // Keep camera reference up to date, and move camera back to starting pose if camera updated / pose updated (hacky, but works)
    // Todo: Allow different poses for XR and non-XR
    useLayoutEffect(()=>{
        cameraRef.current = camera
        if (camera) {
            if (xrMode !== null) {
                if (defaultXRCameraProps.position) {
                    camera.position.set(defaultXRCameraProps.position)
                }
                if (defaultXRCameraProps.rotation) {
                    camera.rotation.set(defaultXRCameraProps.rotation)
                }
                if (defaultXRCameraProps.fov) {
                    camera.fov = defaultXRCameraProps.fov
                }
                if (defaultXRCameraProps.position || defaultXRCameraProps.rotation || defaultXRCameraProps.fov) {
                    camera.updateProjectionMatrix()
                }
            } else {
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
        }
    }, [defaultCameraProps, defaultXRCameraProps, camera, xrMode])
    // Keep audio listener reference up to date
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

/**
 * Helps ViewerManager update XR related state / references
 */
function XRHelper() {
    const gl = useThree((state) => state.gl)
    const {_setXrMode, xrSessionRef, xrRequesterRef} = useContext(ViewerContext)
    const {requestSession, sessionMode} = useRequestXR([], {}, gl, xrSessionRef)
    xrRequesterRef.current = requestSession
    useEffect(()=>{
        _setXrMode(sessionMode)
    }, [sessionMode])
    return null
}

// Convenience component to provide common contexts to viewport children, in the future may include 3DTilesManager, NexusManager, etc which serves to manage 3DTilesObject and NexusObject on each render.
// TODO: Register managers required and add dynamically (same with ContextBridge required contexts)
function ViewportCanvas({children, paused=false, foveation=0, ...props}) {
    const ContextBridge = useContextBridge(EditorContext, ViewerContext, SettingsContext, ThemeContext)
    const wrappedChildren = Children.map(children, (child) => (
        <CompositeSuspense>
            {child}
        </CompositeSuspense>
    ))
    return (
        <Canvas vr invalidateFrameloop={paused} {...props}>
            <ContextBridge>
                <XR foveation={foveation}>
                    <CameraHelper/>
                    <XRHelper/>
                    <PotreeManager>
                        <InteractionManager>
                            {wrappedChildren}
                        </InteractionManager>
                    </PotreeManager>
                </XR>
            </ContextBridge>
        </Canvas>
    );
}

// Post processing seems to be breaking Potree??

export default ViewportCanvas;