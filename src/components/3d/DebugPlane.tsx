// react-three-fiber component to render a wireframe plane of specified size and color

import { MeshReflectorMaterial } from "@react-three/drei";
import { Color } from "@react-three/fiber";
import { ColorType, NumberType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"

type DebugPlaneProps = VaporComponentProps & {
    width?: number
    height?: number
    width_segments?: number
    height_segments?: number
    color?: Color
}

export const DebugPlane: VaporComponent = ({width=10, height=10, width_segments=10, height_segments=10, color="white", ...props}:DebugPlaneProps) => {
    return (
        <mesh {...props}>
            <planeBufferGeometry attach="geometry" args={[width, height, width_segments, height_segments]} />
            <meshBasicMaterial attach="material" color={color} wireframe={true} />
        </mesh>
    )
}

DebugPlane.displayName = "Debug plane"
DebugPlane.componentType = "DebugPlane"
DebugPlane.inputs = {
    ...genericInputs,
    width: {
        type: NumberType,
        default: 10
    },
    height: {
        type: NumberType,
        default: 10
    },
    width_segments: {
        type: NumberType,
        default: 10
    },
    height_segments: {
        type: NumberType,
        default: 10
    },
    color: {
        type: ColorType,
        default: [1, 1, 1]
    },
}
    
export default DebugPlane;