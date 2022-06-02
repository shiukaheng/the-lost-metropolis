import { useEffect, useRef } from "react"
import { XRGestures } from "../../../lib/XRGestures/XRGestures";
import { Event } from "three";
import { useFrame, useThree } from "@react-three/fiber";

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

