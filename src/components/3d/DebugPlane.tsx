// react-three-fiber component to render a wireframe plane of specified size and color

import { Color } from "@react-three/fiber";

type DebugPlaneProps = JSX.IntrinsicElements['mesh'] & {
    width?: number
    height?: number
    width_segments?: number
    height_segments?: number
    color?: Color
}

function DebugPlane({width=10, height=10, width_segments=10, height_segments=10, color="white", ...props}:DebugPlaneProps) {
    return (
        <mesh {...props}>
            <planeBufferGeometry attach="geometry" args={[width, height, width_segments, height_segments]} />
            <meshBasicMaterial attach="material" color={color} wireframe={true} />
        </mesh>
    )
}
    
export default DebugPlane;