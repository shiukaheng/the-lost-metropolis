// JSX of magenta wireframe cube using react-three-fiber

import { useContext } from "react";
import { EditorContext } from "../editor/EditorContext";
import { wrapOnClick } from "../editor/utilities";

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