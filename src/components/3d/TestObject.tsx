// JSX of magenta wireframe cube using react-three-fiber

import { useContext } from "react";
import { EditorContext } from "../editor/EditorContext";
import UnifiedInteractive from "./subcomponents/UnifiedInteractive";

type TestObjectProps = JSX.IntrinsicElements['group']

function TestObject({color, wireframe, ...props}:TestObjectProps): JSX.Element {
    const editorContext = useContext(EditorContext)
    return (
        <UnifiedInteractive onClick={()=>{console.log(`${props.name} clicked.`)}} parentID={props.id}>
            <mesh {...props}>
                <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
                <meshBasicMaterial attach="material" color={color} wireframe={wireframe}/>
            </mesh>
        </UnifiedInteractive>
    )
}

export default TestObject;