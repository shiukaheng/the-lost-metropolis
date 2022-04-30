import { Timestamp } from 'firebase/firestore';
import { array, mixed, object, string, boolean, InferType } from 'yup';
import { assetSchema } from "../types/Asset"
import { makeRequiredMultiLangStringSchema } from "../types/MultiLangString"
import { sceneConfigurationSchema } from '../types/SceneConfiguration';
import { sceneChildSchema } from '../types/SceneChild';
import { themeSchema } from '../types/Theme';
import { sponsorSchema } from '../types/Sponsor';


// export type PostDocData = {
//     // Main data
//     title: MultiLangString,
//     description: MultiLangString,
//     configuration: SceneConfiguration,
//     sceneChildren: SceneChild[],
//     assets: Instance<Asset>[],
//     // Metadata
//     createdAt: Timestamp,
//     updatedAt: Timestamp,
//     owner: string,
//     editors: string[],
//     viewers: string[],
//     public: boolean,
// }

/**
 * The schema for the DocumentData that will be retrieved from firebase
 */
export const postDocDataSchema = object({
    title: makeRequiredMultiLangStringSchema(),
    description: makeRequiredMultiLangStringSchema(),
    configuration: sceneConfigurationSchema.required(),
    sceneChildren: array(sceneChildSchema.required()).required(),
    assets: array(
        object({
            id: string().required(),
            data: assetSchema.required()
        }).required()
    ).required(),
    createdAt: mixed<Timestamp>().required(),
    updatedAt: mixed<Timestamp>().required(),
    owner: string().required(),
    editors: array(string()).required(),
    viewers: array(string()).required(),
    public: boolean().required(),
    theme: themeSchema.required(),
    tags: array(string().required()).required(),
    sponsors: array(sponsorSchema.required()).required().default([]),
})

export type PostDocData = InferType<typeof postDocDataSchema>