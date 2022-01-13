// react-three-fiber component to render a wireframe plane of specified size and color

function DebugPlane({width=10, height=10, width_segments=10, height_segments=10, color="white", ...props}) {
    return (
        <mesh {...props}>
            <planeBufferGeometry attach="geometry" args={[width, height, width_segments, height_segments]} />
            <meshBasicMaterial attach="material" color={color} wireframe={true} />
        </mesh>
    )
}
    
export default DebugPlane;