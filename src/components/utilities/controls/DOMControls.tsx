import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDeviceSelectors } from "react-device-detect";
import { useMediaQuery } from "react-responsive";
import { Vector3, Euler, Raycaster, Object3D } from "three"
import { useEventListener, useKeyPress } from "../../../utilities";
import { defaultViewerContext, ViewerContext } from "../../viewer/ViewerContext";
import { useCameraUpdateHelper } from "../../viewer/ViewportCanvas";
import { CustomPointerLockControls } from "../CustomPointerLockControls";
import { OrbitControls } from "./mobile/OrbitControlsComponent";

export default function DOMControls({mass=1, force=10, friction=2}) {
    const [selectors, data] = useDeviceSelectors(window.navigator.userAgent)
    const { isMobile } = selectors
    // const isMobile = useMediaQuery({ query: "(max-width: 768px)" })
    return (
        isMobile ?
        <TouchControls/> :
        <DesktopControls mass={mass} force={force} friction={friction}/>
    )
}

// WASD / Arrow Keys + Shift (down) + Space (up) + Pointer Lock controls
export function DesktopControls({mass=1, force=10, friction=2}) {
    useCameraUpdateHelper()
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
    
    const deltaLocalVelocity = useMemo(() => new Vector3(0, 0, 0), []);
    const deltaAbsoluteVelocity = useMemo(() => new Vector3(0, 0, 0), []);

    useFrame(({camera}, delta) => {
        deltaLocalVelocity.set(0, 0, 0);
        deltaAbsoluteVelocity.set(0, 0, 0);

        (forward1 || forward2) && (deltaLocalVelocity.z -= 1);
        (backward1 || backward2) && (deltaLocalVelocity.z += 1);
        (left1 || left2) && (deltaLocalVelocity.x -= 1);
        (right1 || right2) && (deltaLocalVelocity.x += 1);
        up && (deltaAbsoluteVelocity.y += 1);
        down && (deltaAbsoluteVelocity.y -= 1);

        // Normalize the force vector
        deltaLocalVelocity.normalize().multiplyScalar(force);
        deltaAbsoluteVelocity.multiplyScalar(force);

        // delta v = at and a = F/m, so delta v = F/m * t
        deltaLocalVelocity.multiplyScalar(delta / mass);
        deltaAbsoluteVelocity.multiplyScalar(delta / mass);

        // Transform the local velocity to world coordinates
        deltaLocalVelocity.applyEuler(camera.rotation);
        
        const totalDeltaVelocity = deltaLocalVelocity.clone().add(deltaAbsoluteVelocity);
        
        // Add the velocity to the camera's velocity
        cameraVelocityRef.current.add(totalDeltaVelocity);

        // Apply the velocity to the camera position
        camera.position.add(cameraVelocityRef.current.clone().multiplyScalar(delta));
        
        // Apply friction to the velocity
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
export function TouchControls({cameraOffset=0.1}) {
    const {xrMode} = useContext(ViewerContext)
    return (
        xrMode ?
        null :
        <OrbitControls cameraOffset={cameraOffset} maxDistance={cameraOffset} minDistance={cameraOffset} dampingFactor={0.2} panSpeed={5} rotateSpeed={0.5}/>
    )
}