import { array, InferType, object, SchemaOf, string } from "yup";
import {  assetSchema } from "./Asset";
import { makeRequiredMultiLangStringSchema } from "./MultiLangString";
import { permissionsSchema } from "./Permissions";
import { sceneChildSchema } from "./SceneChild";
import { sceneConfigurationSchema } from "./SceneConfiguration";

export const postSchema = object({
    data: object({
        title: makeRequiredMultiLangStringSchema({
            "en": "Untitled post",
            "zh": "無標題"
        }),
        description: makeRequiredMultiLangStringSchema(),
        configuration: sceneConfigurationSchema.required(),
        sceneChildren: array(sceneChildSchema).required(),
        assets: array(object({
            id: string().required(),
            data: assetSchema.required()
        }).required()).required()
    }),
    metadata: object({
        createdAt: string().required(),
        updatedAt: string().required(),
        permissions: permissionsSchema.required()
    })
})

export type Post = InferType<typeof postSchema>