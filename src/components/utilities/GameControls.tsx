import { PointerLockControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three"
import { useKeyPress } from "../../utilities";
import { CustomPointerLockControls } from "./CustomPointerLockControls";

// WASD / Arrow Keys + Shift (down) + Space (up) + Pointer Lock controls
export default function GameControls({mass=1, force=1, friction=2}) {
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
    return (
        <CustomPointerLockControls/>
    )
}