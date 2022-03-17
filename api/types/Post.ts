import { array, InferType, object, SchemaOf, string } from "yup";
import {  assetSchema } from "./Asset";
import { makeRequiredMultiLangStringSchema } from "./MultiLangString";
import { permissionsSchema } from "./Permissions";
import { sceneChildSchema } from "./SceneChild";
import { sceneConfigurationSchema } from "./SceneConfiguration";

// TODO: Just unify Post shape with PostDocData shape, but allow different types. Easier to think about.

export const postSchema = object({
    data: object({
        title: makeRequiredMultiLangStringSchema({
            "en": "Untitled post",
            "zh": "無標題"
        }),
        description: makeRequiredMultiLangStringSchema(),
        configuration: sceneConfigurationSchema.required(),
        sceneChildren: array(sceneChildSchema).required().default([]),
        assets: array(object({
            id: string().required(),
            data: assetSchema.required()
        }).required()).required().default([])
    }),
    metadata: object({
        createdAt: string().required().default(()=>new Date().toISOString()),
        updatedAt: string().required().default(()=>new Date().toISOString()),
        permissions: permissionsSchema.required()
    })
})

export type Post = InferType<typeof postSchema>

console.log(postSchema.getDefault())