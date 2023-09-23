// JSX of magenta wireframe cube using react-three-fiber

import { Color, useFrame } from "@react-three/fiber";
import { useContext, useRef } from "react";
import { EditorContext } from "../editor/EditorContext";
import { ColorType, NumberType, StringType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"
import UnifiedInteractive from "./subcomponents/UnifiedInteractive";
import { Mesh, MeshBasicMaterial } from "three";
import { useTransitionAlpha } from "./managers/ScenesManager";

type BackgroundObjectProps = VaporComponentProps & {sceneID: string, scalarScale: number}

export const BackgroundObject: VaporComponent = ({scalarScale, ...props}: BackgroundObjectProps) => {
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
        <UnifiedInteractive onClick={()=>{console.log(`${props.name} clicked.`)}} parentObjectID={props.objectID}>
            <mesh scale={scalarScale} ref={meshRef}>
                <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
                <meshBasicMaterial attach="material" color="black" transparent/>
            </mesh>
        </UnifiedInteractive>
    )
}

BackgroundObject.displayName = "Test object"
BackgroundObject.componentType = "BackgroundObject"
BackgroundObject.inputs = {
    // "...genericInputs,
    // "sceneID": {
    //     "type": StringType,
    //     "default": ""
    // }"
    "scale": {
        "type": NumberType,
        "default": 100
    }
}