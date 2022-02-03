import DebugPlane from "../3d/DebugPlane"
import TestObject from "../3d/TestObject"
import PotreeObject from "../3d/PotreeObject"
import { DepthKitObject } from "../3d/DepthKitObject"
import { StringType, Vector3Type, EulerType, NumberType, ColorType, BooleanType, URLType } from "../editor/EditorInputTypes"

const supportedComponents = [
    {
        label: "TestObject",
        value: {
            component: TestObject,
            inputs: {
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
        }
    },
    {
        label: "DebugPlane",
        value: {
            component: DebugPlane,
            inputs: {
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
        }
    },
    {
        label: "DepthKitObject",
        value: {
            component: DepthKitObject,
            inputs: {
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
                },
                metaUrl: {
                    type: URLType,
                    default: "http://localhost/"
                },
                videoUrl: {
                    type: URLType,
                    default: "http://localhost/"
                },
                posterUrl: {
                    type: URLType,
                    default: "http://localhost/"
                },
                autoplay: {
                    type: BooleanType,
                    default: false
                },
                muted: {
                    type: BooleanType,
                    default: false
                },
                loop: {
                    type: BooleanType,
                    default: false
                }
            }
        }
    },
    {
        label: "PotreeObject",
        value: {
            component: PotreeObject,
            inputs: {
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
                },
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
