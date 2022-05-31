// All use*Controls must be used in components within a provider of ViewerContext, i.e. Viewer

import { useFrame, useThree } from "@react-three/fiber";
import { useXR, useXRFrame } from "@react-three/xr";
import { useCallback, useContext, useEffect, useRef } from "react";
import { ArrayCamera, Intersection, MathUtils, Object3D, Raycaster, Vector2, Vector3 } from "three";
import { XRGestures } from "../../lib/XRGestures/XRGestures";
import { ViewerContext } from "../viewer/ViewerContext";
import { Event } from "three";


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
            XRGesturesRef.current = undefined
            onTap && XRGesturesRef.current?.removeEventListener("tap", onTap)
            
        }
    }, [gl])
    // Update XR gestures
    useFrame(()=>{
        XRGesturesRef.current?.update()
    })
}


// use*Controls provide a convenient way to hook into controller callbacks

function checkValidTarget() {

}

const zero = new Vector2(0,0)

type TeleportDestination = {
    valid: boolean,
    position: Vector3 | null, // could be null if no destination is found at all
    normal: Vector3 | null, // could be null if the destination is not a plane or if there is no destination found at all
}

type TeleportableDestination = {
    valid: true,
    position: Vector3,
    normal: Vector3 | null
}

/**
 * Processes a list of intersections from raycaster to determine whether there is a teleport destination
 * @param intersections the list of intersections from raycaster
 * @param upVector the up vector to use for determining the validity of the teleport destination
 * @param maxDeg the maximum angle between the up vector and the normal of the teleport destination for it to be considered valid
 * @returns a TeleportDestination object
 */
function processIntersections(intersections: Intersection<Object3D>[], upVector=new Vector3(0, 1, 0), maxDeg=10): TeleportDestination {
    for (const intersection of intersections) {
        if (intersection.object.userData.isTeleportTarget) {
            const normal = intersection.face?.normal
            if (normal) {
                const angle = MathUtils.radToDeg(normal.angleTo(upVector))
                if (angle <= maxDeg) {
                    return {
                        valid: true,
                        position: intersection.point,
                        normal,
                    }
                } else {
                    return {
                        valid: false,
                        position: intersection.point,
                        normal,
                    }
                }
            } else {
                return {
                    valid: false,
                    position: intersection.point,
                    normal: null,
                }
            }
        } else if (intersection.object.userData.bypassTeleportRaycaster) {
            // If object marked explicitly with ".bypassTeleportRaycaster", then don't check for teleport destination
        } else {
            // If object is neither marked with ".bypassTeleportRaycaster" nor with ".isTeleportTarget", then return a non-valid destination
            return {
                valid: false,
                position: intersection.point,
                normal: intersection.face?.normal || null,
            }
        }
    }
    // If nothing comes up as a teleport destination, return a non-valid destination
    return {
        valid: false,
        position: null,
        normal: null,
    }
}

export function useARControls(onInteract, onTeleport: (TeleportableDestination)=>void) {
    const {scene, gl, camera: normalCamera} = useThree();
    const raycasterRef = useRef<null | Raycaster>();
    useEffect(()=>{
        raycasterRef.current = new Raycaster();
    }, [])
    const attemptTeleport = useCallback(()=>{
        if (raycasterRef.current) {
            // Raycast from AR camera and check if it hits a teleportable object
            console.log("Attempt teleport")
            raycasterRef.current.setFromCamera(zero, normalCamera);
            const intersects = raycasterRef.current.intersectObjects(scene.children, true);
            console.log(normalCamera, scene.children, raycasterRef.current, intersects)
            const destination = processIntersections(intersects)
            if (destination.valid) {
                onTeleport(destination)
            }
        }
    }, [])
    useXRGestures(
        undefined,
        (e)=>{
            attemptTeleport()
        },
    )
}

export function useVRControls(onInteract, onTeleport) {
}

// export function useDesktopControls() {
    // Perhaps this can be unified here later, but for now it's unnecessary as we have a separate component for desktop controls
// }

export function XRLocomotion({locomotionLambda=1.5}) {
    // Allows locomotion on XR devices.

    // For AR: 
    // When the user double taps the screen, 
    // raycast and find closest object with "teleport-target" tag. 
    // If a "teleport-blocker" precedes the target, teleportation will be blocked. 
    // Validate teleportation target with normal vectors.
    // Show a sphere ripple around the target if the target is not blocked.

    // For VR: 
    // When the user holds the trigger, 
    // Project a parabolic line from the controller's position to the controller's forward vector.
    // For each segment (segment length definable), raycast and seek the closest object with "teleport-target" tag.
    // If a "teleport-blocker" precedes the target, teleportation will be blocked, and the parabola will be terminated. At the end of parabola, a translucent sphere indicates a blocked target.
    // If a "teleport-target" is found, the parabola will be terminated, and depending on whether the target is valid, either a translucent sphere or a solid sphere will be shown at the target.
    // Only show a solid sphere if the target is valid.

    // For both AR and VR:
    // We teleport / move the user by moving the player object (group of camera and controllers) from the useXR hook.
    // Teleportation will retain user's orientation.
    // The actual targeted location for teleportation should be the target location minus the offset from the XR space's  world origin.
    // During VR locomotion animation, display helmet overlay to reduce the user's field of view for better experience.
    // Use Three.js's damp to transition to target position, but clear target if user exits XR.

    // Initialize the target position to the XR camera's initial position (found in ViewerContext)
    const targetPositionRef = useRef<Vector3>(new Vector3())
    const lastPositionRef = useRef<Vector3>(new Vector3())
    const dtRef = useRef<number>(0)

    const {defaultXRCameraProps, xrMode} = useContext(ViewerContext)
    useEffect(()=>{
        targetPositionRef.current.set(...defaultXRCameraProps.position)
    }, [defaultXRCameraProps])

    // Move the player to the target position
    const {player} = useXR()
    useFrame((state, dt)=>{
        if (state.gl.xr.isPresenting) {
            lastPositionRef.current.copy(player.position)
            dtRef.current = dt
            player.position.set(
                MathUtils.damp(player.position.x, targetPositionRef.current.x, locomotionLambda, dt),
                MathUtils.damp(player.position.y, targetPositionRef.current.y, locomotionLambda, dt),
                MathUtils.damp(player.position.z, targetPositionRef.current.z, locomotionLambda, dt)
            )
        }
    })

    const gl = useThree((state)=>state.gl)

    const moveTo = useCallback((destination: Vector3)=>{
        const newDest = new Vector3().copy(destination).sub(gl.xr.getCamera().position).add(player.position)
        newDest.y = destination.y
        targetPositionRef.current.copy(destination)
    }, [player])

    // const moveToRaw = useCallback((x, y, z)=>{
    //     moveTo(new Vector3(x, y, z))
    // }, [])

    // window.moveTo = moveToRaw

    useARControls(undefined, (dest:TeleportableDestination)=>{
        moveTo(dest.position)
    })

}