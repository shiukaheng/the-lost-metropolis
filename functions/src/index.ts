import { AssetFileMetadata } from '../../api/implementation_types';
import * as admin from "firebase-admin"
import * as functions from "firebase-functions";
import { checkConversion, getAssetClasses, getBuckets, initHandleNewFile, parseMetadataFile, processAsset, unzipFile, updateAssetDocument } from './helpers';

admin.initializeApp()

export const handleNewFile = functions.region("asia-east1").storage.object().onFinalize(async (object) => {
    try {
        // Fetch the document corresponding to the uploaded file
        const { assetFileName, assetDocumentRef, assetDocument } = await initHandleNewFile(object);
        try {
            // Check if uploaded file is actually zip
            if (object.contentType !== 'application/zip') {
                throw new Error(`File ${assetFileName} is not a zip file`)
            }
            // Mount buckets, the default bucket as bucket, and the static bucket (the-lost-metropolis-static) as staticBucket
            const { bucket, staticBucket } = getBuckets();

            // Unzip the file to /<temp>/asset-unzip/
            const assetUnzippedPath = await unzipFile(bucket, object, assetFileName);

            // Parse the metadata.json file
            const metadataFile: AssetFileMetadata = parseMetadataFile(assetUnzippedPath)
            const { sourceAssetClass, targetAssetClass } = getAssetClasses(metadataFile);
            
            // Check if sourceAssetType can be converted to targetAssetType
            let converter = checkConversion(sourceAssetClass, targetAssetClass);

            // Update asset document assetData, sourceAssetType, targetAssetType, name, from the metadata.json file
            const assetData: object = await updateAssetDocument(metadataFile, assetDocumentRef, sourceAssetClass, targetAssetClass);

            // Process the asset using processAsset function, which updates processedProgress regularly
            await processAsset(sourceAssetClass, targetAssetClass, assetDocumentRef, assetUnzippedPath, staticBucket, assetFileName, converter, assetData);
        }
        catch (error) {
            await assetDocument.ref.update({
                pending: false,
                error: error
            })
            throw error
        }
    } catch (error) {
        functions.logger.error(error)
        // throw error
    }
    // Delete the uploaded file from the bucket
    const bucket = admin.storage().bucket()
    object.name && await bucket.file(object.name).delete()
})



