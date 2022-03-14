import { array, InferType, object, SchemaOf, string } from "yup";
import {  assetSchema } from "./Asset";
import { makeRequiredMultiLangStringSchema } from "./MultiLangString";
import { sceneChildSchema } from "./SceneChild";
import { sceneConfigurationSchema } from "./SceneConfiguration";

export const postSchema = object({
    id: string().required().default(""),
    title: makeRequiredMultiLangStringSchema({
        "en": "Untitled post",
        "zh": "無標題"
    }),
    description: makeRequiredMultiLangStringSchema(),
    configuration: sceneConfigurationSchema.required(),
    sceneChildren: array(sceneChildSchema).required(),
    assets: assetSchema.required()
})

export type Post = InferType<typeof postSchema>