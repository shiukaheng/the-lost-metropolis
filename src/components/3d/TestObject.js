// JSX of magenta wireframe cube using react-three-fiber
function TestObject({...props}) {
    return (
        <mesh {...props}>
            <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            <meshBasicMaterial attach="material" color="magenta" wireframe />
        </mesh>
    )
}

export default TestObject;