import { array, boolean, number, object, ObjectSchema, string, InferType } from 'yup';
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

export const assetSchema = object({
    data: object().required(),
    metadata: object({
        name: string().required(),
        sourceAssetType: string().required(),
        targetAssetType: string().required(),
        createdAt: string().required(),
        status: object({
            uploaded: boolean().required(),
            processedProgress: number().required(),
            processed: boolean().required(),
            ready: boolean().required(),
            pending: boolean().required()
        })

    }).required()
})

export type Instance<T> = {
    id: InstanceID,
    data: T
}

export function instance<T>(target: T, id: string): Instance<T> {
    return {
        id,
        data: target
    }
}

export function uninstance<T>(target: Instance<T>): [data: T, id: string] {
    return [target.data, target.id]
}

export type CameraProps = {
    fov: number,
    position: [number, number, number],
    rotation: [number, number, number],
}

export const cameraPropsSchema = object({
    fov: number().required().default(90),
    position: array(number()).length(3).required().default([0,0,0]),
    rotation: array(number()).length(3).required().default([0,0,0])
})

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

// export type SceneConfiguration = {
//     defaultCameraProps: CameraProps,
//     potreePointBudget: number,
// }

export type SceneConfiguration = InferType<typeof sceneConfigurationSchema>

export const sceneConfigurationSchema = object({
    defaultCameraProps: cameraPropsSchema.required(),
    potreePointBudget: number().integer().default(1000000).required()
})

export type Post = {
    configuration: SceneConfiguration,
    sceneChildren: SceneComponent[],
    assets: Instance<Asset>[]
}

export const postSchema: ObjectSchema<Post> = object({
    configuration: sceneConfigurationSchema.required(),
    sceneChildren: array().required().default([]),
    assets: array(assetSchema).required().default([])
})

export function isValidPost(data: any): data is Post {
    return postSchema.isValidSync(data, {strict: true, recursive: true, abortEarly: true})
}

export type Language = "en" | "zh"

export type MultiLangString = {
    [key in Language]: string
}