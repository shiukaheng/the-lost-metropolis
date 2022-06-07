import { useContextBridge } from "@react-three/drei"
import { PotreeManager } from "../3d/managers/PotreeManager"
import { Children, useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react"
import CompositeSuspense from "../3d/subcomponents/CompositeSuspense"
import { EditorContext } from "../editor/EditorContext"
import { Camera, Canvas, useFrame, useThree } from "@react-three/fiber"
import { ViewerContext } from "../viewer/ViewerContext"
import { SettingsContext, ThemeContext } from "../App"
import { InteractionManager, useXR, XR } from "@react-three/xr"
import { twMerge } from "tailwind-merge"
import { useEventListener } from "../../utilities"

/**
 * Helper component that helps ViewerManager set camera position during mount, and keep audio listener with camera.
 * @returns 
 */
function CameraHelper() {
    const {defaultCameraProps, defaultXRCameraProps, cameraRef, audioListener, xrMode} = useContext(ViewerContext)
    const { camera, gl } = useThree()
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
            cameraRef.current?.position.set(0, 0, 0)
            cameraRef.current?.rotation.set(0, 0, 0)
            cameraRef.current?.updateProjectionMatrix()
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
function ViewportCanvas({children, foveation=0, className, ...props}) {
    const ContextBridge = useContextBridge(EditorContext, ViewerContext, SettingsContext, ThemeContext)
    const wrappedChildren = Children.map(children, (child) => (
        <CompositeSuspense>
            {child}
        </CompositeSuspense>
    ))
    return (
        <Canvas className={twMerge(className, "viewport-canvas")} {...props}>
            <ContextBridge>
                <XR foveation={foveation}>
                    <CameraHelper/>
                    <XRHelper/>
                    <AudioContextHelper/>
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

function AudioContextHelper() {
    const {audioListener, xrMode, eventDispatcher} = useContext(ViewerContext)
    const gl = useThree((state) => state.gl)
    const resume = useCallback(()=>{
        if (audioListener) {
            audioListener.context.resume()
        }
    }, [audioListener])
    const resumeNumRef = useRef(0) // Does not actually tracks number of resumes accurate, but as long as it tracks the first resume fine.
    // Redirect audioContext state changes to eventDispatcher
    useEffect(()=>{
        if (!audioListener?.context) {
            return
        }
        if (audioListener?.context?.state === "running") {
            resumeNumRef.current++
            if (resumeNumRef.current === 1) {
                eventDispatcher.dispatchEvent({type: "audio-start"})
            }
        }
        (audioListener.context as AudioContext).onstatechange = (e)=>{
            // If suspended, emit event
            if (e.target.state === "suspended") {
                eventDispatcher.dispatchEvent({type: "audio-suspended"})
            }
            // If resumed, emit event
            if (e.target.state === "running") {
                eventDispatcher.dispatchEvent({type: "audio-resumed"})
                resumeNumRef.current++
                if (resumeNumRef.current === 1) {
                    eventDispatcher.dispatchEvent({type: "audio-start"})
                }
            }
            // If ended, emit event
            if (e.target.state === "closed") {
                eventDispatcher.dispatchEvent({type: "audio-ended"})
            }
            console.log(e.target.state)
        }
        // Cleanup
        return ()=>{
            (audioListener.context as AudioContext).onstatechange = null
        }
    }, [audioListener, eventDispatcher])
    // Trigger resume when session type changes (desktop, xr, ar)
    useEffect(()=>{
        resume()
    }, [xrMode])
    // Trigger resume when pointerlock change occurs
    useEventListener("pointerlockchange", resume, document)
    return null
}

// Post processing seems to be breaking Potree??

export default ViewportCanvas;