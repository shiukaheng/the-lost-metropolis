import { useEffect, useRef, useState } from "react"
import { XRGestures } from "../../../lib/XRGestures/XRGestures";
import { Camera, Clock, Event, Group, Raycaster, Vector2, Vector3, WebXRManager } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { useArrayUpdateDiff, useRefContext, useThreeEventListener } from "../../../utilities";
import { useCallback } from "react";
import { connectStorageEmulator } from "firebase/storage";
import { ViewerContext } from "../../viewer/ViewerContext";

// export function useXRGestures(
//     onTap?: (e: Event)=>void, 
//     onDoubleTap?: (e: Event)=>void, 
//     onPress?: (e: Event)=>void, 
//     onSwipe?: (e: Event)=>void, 
//     onPan?: (e: Event)=>void, 
//     onPinch?: (e: Event)=>void, 
//     onRotate?: (e: Event)=>void) {
//     const XRGesturesRef = useRef<undefined | XRGestures>()
//     const gl = useThree((state) => state.gl)
//     useEffect(()=>{
//         XRGesturesRef.current = (gl !== undefined) ? new XRGestures(gl) : undefined
//         if (XRGesturesRef.current) {
//             onTap && XRGesturesRef.current.addEventListener("tap", onTap)
//             onDoubleTap && XRGesturesRef.current.addEventListener("doubletap", onDoubleTap)
//             onPress && XRGesturesRef.current.addEventListener("press", onPress)
//             onSwipe && XRGesturesRef.current.addEventListener("swipe", onSwipe)
//             onPan && XRGesturesRef.current.addEventListener("pan", onPan)
//             onPinch && XRGesturesRef.current.addEventListener("pinch", onPinch)
//             onRotate && XRGesturesRef.current.addEventListener("rotate", onRotate)
//         }
//         return ()=>{
//             XRGesturesRef.current?.dispose()
//             XRGesturesRef.current = undefined
//             onTap && XRGesturesRef.current?.removeEventListener("tap", onTap)
//         }
//     }, [gl])
//     // Update XR gestures
//     useFrame(()=>{
//         XRGesturesRef.current?.update()
//     })
// }


export function useXRGestures(onTap, onDoubleTap, doubleTapExpires=0.2) {
    const {gl} = useThree()
    const controller0 = useController(0)
    const controller1 = useController(1)
    const xrCamera = useXRCamera()
    const [clock] = useState<Clock>(()=>new Clock())
    const timeoutIDRef = useRef<number|null>(null)
    const isTwoTouchRef = useRef(false)
    const twoTouchRef = useRef<Vector2|null>(null)
    const viewerContextRef = useRefContext(ViewerContext)
    const cancelTimeout = useCallback(()=>{
        if (timeoutIDRef.current !== null) {
            clearTimeout(timeoutIDRef.current)
            timeoutIDRef.current = null
        }
    }, [])
    // Add listeners to controller
    const handler = useCallback((e)=>{
        // Clear timeout if there is one
        cancelTimeout()
        const dt = clock.getDelta()
        if (clock.running && dt < doubleTapExpires) {
            // If second tap within double tap time (and it's not the first tap), then double tap
            onDoubleTap && onDoubleTap(controller0?.getWorldPosition(new Vector3()), controller0?.getWorldDirection(new Vector3()).multiplyScalar(-1))
        } else {
            // If it is not, queue a timeout to fire a tap in the future
            timeoutIDRef.current = setTimeout(()=>{
                onTap && onTap(controller0?.getWorldPosition(new Vector3()), controller0?.getWorldDirection(new Vector3()))
            }, doubleTapExpires*1000)
        }
    }, [controller0])
    useThreeEventListener("selectstart", handler, controller0)
    // const handler2 = useCallback((e)=>{
    //     // Second finger touches screen, cancel timeout
    //     cancelTimeout()
    //     // Mark as two touch
    //     isTwoTouchRef.current = true
    //     console.log("two touch")
    // }, [])
    // useThreeEventListener("selectstart", handler2, controller1)
    // const handler2b = useCallback((e)=>{
    //     // Stop two touch frame updates if second finger leaves screen
    //     isTwoTouchRef.current = false
    //     twoTouchRef.current = null
    //     console.log("two touch ended")
    // }, [])
    // useThreeEventListener("selectend", handler2b, controller1)
    // const secondTouchFrameHandler = useCallback((state, dt)=>{
    //     if (isTwoTouchRef.current) {
    //         // Calculate the difference vector of the two touches
    //         // But before that, we have to extract the 2d position of the two touches from controller 0 and 1's position and direction vectors. We can directly use controller and controller 2 as they are updated.
    //         const cam_d = xrCamera?.getWorldDirection(new Vector3()) // For some magical reason, this line of code will fuck up the camera's direction vector..
    //         const con0_d = controller0?.getWorldDirection(new Vector3())
    //         const con1_d = controller1?.getWorldDirection(new Vector3())

    //         if (!(cam_d && con0_d && con1_d && xrCamera)) {
    //             throw new Error("Camera or controller is not defined")
    //         }
            
    //         // Truncate con0_d and con1_d have the same length when projected onto cam_d
    //         con0_d?.projectOnPlane(cam_d)
    //         con1_d?.projectOnPlane(cam_d)
    //         // TODO: This may be unnecessary. 

    //         // Get delta vector
    //         const cond_d = con1_d?.sub(con0_d)

    //         // Get the 2d position of cond_d in the camera's coordinate system
    //         // cond_d?.project(xrCamera.clone())

    //         // Correct for the aspect ratio since .project results in the X, Y coordinates having range [-1, 1] (normalized device coordinates)
    //         const twoFingerVec = new Vector2(cond_d?.x, cond_d?.y)

    //         // Emit delta vector if it's not the first frame
    //         if (twoTouchRef.current) {
    //             const dv = twoFingerVec.sub(twoTouchRef.current)
    //             viewerContextRef.current?.eventDispatcher.dispatchEvent({
    //                 type: "xr-gesture-two-touch",
    //                 message: {
    //                     deltaVector: dv,
    //                     deltaTime: dt,
    //                 }
    //             })
    //             console.log(cond_d)
    //         }
    //         // Update the reference
    //         twoTouchRef.current = twoFingerVec
    //     }
    // }, [controller0, controller1, xrCamera, gl])
    // useFrame(secondTouchFrameHandler)
}

// These hooks assumes we are already in a XR session

function useController(num: number) {
    const {gl} = useThree()
    const [controller, setController] = useState<Group|null>(null)
    useEffect(()=>{
        setController(gl.xr.getController(num))
    }
    , [gl])
    return controller
}

function useXRCamera() {
    const {gl} = useThree()
    const [camera, setCamera] = useState<Camera|null>(null)
    useEffect(()=>{
        setCamera(gl.xr.getCamera())
    }
    , [gl])
    return camera
}