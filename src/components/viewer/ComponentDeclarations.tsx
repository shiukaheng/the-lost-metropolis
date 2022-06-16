import { FunctionComponent } from "react"
import { AmbientLightObject } from "../3d/AmbientLightObject"
import { NexusAssetObject } from "../3d/asset_adapters/NexusAssetObject"
import { PotreeAssetObject } from "../3d/asset_adapters/PotreeAssetObject"
import { AudioObject } from "../3d/AudioObject"
import DebugPlane from "../3d/DebugPlane"
import { DepthKitObject } from "../3d/DepthKitObject"
import InfoObject from "../3d/InfoObject"
import { LinkObject } from "../3d/LinkObject"
import { NexusObject } from "../3d/NexusObject"
import { PotreeObject } from "../3d/PotreeObject"
import { ReflectorPlaneObject } from "../3d/ReflectorPlane"
import { TeleporterPlane } from "../3d/TeleporterPlane"
import { TestObject } from "../3d/TestObject"
import { TilesObject } from "../3d/TilesObject"
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

/**
 * VaporComponent interface is used to define the required properties for a component used in Vapor, as it requires extra information for the editor to know what props
 * are needed for the component.
 * 
 * @interface VaporComponent
 * @member {string} displayName - The display name of the component.
 * @member {string} componentType - A unique string that identifies the component type.
 * @member {VaporInputsType} inputs - A dictionary of inputs that the component requires.
 */
export interface VaporComponent extends FunctionComponent<VaporComponentProps> {
    displayName: string,
    componentType: string,
    inputs: VaporInputsType
}

export const components = [
    TestObject,
    PotreeAssetObject,
    LinkObject,
    InfoObject,
    DepthKitObject,
    DebugPlane,
    NexusObject,
    NexusAssetObject,
    AmbientLightObject,
    PotreeObject,
    TilesObject,
    TeleporterPlane,
    AudioObject,
    ReflectorPlaneObject,
]

export function getComponentFromTypeName(componentType): VaporComponent {
    const result = components.find(item => item.componentType === componentType)
    if (result === undefined) {
        throw new Error(`Component type ${componentType} not found`)
    }
    return result
}