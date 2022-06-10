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
            {/* <MeshReflectorMaterial
                blur={[0, 0]} // Blur ground reflections (width, heigt), 0 skips blur
                mixBlur={0} // How much blur mixes with surface roughness (default = 1)
                mixStrength={15} // Strength of the reflections
                mixContrast={1} // Contrast of the reflections
                resolution={512} // Off-buffer resolution, lower=faster, higher=better quality, slower
                mirror={0} // Mirror environment, 0 = texture colors, 1 = pick up env colors
                depthScale={0} // Scale the depth factor (0 = no depth, default = 0)
                minDepthThreshold={0.9} // Lower edge for the depthTexture interpolation (default = 0)
                maxDepthThreshold={1} // Upper edge for the depthTexture interpolation (default = 0)
                depthToBlurRatioBias={0.25} // Adds a bias factor to the depthTexture before calculating the blur amount [blurFactor = blurTexture * (depthTexture + bias)]. It accepts values between 0 and 1, default is 0.25. An amount > 0 of bias makes sure that the blurTexture is not too sharp because of the multiplication with the depthTexture
                reflectorOffset={0} // Offsets the virtual camera that projects the reflection. Useful when the reflective surface is some distance from the object's origin (default = 0)
                metalness={0.99}
            /> */}
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