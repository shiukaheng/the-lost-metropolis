// JSX of magenta wireframe cube using react-three-fiber

import { context } from "@react-three/fiber";
import { useContext } from "react";
import { editorRegister } from "../Editor";
import { EditorContext, TestContext, wrapOnClick } from "../editor/Editor";
import { Vector3Type } from "../editor/EditorInputTypes";

type TestObjectProps = JSX.IntrinsicElements['group']

function TestObject({color, wireframe, ...props}:TestObjectProps): JSX.Element {
    const editorContext = useContext(EditorContext)
    return (
        <mesh {...props} onClick={wrapOnClick(()=>{console.log(`${props.name} clicked.`)}, editorContext, props.id)}>
            <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            <meshBasicMaterial attach="material" color={color} wireframe={wireframe}/>
        </mesh>
    )
}

export default TestObject;