import { useEffect, useRef, useState } from "react"
import { XRGestures } from "../../../lib/XRGestures/XRGestures";
import { Clock, Event, Group, Raycaster, Vector3, WebXRManager } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { useArrayUpdateDiff, useThreeEventListener } from "../../../utilities";
import { useCallback } from "react";
import { connectStorageEmulator } from "firebase/storage";

export function useXRGestures(
    onTap?: (e: Event)=>void, 
    onDoubleTap?: (e: Event)=>void, 
    onPress?: (e: Event)=>void, 
    onSwipe?: (e: Event)=>void, 
    onPan?: (e: Event)=>void, 
    onPinch?: (e: Event)=>void, 
    onRotate?: (e: Event)=>void) {
    const XRGesturesRef = useRef<undefined | XRGestures>()
    const gl = useThree((state) => state.gl)
    useEffect(()=>{
        XRGesturesRef.current = (gl !== undefined) ? new XRGestures(gl) : undefined
        if (XRGesturesRef.current) {
            onTap && XRGesturesRef.current.addEventListener("tap", onTap)
            onDoubleTap && XRGesturesRef.current.addEventListener("doubletap", onDoubleTap)
            onPress && XRGesturesRef.current.addEventListener("press", onPress)
            onSwipe && XRGesturesRef.current.addEventListener("swipe", onSwipe)
            onPan && XRGesturesRef.current.addEventListener("pan", onPan)
            onPinch && XRGesturesRef.current.addEventListener("pinch", onPinch)
            onRotate && XRGesturesRef.current.addEventListener("rotate", onRotate)
        }
        return ()=>{
            XRGesturesRef.current?.dispose()
            XRGesturesRef.current = undefined
            onTap && XRGesturesRef.current?.removeEventListener("tap", onTap)
        }
    }, [gl])
    // Update XR gestures
    useFrame(()=>{
        XRGesturesRef.current?.update()
    })
}

export function useXRGesturesB(onTap, onDoubleTap, doubleTapExpires=0.2) {
    const {gl} = useThree()
    const [controller, setController] = useState<Group|null>(null)
    const [clock] = useState<Clock>(()=>new Clock())
    const [raycaster] = useState<Raycaster>(()=>{
        const r = new Raycaster()
        r.layers.set(3)
        return r
    })
    const timeoutIDRef = useRef<number|null>(null)
    // Retrive controller from xr
    useEffect(()=>{
        // console.log(xr)
        setController(gl.xr.getController(0))
    }, [gl])
    // Add listeners to controller
    const handler = useCallback((e)=>{
        if (timeoutIDRef.current) {
            clearTimeout(timeoutIDRef.current)
            timeoutIDRef.current = null
        }
        // raycaster.set(controller!.position, controller!.getWorldDirection(new Vector3()))
        // If dt is less than doubleTapExpires, then it is a double tap
        const dt = clock.getDelta()
        if (clock.running && dt < doubleTapExpires) {
            onDoubleTap && onDoubleTap(controller?.getWorldPosition(new Vector3()), controller?.getWorldDirection(new Vector3()).multiplyScalar(-1))
        } else {
            timeoutIDRef.current = setTimeout(()=>{
                onTap && onTap(controller?.getWorldPosition(new Vector3()), controller?.getWorldDirection(new Vector3()))
            }, doubleTapExpires*1000)
        }
    }, [controller])
    // Make useFrame call onTap if 
    useThreeEventListener("selectstart", handler, controller)
}