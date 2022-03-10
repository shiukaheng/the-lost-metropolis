import { FunctionComponent } from "react"
import DebugPlane from "../3d/DebugPlane"
import { DepthKitObject } from "../3d/DepthKitObject"
import InfoObject from "../3d/InfoObject"
import { LinkObject } from "../3d/LinkObject"
import { PotreeObject } from "../3d/PotreeObject"
import { TestObject } from "../3d/TestObject"
import { EditorInputType } from "./ArgumentTypes"

export interface VaporComponentProps {
    position?: [number, number, number],
    rotation?: [number, number, number],
    scale?: [number, number, number],
    name?: string,
    objectID: string,
    [key: string]: any
}

export type VaporInputType = {
    type: EditorInputType,
    default: any
}

export type VaporInputsType = Record<string, VaporInputType>

export interface VaporComponent extends FunctionComponent<VaporComponentProps> {
    displayName: string,
    componentID: string,
    inputs: VaporInputsType
}

export const components = [
    TestObject,
    PotreeObject,
    LinkObject,
    InfoObject,
    DepthKitObject,
    DebugPlane
]

export function getComponentFromID(componentID) {
    // return componentSpecifications.find(item => item.value.component.name === componentName).value.inputs // 
    return components.find(item => item.componentID === componentID)
}