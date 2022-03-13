import { JSONValue } from './../api/types';
import { JSONObject } from "./utility_types"

export type UserID = string

export type InstanceID = string

export type Permissions = {
    owner: UserID,
    viewers: UserID[],
    editors: UserID[],
    public: boolean
}

export type Asset = {
    data: JSONValue,
    metadata: {
        name: string,
        sourceAssetType: string,
        targetAssetType: string,
        createdAt: string,
        status: {
            uploaded: boolean,
            processedProgress: number,
            processed: boolean,
            ready: boolean,
            pending: boolean
        }
    }
}

export type Instance<T> = {
    id: InstanceID,
    data: T
}

export type CameraProps = {
    fov: number,
    position: [number, number, number],
    rotation: [number, number, number],
}

export interface ComponentBaseProps {
    position?: [number, number, number],
    rotation?: [number, number, number],
    scale?: [number, number, number],
    name?: string,
    objectID: string,
    [key: string]: any
}

export type SceneComponent = {
    componentType: string,
    props: ComponentBaseProps,
}

export type SceneConfiguration = {
    defaultCameraProps: CameraProps,
    potreePointBudget: number,
}

export type Post = {
    configuration: SceneConfiguration,
    sceneChildren: SceneComponent[],
    assets: Instance<Asset>[]
}