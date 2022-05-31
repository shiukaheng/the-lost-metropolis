// All use*Controls must be used in components within a provider of ViewerContext, i.e. Viewer

import { useFrame } from "@react-three/fiber";
import { useXR, useXRFrame } from "@react-three/xr";
import { useCallback, useContext, useEffect, useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { ViewerContext } from "../viewer/ViewerContext";

// use*Controls provide a convenient way to hook into controller callbacks
export function useARControls(onTap, onDoubleTap, onPress) {
}

export function useVRControls(onTrigger) {
}

// export function useDesktopControls() {
    // Perhaps this can be unified here later, but for now it's unnecessary as we have a separate component for desktop controls
// }

export function XRLocomotion({locomotionLambda=0.1}) {
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
    // The actual targeted location for teleportation should be the target location minus the offset from the user's current position.
    // During VR locomotion animation, display helmet overlay to reduce the user's field of view for better experience.
    // Use Three.js's damp to transition to target position, but clear target if user exits XR.

    // Initialize the target position to the XR camera's initial position (found in ViewerContext)
    const targetPositionRef = useRef<Vector3>(new Vector3())
    const lastPositionRef = useRef<Vector3>(new Vector3())
    const dtRef = useRef<number>(0)

    const {defaultXRCameraProps} = useContext(ViewerContext)
    useEffect(()=>{
        targetPositionRef.current.set(...defaultXRCameraProps.position)
    }, [defaultXRCameraProps])

    // Move the player to the target position
    const {player} = useXR()
    useFrame((state, dt)=>{
        lastPositionRef.current.copy(player.position)
        dtRef.current = dt
        player.position.set(
            MathUtils.damp(player.position.x, targetPositionRef.current.x, locomotionLambda, dt),
            MathUtils.damp(player.position.y, targetPositionRef.current.y, locomotionLambda, dt),
            MathUtils.damp(player.position.z, targetPositionRef.current.z, locomotionLambda, dt)
        )
    })

    const moveTo = useCallback((destination: Vector3)=>{
        targetPositionRef.current.copy(destination).sub(player.position)
    }, [player])

    window.moveTo = moveTo
    return null
}