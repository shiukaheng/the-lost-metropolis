import { assetSchema } from './../types';
import { Timestamp } from 'firebase/firestore';
import { Asset, Instance, MultiLangString, UserID } from '../types';
import { JSONObject, JSONValue } from '../utility_types';
import { object, string, number, date, InferType, array, mixed, boolean } from 'yup';

/**
 * the schema for the DocumentData that will be retrieved from firebase
 */
export type PostDocData = {
    // Main data
    title: MultiLangString,
    description: MultiLangString,
    data: JSONValue,
    assets: Instance<Asset>[],
    // Metadata
    createdAt: Timestamp,
    updatedAt: Timestamp,
    owner: UserID,
    editors: UserID[],
    viewers: UserID[],
    public: boolean,
}

export const multiLangStringSchema = object().shape({
    en: string().default('').required(),
    zh: string().default('').required(),
});

export const assetInstanceSchema = object({
    id: string().required(),
    data: assetSchema.required()
})

export const postDocDataSchema = object({
    title: multiLangStringSchema.required(),
    description: multiLangStringSchema.required(),
    data: object().required(),
    assets: array(assetInstanceSchema).required(),
    createdAt: object().required(),
    updatedAt: object().required(),
    owner: string().required(),
    editors: array(string()).required(),
    viewers: array(string()).required(),
    public: boolean().required()
})

export function isValidPostDocData(data: any): data is PostDocData {
    return postDocDataSchema.isValidSync(data, {strict: true, abortEarly: true, recursive: true})
}
