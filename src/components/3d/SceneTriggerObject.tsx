// JSX of magenta wireframe cube using react-three-fiber

import { Color, useFrame } from "@react-three/fiber";
import { useContext, useEffect, useRef } from "react";
import { EditorContext } from "../editor/EditorContext";
import { BooleanType, ColorType, StringType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"
import UnifiedInteractive from "./subcomponents/UnifiedInteractive";
import { Mesh } from "three";
import { ViewerContext } from "../viewer/ViewerContext";

type TestObjectProps = VaporComponentProps & {sceneID: string, enabled: boolean}

export const SceneTriggerObject: VaporComponent = ({sceneID, enabled, position, rotation, scale, ...props}: TestObjectProps) => {
    const meshRef = useRef<Mesh>(null)
    const { setScenes } = useContext(ViewerContext)
    const previouslyInRef = useRef<boolean>(false)
    useEffect(()=>{
        if (meshRef.current) {
            meshRef.current.geometry.computeBoundingBox()
        }
    }, [])
    useFrame((state, delta) => {
        let currentlyIn = false
        if (meshRef.current && meshRef.current.geometry.boundingBox !== null) {
            // Check if camera is inside bounding box
            const cameraPosition = state.camera.position
            // Transform bounding box to camera space
            const boundingBox = meshRef.current.geometry.boundingBox.clone()
            boundingBox.applyMatrix4(meshRef.current.matrixWorld)
            // Check if camera is inside bounding box
            if (boundingBox.containsPoint(cameraPosition)) {
                currentlyIn = true
            }
        }
        if (currentlyIn && !previouslyInRef.current) {
            // Transition to new scene
            // console.log("Transitioning to scene", sceneID)
            setScenes([sceneID])
            previouslyInRef.current = true
        } else if (!currentlyIn && previouslyInRef.current) {
            previouslyInRef.current = false
        }
    })
    return (
        <mesh {...{position, rotation, scale}} layers={5} ref={meshRef}>
            <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            <meshBasicMaterial attach="material" color="white" wireframe={true}/>
        </mesh>
    )
}

SceneTriggerObject.displayName = "Scene trigger object"
SceneTriggerObject.componentType = "SceneTriggerObject"
SceneTriggerObject.inputs = {
    ...genericInputs,
    "sceneID": {
        "type": StringType,
        "default": ""
    },
    "enabled": {
        "type": BooleanType,
        "default": false
    }
}