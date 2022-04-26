import { FunctionComponent } from "react"
import { PotreeAssetObject } from "../3d/asset_adapters/PotreeAssetObject"
import DebugPlane from "../3d/DebugPlane"
import { DepthKitObject } from "../3d/DepthKitObject"
import InfoObject from "../3d/InfoObject"
import { LinkObject } from "../3d/LinkObject"
import { NexusObject } from "../3d/NexusObject"
import { PotreeObject } from "../3d/PotreeObject"
import { TestObject } from "../3d/TestObject"
import { EditorInputType } from "./ArgumentTypes"

export interface VaporComponentProps {
    position?: [number, number, number],
    rotation?: [number, number, number],
    scale?: [number, number, number] | number,
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
    componentType: string,
    inputs: VaporInputsType
}

export const components = [
    TestObject,
    // PotreeObject,
    PotreeAssetObject,
    LinkObject,
    InfoObject,
    DepthKitObject,
    DebugPlane,
    NexusObject,
]

export function getComponentFromTypeName(componentType): VaporComponent {
    const result = components.find(item => item.componentType === componentType)
    if (result === undefined) {
        throw new Error(`Component type ${componentType} not found`)
    }
    return result
}