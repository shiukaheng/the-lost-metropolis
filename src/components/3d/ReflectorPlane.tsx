import { MeshReflectorMaterial } from "@react-three/drei";
import { useTexture } from "../utilities/modifiedDrei/useTexture";
import { BooleanType, ColorType, NumberType, StringType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"

// Define react props here with regular typescript types
type ReflectorPlaneObjectProps = VaporComponentProps & {
    color: [number, number, number],
    metalness: number,
    roughness: number,
    blurX: number;
    blurY: number;
    mixBlur: number;
    mixStrength: number;
    mixContrast: number;
    resolution: number;
    mirror: number;
    depthScale: number;
    minDepthThreshold: number;
    maxDepthThreshold: number;
    depthToBlurRatioBias: number;
    enableDistortion: boolean;
    distortionStrength: number;
    distortionMapUrl: string;
    // wrapTexture: boolean;
    // textureScale: number;
}

function DistortedReflectorPlaneObject({color, metalness, roughness, blurX, blurY, mixBlur, mixStrength, mixContrast, resolution, mirror, depthScale, minDepthThreshold, maxDepthThreshold, depthToBlurRatioBias, distortionStrength, distortionMapUrl="", /*wrapTexture, textureScale*/}) {
    const texture = useTexture(distortionMapUrl as string);
    return (
        <mesh ref={(mesh) => {}}>
            <planeBufferGeometry attach="geometry" args={[1, 1]}/>
            <MeshReflectorMaterial
            color={color}
            metalness={metalness}
            roughness={roughness}
            blur={[blurX, blurY]}
            mixBlur={mixBlur}
            mixStrength={mixStrength}
            mixContrast={mixContrast}
            resolution={resolution}
            mirror={mirror}
            depthScale={depthScale}
            minDepthThreshold={minDepthThreshold}
            maxDepthThreshold={maxDepthThreshold}
            depthToBlurRatioBias={depthToBlurRatioBias}
            distortion={distortionStrength}
            distortionMap={texture}
            >
            </MeshReflectorMaterial>
        </mesh>
    )
}

// Buggy AF, but works for now.


export const ReflectorPlaneObject: VaporComponent = ({
    color=[0.5, 0.5, 0.5],
    metalness=0.5,
    roughness=1,
    blurX=0,
    blurY=0,
    mixBlur=0,
    mixStrength=1,
    mixContrast=1,
    resolution=256,
    mirror=0,
    depthScale=0,
    minDepthThreshold=0.9,
    maxDepthThreshold=1.0,
    depthToBlurRatioBias=0.25,
    enableDistortion=false,
    distortionStrength=0.5,
    distortionMapUrl="",
    // wrapTexture=false,
    // textureScale=1,
    ...props
}: ReflectorPlaneObjectProps) => {
    return (
        <group {...props}>
            {/* (enableDistortion) ?
            <DistortedReflectorPlaneObject
                color={color}
                metalness={metalness}
                roughness={roughness}
                blurX={blurX}
                blurY={blurY}
                mixBlur={mixBlur}
                mixStrength={mixStrength}
                mixContrast={mixContrast}
                resolution={resolution}
                mirror={mirror} 
                depthScale={depthScale}
                minDepthThreshold={minDepthThreshold}
                maxDepthThreshold={maxDepthThreshold}
                depthToBlurRatioBias={depthToBlurRatioBias}
                distortionStrength={distortionStrength}
                distortionMapUrl={distortionMapUrl}
            /> : */}
            <mesh>
                <planeBufferGeometry attach="geometry" args={[1, 1]}/>
                <MeshReflectorMaterial
                color={color}
                metalness={metalness}
                roughness={roughness}
                blur={[blurX, blurY]}
                mixBlur={mixBlur}
                mixStrength={mixStrength}
                mixContrast={mixContrast}
                resolution={resolution}
                mirror={mirror}
                depthScale={depthScale}
                minDepthThreshold={minDepthThreshold}
                maxDepthThreshold={maxDepthThreshold}
                depthToBlurRatioBias={depthToBlurRatioBias}
                />
            </mesh>
        </group>
    );
}

ReflectorPlaneObject.displayName = "Reflector Plane";
ReflectorPlaneObject.componentType = "ReflectorPlane"; // Has to be a unique string for each component

// Define the types and default values the component will expose in the editor (the \'types\' here are exported constants from "../viewer/ArgumentTypes") e.g.
// SampleComponent.inputs = {
//     ...genericInputs,
//     "input1": {
//         "type": "StringType",
//         "default": ""
//     }
// }
ReflectorPlaneObject.inputs = {
    ...genericInputs,
    color: {
        type: ColorType,
        default: [0.5, 0.5, 0.5]
    },
    metalness: {
        type: NumberType,
        default: 0.5
    },
    roughness: {
        type: NumberType,
        default: 1
    },
    blurX: {
        type: NumberType,
        default: 0
    },
    blurY: {
        type: NumberType,
        default: 0
    },
    mixBlur: {
        type: NumberType,
        default: 0
    },
    mixStrength: {
        type: NumberType,
        default: 1
    },
    mixContrast: {
        type: NumberType,
        default: 1
    },
    resolution: {
        type: NumberType,
        default: 256
    },
    mirror: {
        type: NumberType,
        default: 0
    },
    depthScale: {
        type: NumberType,
        default: 0
    },
    minDepthThreshold: {
        type: NumberType,
        default: 0.9
    },
    maxDepthThreshold: {
        type: NumberType,
        default: 1.0
    },
    depthToBlurRatioBias: {
        type: NumberType,
        default: 0.25
    },
    enableDistortion: {
        type: BooleanType,
        default: false
    },
    distortionStrength: {
        type: NumberType,
        default: 0.5
    },
    distortionMapUrl: {
        type: StringType,
        default: ""
    }
    // wrapTexture: {
    //     type: BooleanType,
    //     default: false
    // },
    // textureScale: {
    //     type: NumberType,
    //     default: 1
    // }
};