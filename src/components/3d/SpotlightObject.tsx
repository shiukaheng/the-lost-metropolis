import { SpotLight, useDepthBuffer } from "@react-three/drei";
import { useViewportDepthBuffer } from "../../utilities";
import { ColorType, NumberType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"

// Define react props here with regular typescript types
type SpotlightObjectProps = VaporComponentProps & {
    distance: number;
    angle: number;
    attenuation: number;
    anglePower: number;
    color: string;
    intensity: number;
    penumbra: number;
}

export const SpotlightObject: VaporComponent = (props: SpotlightObjectProps) => {
    return (
        <SpotLight {...props}/>
    );
}

SpotlightObject.displayName = "Spotlight";
SpotlightObject.componentType = "Spotlight"; // Has to be a unique string for each component

// Define the types and default values the component will expose in the editor (the \'types\' here are exported constants from "../viewer/ArgumentTypes") e.g.
// SampleComponent.inputs = {
//     ...genericInputs,
//     "input1": {
//         "type": StringType,
//         "default": ""
//     }
// }

SpotlightObject.inputs = {
    ...genericInputs,
    distance: {
        type: NumberType,
        default: 10
    },
    angle: {
        type: NumberType,
        default: 30
    },
    attenuation: {
        type: NumberType,
        default: 1
    },
    anglePower: {
        type: NumberType,
        default: 1
    },
    color: {
        type: ColorType,
        default: [1, 1, 1]
    },
    intensity: {
        type: NumberType,
        default: 1
    },
    penumbra: {
        type: NumberType,
        default: 0
    }
};