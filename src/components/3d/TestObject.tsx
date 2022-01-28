// JSX of magenta wireframe cube using react-three-fiber

import { editorRegister } from "../Editor";
import { Vector3Type } from "../editor/EditorInputTypes";

type TestObjectProps = JSX.IntrinsicElements['group']

function TestObject({...props}:TestObjectProps) {
    return (
        <mesh {...props}>
            <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            <meshBasicMaterial attach="material" color="magenta" wireframe />
        </mesh>
    )
}

export default TestObject;