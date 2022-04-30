import { array, boolean, InferType, object, string } from "yup";
import {  assetSchema } from "./Asset";
import { makeRequiredMultiLangStringSchema } from "./MultiLangString";
// import { permissionsSchema } from "./Permissions";
import { sceneChildSchema } from "./SceneChild";
import { sceneConfigurationSchema } from "./SceneConfiguration";
import { sponsorSchema } from "./Sponsor";
import { themeSchema } from "./Theme";
import { userIDSchema } from "./UserID"

// TODO: Just unify Post shape with PostDocData shape, but allow different types. Easier to think about.

/**
 * The schema for the DocumentData that will be retrieved from firebase
 */
 export const postSchema = object({ // Flatten the schema
    title: makeRequiredMultiLangStringSchema({
        "en": "Untitled post",
        "zh": "無標題"
    }),
    description: makeRequiredMultiLangStringSchema(),
    configuration: sceneConfigurationSchema.required(),
    sceneChildren: array(sceneChildSchema.required()).required().default([]),
    assets: array(
        object({
            id: string().required(),
            data: assetSchema.required()
        }).required()
    ).required().default([]),
    // Metadata
    createdAt: string().required().default(()=>new Date().toISOString()),
    updatedAt: string().required().default(()=>new Date().toISOString()),
    // Permissions
    owner: userIDSchema.defined().default(""),
    editors: array(userIDSchema).required().default([]),
    viewers: array(userIDSchema).required().default([]),
    public: boolean().required().default(false),
    theme: themeSchema.required(),
    tags: array(string().required()).required().default([]),
    sponsors: array(sponsorSchema.required()).required().default([]),
})

export type Post = InferType<typeof postSchema>