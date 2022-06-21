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
import { PerspectiveCamera } from "three"

export function GenericCameraUpdater() {
    useCameraUpdateHelper()
    return null
}

export function GenericXRCameraUpdater() {
    useXRCameraUpdateHelper()
    return null
}

// export function useCameraUpdateHelper() {
//     const {defaultCameraProps, controlCountRef} = useContext(ViewerContext)
//     const {camera} = useThree()
//     useLayoutEffect(()=>{
//         camera.position.set(...defaultCameraProps.position)
//         camera.rotation.set(...defaultCameraProps.rotation)
//         // console.log(camera, defaultCameraProps)
//         if (camera instanceof PerspectiveCamera) {
//             camera.fov = defaultCameraProps.fov
//             camera.updateProjectionMatrix()
//         }
//         // console.log("Camera updated", camera.position, camera.rotation)
//     }, [])
// }

// export function useXRCameraUpdateHelper() {
//     const {defaultXRCameraProps, cameraRef} = useContext(ViewerContext)
//     const gl = useThree((state) => state.gl)
//     const {player} = useXR()
//     useLayoutEffect(()=>{
//         player.position.set(...defaultXRCameraProps.position)
//         player.rotation.set(...defaultXRCameraProps.rotation)
//         return ()=>{
//             // Grab XR camera pose
//             const pose = gl.xr.getCamera().matrixWorld.clone()
//             player.position.set(0,0,0)
//             player.rotation.set(0,0,0)
//             cameraRef.current?.matrixWorld.copy(pose)
//         }
//     }, [])
// }

export function useCameraUpdateHelper() {
    const {defaultCameraProps, controlCountRef} = useContext(ViewerContext)
    const {camera} = useThree()
    const {player} = useXR()
    useLayoutEffect(()=>{
        if (controlCountRef.current === 0) {
            // Only update camera if these are the first controls
            camera.position.set(0,0,0)
            camera.rotation.set(0,0,0)
            player.position.set(...defaultCameraProps.position)
            player.rotation.set(...defaultCameraProps.rotation)
            // console.log(camera, defaultCameraProps)
            if (camera instanceof PerspectiveCamera) {
                camera.fov = defaultCameraProps.fov
                camera.updateProjectionMatrix()
            }
        }
        controlCountRef.current++
    }, [])
}

export function useXRCameraUpdateHelper() {
    const {defaultXRCameraProps, controlCountRef} = useContext(ViewerContext)
    const camera = useThree((state) => state.camera)
    const gl = useThree((state) => state.gl)
    const {player} = useXR()
    useLayoutEffect(()=>{
        if (controlCountRef.current === 0) {
            // Only update camera if these are the first controls
            camera.position.set(0,0,0) // Should not make a difference
            camera.rotation.set(0,0,0)
        }
        controlCountRef.current++
        return ()=>{
            // Get XR world pose (camera) and apply back to player
            // const pose = camera.matrixWorld.clone()
            const pose = gl.xr.getCamera().matrixWorld.clone()
            console.log(pose)
            player.position.set(0,0,0)
            player.rotation.set(0,0,0)
            player.matrixWorld.copy(pose)
        }
    }, [])
}

/**
 * Helper component that helps ViewerManager set camera position during mount, and keep audio listener with camera.
 * @returns 
 */
function CameraHelper() {
    const {cameraRef, audioListener} = useContext(ViewerContext)
    const { camera, gl } = useThree()
    // Keep camera reference in ViewerContext up to date
    useLayoutEffect(()=>{
        cameraRef.current = camera
    }, [cameraRef])
    // Keep audio listener attached to camera
    useLayoutEffect(()=>{
        if (camera) {
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
            // console.log(session)
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