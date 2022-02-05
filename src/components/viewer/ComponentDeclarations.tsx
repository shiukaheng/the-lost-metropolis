import DebugPlane from "../3d/DebugPlane"
import TestObject from "../3d/TestObject"
import PotreeObject from "../3d/PotreeObject"
import { DepthKitObject } from "../3d/DepthKitObject"
import ButtonObject from "../3d/ButtonObject"
import { StringType, Vector3Type, EulerType, NumberType, ColorType, BooleanType, URLType } from "./ArgumentTypes"
import LabelIconObject from "../3d/LabelIconObject"
import InfoObject from "../3d/InfoObject"
import ErrorObject from "../3d/ErrorObject"

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
        label: "Test object",
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
        label: "Point cloud",
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
        label: "Label",
        value: {
            component: InfoObject,
            inputs: {
                ...genericInputs,
                text: {
                    type: StringType,
                    default: "Info"
                },
                iconSize: {
                    type: NumberType,
                    default: 0.1
                },
                fontSize: {
                    type: NumberType,
                    default: 0.1
                },
                textMaxWidth: {
                    type: NumberType,
                    default: 10
                },
                wrapText: {
                    type: BooleanType,
                    default: false
                }
            }
        }
    },
    // {
    //     label: "ErrorObject",
    //     value: {
    //         component: ErrorObject,
    //         inputs: {
    //             ...genericInputs,
    //             error: {
    //                 type: StringType,
    //                 default: "Error"
    //             }
    //         }
    //     }
    // },
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

function getLabelFromComponent(component) {
    return supportedComponents.find(item => item.value.component === component).label
}

export { supportedComponents, getComponentPropInfo, getComponentPropInfoFromName, getComponentFromName, getLabelFromComponent }
