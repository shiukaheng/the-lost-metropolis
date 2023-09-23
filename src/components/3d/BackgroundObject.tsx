import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, MeshBasicMaterial } from "three";
import { useTransitionAlpha } from "./managers/ScenesManager";

export function BackgroundObject({scalarScale}) {
    const meshRef = useRef<Mesh>(null)
    useTransitionAlpha("idle", 0, 5, 0, 0, 5 , 0, (alpha) => {
        if (meshRef.current !== null) {
            const material = meshRef.current.material as MeshBasicMaterial
            material.opacity = Math.abs(alpha)
        }
    })
    useFrame((state, delta) => {
        // Make object track camera position
        if (meshRef.current !== null) {
            meshRef.current.position.copy(state.camera.position)
        }
    })
    return (
        <mesh scale={scalarScale} ref={meshRef}>
            <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            <meshBasicMaterial attach="material" color="black" transparent/>
        </mesh>
    )
}