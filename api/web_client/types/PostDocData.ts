import { Timestamp } from 'firebase/firestore';
import { array, mixed, object, string, boolean, SchemaOf } from 'yup';
import { Asset, assetSchema } from "../../types/Asset"
import { makeRequiredMultiLangStringSchema, MultiLangString, multiLangStringSchema } from "../../types/MultiLangString"
import { Instance } from '../../utility_types';
import { SceneConfiguration, sceneConfigurationSchema } from '../../types/SceneConfiguration';
import { SceneChild, sceneChildSchema } from '../../types/SceneChild';

/**
 * the schema for the DocumentData that will be retrieved from firebase
 */
export type PostDocData = {
    // Main data
    title: MultiLangString,
    description: MultiLangString,
    configuration: SceneConfiguration,
    sceneChildren: SceneChild[],
    assets: Instance<Asset>[],
    // Metadata
    createdAt: Timestamp,
    updatedAt: Timestamp,
    owner: string,
    editors: string[],
    viewers: string[],
    public: boolean,
}

export const postDocDataSchema = object({
    title: makeRequiredMultiLangStringSchema(),
    description: makeRequiredMultiLangStringSchema(),
    configuration: sceneConfigurationSchema.required(),
    sceneChildren: array(sceneChildSchema.required()).required(),
    assets: array(object({
        id: string().required(),
        data: assetSchema.required()
    }).required()).required(),
    createdAt: mixed<Timestamp>().required(),
    updatedAt: mixed<Timestamp>().required(),
    owner: string().required(),
    editors: array(string()).required(),
    viewers: array(string()).required(),
    public: boolean().required()
})