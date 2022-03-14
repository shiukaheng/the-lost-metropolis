// import { multiLangStringSchema } from './web_client/types';
// import { array, boolean, number, object, ObjectSchema, string, InferType, SchemaOf } from 'yup';
// import { JSONValue } from '../api_old/types';
// import { JSONObject } from "./utility_types"

import { object, string } from "yup"


export function instance<T>(target: T, id: string): Instance<T> {
    return {
        id,
        data: target
    }
}

export function uninstance<T>(target: Instance<T>): [data: T, id: string] {
    return [target.data, target.id]
}

function instanceSchema(x) { 
    return object({
        id: string(),
        data: x
    })
}

// export type CameraProps = {
//     fov: number,
//     position: [number, number, number],
//     rotation: [number, number, number],
// }

// export const cameraPropsSchema: SchemaOf<CameraProps> = object({
//     fov: number().required().default(90),
//     position: array(number()).length(3).default([0,0,0]).required(),
//     rotation: array(number()).length(3).default([0,0,0]).required()
// })

// export interface ComponentBaseProps {
//     position?: [number, number, number],
//     rotation?: [number, number, number],
//     scale?: [number, number, number],
//     name?: string,
//     objectID: string,
//     [key: string]: any
// }

// export type SceneComponent = {
//     componentType: string,
//     props: ComponentBaseProps,
// }

// // export type SceneConfiguration = {
// //     defaultCameraProps: CameraProps,
// //     potreePointBudget: number,
// // }

// export type SceneConfiguration = InferType<typeof sceneConfigurationSchema>

// export const sceneConfigurationSchema = object({
//     defaultCameraProps: cameraPropsSchema.required(),
//     potreePointBudget: number().integer().default(1000000).required()
// })

// export type ISODateString = string

// export type Post = {
//     data: {
//         title: MultiLangString,
//         description: MultiLangString,
//         configuration: SceneConfiguration,
//         sceneChildren: SceneComponent[],
//         assets: Instance<Asset>[]
//     },
//     metadata: {
//         createdAt: ISODateString,
//         updatedAt: ISODateString,
//         permissions: Permissions
//     }
// }

// export const sceneChildrenSchema = array().default([])
// export const assetsSchema = array(assetSchema).default([])

// export const postSchema = object({
//     id: string().required().default(""),
//     title: multiLangStringSchema.required().default({
//         "en": "Untitled post",
//         "zh": "無標題"
//     }),
//     description: multiLangStringSchema.required(),
//     configuration: sceneConfigurationSchema.required(),
//     sceneChildren: sceneChildrenSchema.required(),
//     assets: assetsSchema.required()
// })

// export function isValidPost(data: any): data is Post {
//     return postSchema.isValidSync(data, {strict: true, recursive: true, abortEarly: true})
// }

// export type Language = "en" | "zh"

// export type MultiLangString = {
//     [key in Language]: string
// }