// JSX of magenta wireframe cube using react-three-fiber

import { Color } from "@react-three/fiber";
import { useContext } from "react";
import { EditorContext } from "../editor/EditorContext";
import { ColorType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"
import UnifiedInteractive from "./subcomponents/UnifiedInteractive";

type TestObjectProps = VaporComponentProps & {color: Color, wireframe: boolean}

export const TestObject: VaporComponent = ({color, wireframe, position, rotation, scale, ...props}: TestObjectProps) => {
    const editorContext = useContext(EditorContext)
    return (
        <UnifiedInteractive onClick={()=>{console.log(`${props.name} clicked.`)}} parentObjectID={props.objectID}>
            <mesh {...{position, rotation, scale}}>
                <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
                <meshBasicMaterial attach="material" color={color} wireframe={wireframe}/>
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
    }
}