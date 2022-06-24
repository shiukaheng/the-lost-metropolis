import { extend } from "@react-three/fiber";
import { Suspense } from "react";
import { useCubeTextureSafe } from "../utilities/modifiedDrei/useCubeTextureSafe";
import { StringType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"
import { SkyboxMaterial } from "./materials/SkyboxMaterial";

extend({SkyboxMaterial})

// Define react props here with regular typescript types
type SkyBoxObjectProps = VaporComponentProps & {
    pxUrl: string,
    nxUrl: string,
    pyUrl: string,
    nyUrl: string,
    pzUrl: string,
    nzUrl: string,
}

export const SkyBoxObject: VaporComponent = (props: SkyBoxObjectProps) => {
    return (
        <Suspense fallback={null}>
            <_SkyBoxObject {...props} />
        </Suspense>
    );
}

function _SkyBoxObject({pxUrl="", nxUrl="", pyUrl="", nyUrl="", pzUrl="", nzUrl="", ...props}: SkyBoxObjectProps) {
    const cubeTexture = useCubeTextureSafe([pxUrl, nxUrl, pyUrl, nyUrl, pzUrl, nzUrl]);
    return (
        <mesh {...props}>
            <boxBufferGeometry attach="geometry" args={[1, 1, 1, 20, 20, 20]} />
            {/* More segments to reduce normal error distortion */}
            <skyboxMaterial attach="material" map={cubeTexture} />
        </mesh>
    );
}

SkyBoxObject.displayName = "SkyBox";
SkyBoxObject.componentType = "SkyBox"; // Has to be a unique string for each component

// Define the types and default values the component will expose in the editor (the \'types\' here are exported constants from "../viewer/ArgumentTypes") e.g.
// SampleComponent.inputs = {
//     ...genericInputs,
//     "input1": {
//         "type": StringType,
//         "default": ""
//     }
// }
SkyBoxObject.inputs = {
    ...genericInputs,
    pxUrl: {
        type: StringType,
        default: ""
    },
    nxUrl: {
        type: StringType,
        default: ""
    },
    pyUrl: {
        type: StringType,
        default: ""
    },
    nyUrl: {
        type: StringType,
        default: ""
    },
    pzUrl: {
        type: StringType,
        default: ""
    },
    nzUrl: {
        type: StringType,
        default: ""
    }
};