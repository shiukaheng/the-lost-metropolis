import { useContextBridge } from "@react-three/drei"
import { PotreeManager } from "../3d/managers/PotreeManager"
import { Children, forwardRef, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import CompositeSuspense from "../3d/subcomponents/CompositeSuspense"
import { EditorContext } from "../editor/EditorContext"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ViewerContext } from "../viewer/ViewerContext"
import { SettingsContext, ThemeContext } from "../App"
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { InteractionManager, useXR, XR } from "@react-three/xr"
import { twMerge } from "tailwind-merge"

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
    }, [defaultCameraProps, defaultXRCameraProps, camera, xrMode])
    const {player} = useXR()
    useLayoutEffect(()=>{
        if (player && xrMode !== null) {
            if (defaultXRCameraProps.position) {
                player.position.fromArray(defaultXRCameraProps.position)
            }
            if (defaultXRCameraProps.rotation) {
                player.rotation.fromArray(defaultXRCameraProps.rotation)
            }
        }
        if (xrMode === null) {
            player.position.set(0,0,0)
            player.rotation.set(0,0,0)
        }
    }, [player, xrMode])
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
    const {xrSessionRef, _setXrMode, xrRequesterRef} = useContext(ViewerContext)
    const gl = useThree((state) => state.gl)
    const requestSession = useCallback((mode, options={requiredFeatures:["local-floor"]}) => {
        navigator.xr?.requestSession(mode, options).then(session => {
            xrSessionRef.current = session

            function onSessionEnd() {
                xrSessionRef.current?.removeEventListener("end", onSessionEnd);
                xrSessionRef.current = null
                _setXrMode(null)
            }

            session.addEventListener("end", onSessionEnd)
            console.log(session)
            gl.xr.setSession(session).then(()=>{
                xrSessionRef.current = session
                _setXrMode(mode)
            })
        })
    }, [gl])
    xrRequesterRef.current = requestSession
    window.requestSession = requestSession
    return null
}

export function XRRequesterRefExtractor({requesterRefGetterRef}) { // This is TERRIBLE
    const {xrRequesterRef} = useContext(ViewerContext)
    requesterRefGetterRef.current = ()=>xrRequesterRef
    return null
}

// Convenience component to provide common contexts to viewport children, in the future may include 3DTilesManager, NexusManager, etc which serves to manage 3DTilesObject and NexusObject on each render.
// TODO: Register managers required and add dynamically (same with ContextBridge required contexts)
function ViewportCanvas({children, paused=false, foveation=0, className, ...props}) {
    const ContextBridge = useContextBridge(EditorContext, ViewerContext, SettingsContext, ThemeContext)
    const wrappedChildren = Children.map(children, (child) => (
        <CompositeSuspense>
            {child}
        </CompositeSuspense>
    ))
    return (
        <Canvas vr invalidateFrameloop={paused} className={twMerge(className, "viewport-canvas")} {...props}>
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