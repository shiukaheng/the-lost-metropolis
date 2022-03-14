import { SceneChild } from './../../../api2/types/SceneChild';
import { SceneConfiguration } from './../../../api_old/types';
import { assetSchema } from './../../../api2/types/Asset';
import { makeRequiredMultiLangStringSchema } from './../../../api2/types/MultiLangString';
import { Timestamp } from 'firebase/firestore';
import { array, object, string } from 'yup';
import { Instance } from "../../types"
import { Asset } from "../../types/Asset"
import { MultiLangString, multiLangStringSchema } from "../../types/MultiLangString"
import { JSONValue } from '../../utility_types';
import { sceneConfigurationSchema } from '../../types/SceneConfiguration';
import { sceneChildSchema } from '../../types/SceneChild';

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

function instanceSchema(x) { 
    return object({
        id: string(),
        data: x
    })
}

export const postDocDataSchema = object({
    title: makeRequiredMultiLangStringSchema(),
    description: makeRequiredMultiLangStringSchema(),
    configuration: sceneConfigurationSchema.required(),
    sceneChildren: array(sceneChildSchema.required()).required(),
    assets
})