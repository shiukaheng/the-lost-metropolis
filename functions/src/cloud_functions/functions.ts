import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { EventContext } from "firebase-functions";
import { QueryDocumentSnapshot } from "firebase-functions/v1/firestore";
// import * as yauzl from "yauzl"

// import { checkConversion, getAssetClasses, getBuckets, initHandleNewFile, parseMetadataFile, processAsset, unzipFile, updateAssetDocument } from "../helpers";
import { assetZipMetadataSchema } from "./types/AssetZipMetadata";
export const db = admin.firestore();
import { checkAssetRequested, unzipAsset, processAsset, uploadAssetToCDN, modifyAsset, cleanupAssetTemp, generatePostFolderPath } from "./utilities";

export const onNewFile = async (object: functions.storage.ObjectMetadata) => {
    if (!assetZipMetadataSchema.isValidSync(object.metadata)) {
        throw new Error("Invalid zip metadata")
    }
    // Check if asset is requested, if not, throw error
    const {postRef, postSnap, asset} = await checkAssetRequested(object) // Implemented!
    // Unzip asset to local temp folder, and parse metadata.json to a variable and updating post doc too
    const {unzippedPath, metadataFile} = await unzipAsset(object, postRef)
    // Take metadata and unzipped path as variable and get receiving directory of what to upload to CDN, and update processProgress
    const processedPath = await processAsset(unzippedPath, metadataFile, postRef, asset.id)
    // Upload to CDN and mark asset as ready
    await uploadAssetToCDN(processedPath, object.metadata)
    // Mark asset as ready
    modifyAsset(postRef, asset.id, asset => {
        asset.metadata.status.ready = true
        return asset
    })
    // Cleanup temp directories
    await cleanupAssetTemp(unzippedPath, processedPath)
}

export const onPostDocumentDelete = async (snapshot: QueryDocumentSnapshot, context: EventContext) {
    const postID = snapshot.id
    const bucket = admin.storage().bucket("the-lost-metropolis-production-static")
    bucket.deleteFiles({
        prefix: generatePostFolderPath(postID)+"/"
    })
}


