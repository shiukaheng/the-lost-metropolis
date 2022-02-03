import DebugPlane from "../3d/DebugPlane"
import TestObject from "../3d/TestObject"
import PotreeObject from "../3d/PotreeObject"
import { DepthKitObject } from "../3d/DepthKitObject"
import ButtonObject from "../3d/ButtonObject"
import { StringType, Vector3Type, EulerType, NumberType, ColorType, BooleanType, URLType } from "../editor/EditorInputTypes"
import LabelIconObject from "../3d/LabelIconObject"
import InfoObject from "../3d/InfoObject"

const genericInputs = {
    "name": {
        "type": StringType,
        "default": "Object"
    },
    "position": {
        "type": Vector3Type,
        "default": [0, 0, 0]
    },
    "rotation": {
        "type": EulerType,
        "default": [0, 0, 0]
    },
    "scale": {
        "type": Vector3Type,
        "default": [1, 1, 1]
    }
}

const supportedComponents = [
    {
        label: "TestObject",
        value: {
            component: TestObject,
            inputs: {
                ...genericInputs,
                "color": {
                    "type": ColorType,
                    "default": [1, 1, 1]
                }
            }
        }
    },
    {
        label: "PotreeObject",
        value: {
            component: PotreeObject,
            inputs: {
                ...genericInputs,
                cloudName: {
                    type: StringType,
                    default: "cloud.js"
                },
                baseUrl: {
                    type: URLType,
                    default: "http://localhost/"
                },
                pointSize: {
                    type: NumberType,
                    default: 1
                }
            }
        }
    },
    {
        label: "InfoObject",
        value: {
            component: InfoObject,
            inputs: {
                ...genericInputs
            }
        }
    }
    // {
    //     label: "ButtonObject",
    //     value: {
    //         component: ButtonObject,
    //         inputs: {
    //             ...genericInputs,

    //         }
    //     }
    // }
]

function getComponentPropInfo(component) {
    return supportedComponents.find(item => item.value.component === component).value.inputs
}

function getComponentPropInfoFromName(componentName) {
    return supportedComponents.find(item => item.value.component.name === componentName).value.inputs
}

function getComponentFromName(componentName) {
    return supportedComponents.find(item => item.value.component.name === componentName).value.component
}

export { supportedComponents, getComponentPropInfo, getComponentPropInfoFromName, getComponentFromName }
