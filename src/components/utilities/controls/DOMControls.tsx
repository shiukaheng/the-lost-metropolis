import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useDeviceSelectors } from "react-device-detect";
import { Vector3 } from "three"
import { useEventListener, useKeyPress } from "../../../utilities";
import { CustomPointerLockControls } from "../CustomPointerLockControls";
import { OrbitControls } from "./mobile/OrbitControls";

export default function DOMControls({mass=1, force=10, friction=2}) {
    const [selectors, data] = useDeviceSelectors(window.navigator.userAgent)
    const { isMobile } = selectors
    return (
        isMobile ?
        null :
        <GameControls mass={mass} force={force} friction={friction}/>
    )
}

// WASD / Arrow Keys + Shift (down) + Space (up) + Pointer Lock controls
export function DesktopControls({mass=1, force=10, friction=2}) {
    const gl = useThree((state) => state.gl)
    const cameraVelocityRef = useRef(new Vector3(0, 0, 0));
    const forward1 = useKeyPress("w");
    const forward2 = useKeyPress("ArrowUp");
    const backward1 = useKeyPress("s");
    const backward2 = useKeyPress("ArrowDown");
    const left1 = useKeyPress("a");
    const left2 = useKeyPress("ArrowLeft");
    const right1 = useKeyPress("d");
    const right2 = useKeyPress("ArrowRight");
    const up = useKeyPress(" ");
    const down = useKeyPress("Shift");
    useFrame(({camera}, delta) => {
        const deltaVelocity = new Vector3(0, 0, 0);
        // Start of as force vector in camera local space
        (forward1 || forward2) && (deltaVelocity.z -= 1);
        (backward1 || backward2) && (deltaVelocity.z += 1);
        (left1 || left2) && (deltaVelocity.x -= 1);
        (right1 || right2) && (deltaVelocity.x += 1);
        up && (deltaVelocity.y += 1);
        down && (deltaVelocity.y -= 1);
        // Normalize the force vector
        deltaVelocity.normalize().multiplyScalar(force);
        // delta v = at and a = F/m, so delta v = F/m * t
        deltaVelocity.multiplyScalar(delta / mass);
        // Transform the velocity to world coordinates
        deltaVelocity.applyEuler(camera.rotation);
        // Add the velocity to the camera's velocity
        cameraVelocityRef.current.add(deltaVelocity);
        // Apply the velocity to the camera position: s = s0 + vt
        camera.position.add(cameraVelocityRef.current.clone().multiplyScalar(delta));
        // Apply friction to the velocity
        // if (delta !== 0) { // Fix division by zero
        //     cameraVelocityRef.current.multiplyScalar(friction * delta);
        // }
        cameraVelocityRef.current.sub(cameraVelocityRef.current.clone().multiplyScalar(friction * delta));
    })
    // Set velocity to zero if window / tab loses focus
    const onBlur = () => {
        cameraVelocityRef.current.set(0, 0, 0);
    }
    useEventListener("blur", onBlur, window);
    return (
        <CustomPointerLockControls/>
    )
}

// Touch based controls (drag to pan camera, pinch to zoom, double tap to raycast to floor and move to that point)
export function TouchControls({orientataionControls=false}) {
    return (
        <OrbitControls />
    )
}