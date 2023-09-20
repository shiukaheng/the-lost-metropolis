// JSX of magenta wireframe cube using react-three-fiber

import { Color } from "@react-three/fiber";
import { useContext, useRef } from "react";
import { EditorContext } from "../editor/EditorContext";
import { ColorType, StringType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"
import UnifiedInteractive from "./subcomponents/UnifiedInteractive";
import { Mesh, MeshBasicMaterial } from "three";
import { useTransitionAlpha } from "./managers/ScenesManager";

type TestObjectProps = VaporComponentProps & {color: Color, wireframe: boolean, sceneID: string}

export const TestObject: VaporComponent = ({color, wireframe, position, rotation, scale, sceneID, ...props}: TestObjectProps) => {
    const editorContext = useContext(EditorContext)
    const meshRef = useRef<Mesh>(null)
    useTransitionAlpha(sceneID, 0, 1, 0, 0, 1, 0, (alpha) => {
        if (meshRef.current !== null) {
            const material = meshRef.current.material as MeshBasicMaterial
            material.opacity = 1 - Math.abs(alpha)
        }
    })
    return (
        <UnifiedInteractive onClick={()=>{console.log(`${props.name} clicked.`)}} parentObjectID={props.objectID}>
            <mesh {...{position, rotation, scale}} ref={meshRef}>
                <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
                <meshBasicMaterial attach="material" color={color} wireframe={wireframe} transparent/>
            </mesh>
        </UnifiedInteractive>
    )
}

TestObject.displayName = "Test object"
TestObject.componentType = "TestObject"
TestObject.inputs = {
    ...genericInputs,
    "color": {
        "type": ColorType,
        "default": [1, 1, 1]
    },
    "sceneID": {
        "type": StringType,
        "default": ""
    }
}