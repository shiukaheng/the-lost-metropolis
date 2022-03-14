import { DocumentSnapshot } from '@google-cloud/firestore';
// Note: The types in this file are used to define the types that are used by the implementation of the API, which should not be exposed to API users.
// The differences of types allowed in API implementation types and API types are that
// only API implementation types can contain types from implementation libraries

import { Timestamp } from "firebase/firestore";
import { JSONObject } from "./types";

// Implementation types for Assets and Posts are more flat compared to the API types because nested properties cannot be queried in firestore

// Document wrapper

/**
 * Wrapper for document data types meant for firebase documents, restructures given type as object with ID property and puts original object in data property
 * Used to create intermediate types before sending document
 */
export type WrappedSnap<T> = { id: string, data: T }

export function WrapSnap(snapshot): WrappedSnap<any> {
    const data = snapshot.data()
    if (data === undefined) {
        throw("cannot wrap empty doc")
    }
    return {
        id: snapshot.id,
        data: data
    }
}

// PostDocData - Defining the document structure for post documents in the database

// These represent the types stored in firestore

export type PostDocData = {
    createdAt: Timestamp,
    updatedAt: Timestamp,
    data: JSONObject,
    title: JSONObject,
    description: JSONObject,
    editors: string[],
    owner: string,
    public: boolean,
    viewers: string[],
    assets: string[],
}

// AssetDocData - Defining the document structure for asset documents in the database

type AssetDocDataBase = {
    name: string,
    sourceAssetType: string,
    targetAssetType: string,
    data: any,
    createdAt: Timestamp,
    owner: string,
    viewers: string[],
    editors: string[],
    public: boolean,
    uploaded: boolean,
    processedProgress: number,
    processed: boolean,
    ready: boolean,
}

export type InitAssetDocData = AssetDocDataBase & {pending: false}
export type UninitAssetDocData = AssetDocDataBase & {pending: true}
export type AssetDocData = InitAssetDocData | UninitAssetDocData

export function isInitAssetDocData(data: AssetDocData): data is InitAssetDocData {
    return data.pending === false;
}

// In RawAsset and RawPost, data corresponds to the format of Document.data(), and ID is supplied separately here with the id property
// These are intermediate types that are used to create the final Asset and Post types
export type AssetDoc = WrappedSnap<AssetDocData>
export type PostDoc = WrappedSnap<PostDocData>

export type AssetFileMetadata = {
    sourceAssetType: string,
    targetAssetType: string,
    name?: string,
    assetData: JSONObject
}