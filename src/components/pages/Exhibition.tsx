import View from './View'

function Exhibition() {
    return (
        <View defaultCameraProps={
            {
                position: [0,0,0],
                rotation: [0,0,0],
                fov: 90
            }
        }>
            <ambientLight intensity={1} />
            {/* Red box with mesh basic shading */}
            <mesh>
                <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
                <meshBasicMaterial attach="material" color="red" />
            </mesh>
        </View>
    )
}

export default Exhibition