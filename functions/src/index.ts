import { Potree2_0PointCloud } from './asset_types/Potree2_0PointCloud';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin"
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { Bucket } from "@google-cloud/storage"
admin.initializeApp()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Listen for new files uploaded to the default storage bucket.

// On file creation, try to get corresponding asset document from firestore using getAssetDocument function, if it returns null, throw an error
// If it returns a document, set it to a variable and use a try catch block to do the following:
// try {
    // Update document pending property to false
    // Download the file from the bucket and unzip it
    // Throw an error if the zip does not contain a metadata.json at the root
    // Try parse the metadata.json file
    // Run getProcessor function, which also validates the metadata
    // Update assetData, sourceAssetType, targetAssetType, name, from the metadata.json
    // Process the asset using processAsset function, which updates processedProgress regularly
    // Update processedProgress to 1 and processed to true
    // Upload the processed asset to the target bucket
    // Update document ready property to true
// catch (error) {
    // Set the asset document's ready property to false, and set the error property to the error message. Also throw an error.
// }

// const getAssetDocument = async (assetFileName):Promise<RawAssetDocument> => {
//     // If exists, then return document data, else throw error
//     const assetDocument = await admin.firestore().collection("assets").doc(assetFileName).get()
//     if (assetDocument.exists) {
//         return (assetDocument.data() as RawAssetDocument)
//     } else {
//         throw new Error (`Asset document ${assetFileName} does not exist`)
//     }
// }

export const assetTypes = [Potree2_0PointCloud]

const uploadFolderToBucket = async (localPath:string, bucket:Bucket, bucketUploadPath:string, progressCallback?:(progress: number)=>any) => {
    // Maps all the files recursively in the localPath directory, and uploads them to the bucket in the same folder structure:
    // Get all the files in the localPath directory
    const files = fs.readdirSync(localPath)
    // Get an array of file sizes
    const fileSizes = files.map(file => fs.statSync(path.join(localPath, file)).size)
    // For each file, create a new filename that includes the path used in the bucket, and upload the file to the bucket
    for (const file of files) {
        const localFilePath = path.join(localPath, file)
        const bucketFilePath = path.join(bucketUploadPath, file)
        functions.logger.log(`Uploading ${localFilePath} to ${bucketFilePath}`)
        await bucket.upload(localFilePath, { destination: bucketFilePath })
    }
    // No progress tracking for now
}

export const handleNewFile = functions.storage.object().onFinalize(async (object) => {
    try {
        // Fetch the document corresponding to the uploaded file
        if (!(typeof object.name === "string")) {
            throw new Error("Invalid file name")
        }
        const assetFileName = path.basename(object.name).split(".")[0]
        if (assetFileName.length === 0) {
            throw new Error("Invalid file name after stripping extension and path") 
        }
        const assetDocumentRef = admin.firestore().collection("assets").doc(assetFileName)
        // Throw error if document does not exist
        const assetDocument = await assetDocumentRef.get()
        if (!assetDocument.exists) {
            throw new Error(`Asset document ${assetFileName} does not exist`)
        }
        try {
            // Check if uploaded file is actually zip
            if (object.contentType !== 'application/zip') {
                throw new Error(`File ${assetFileName} is not a zip file`)
            }
            // Mount buckets, the default bucket as bucket, and the static bucket (the-lost-metropolis-static) as staticBucket
            const bucket = admin.storage().bucket()
            const staticBucket = admin.storage().bucket('the-lost-metropolis-static')
            // Unzip the file to /<temp>/asset-unzip/
            const assetUnzippedPath = path.join(os.tmpdir(), "asset-unzip")
            await bucket.file(object.name).download({destination: assetUnzippedPath})
            // Throw error if the zip does not contain a metadata.json at the root in the temp folder
            if (!(fs.existsSync(path.join(assetUnzippedPath, "metadata.json")) && fs.lstatSync(path.join(assetUnzippedPath, "metadata.json")).isFile())) {
                throw new Error(`File ${assetFileName} does not contain a metadata.json file`)
            }
            // Throw error if the zip does not contain a data folder
            if (!(fs.existsSync(path.join(assetUnzippedPath, "data")) && fs.lstatSync(path.join(assetUnzippedPath, "data")).isDirectory())) {
                throw new Error(`File ${assetFileName} does not contain a data folder`)
            }
            // Parse the metadata.json file
            const metadata = JSON.parse(fs.readFileSync(path.join(assetUnzippedPath, "metadata.json"), "utf8"))
            const sourceAssetType = assetTypes.find(assetType => assetType.assetTypeName === metadata.assetType)
            const targetAssetType = assetTypes.find(assetType => assetType.assetTypeName === metadata.targetAssetType)
            // Throw error if the metadata.json file does not contain a valid sourceAssetType
            if (!sourceAssetType) {
                throw new Error(`File ${assetFileName} does not contain a valid sourceAssetType`)
            }
            // Throw error if the metadata.json file does not contain a valid targetAssetType
            if (!targetAssetType) {
                throw new Error(`File ${assetFileName} does not contain a valid targetAssetType`)
            }
            // Check if sourceAssetType can be converted to targetAssetType
            let converter = sourceAssetType.getConverter(targetAssetType)
            if (!(sourceAssetType === targetAssetType) &&  converter === undefined) {
                throw new Error(`File ${assetFileName} cannot be converted to ${targetAssetType.assetTypeName}`)
            }
            // Update asset document assetData, sourceAssetType, targetAssetType, name, from the metadata.json file
            const assetData: object = metadata.assetData
            const name = metadata.name
            await assetDocumentRef.update({
                assetData,
                sourceAssetType: sourceAssetType.assetTypeName,
                targetAssetType: targetAssetType.assetTypeName,
                name
            })
            // Process the asset using processAsset function, which updates processedProgress regularly
            if (sourceAssetType === targetAssetType) {
                // Update processedProgress to 1 and processed to true
                await assetDocumentRef.update({
                    processedProgress: 1,
                    processed: true
                })
                // If sourceAssetType === targetAssetType, then just copy the data folder's contents into a folder in the static bucket with the name set to the asset's id
                await uploadFolderToBucket(path.join(assetUnzippedPath, "data"), staticBucket, `${assetFileName}`)
            } else {
                // If conversion is needed, convert the asset to the targetAssetType and upload the converted data to the static bucket
                if (converter === undefined) {
                    throw new Error(`File ${assetFileName} cannot be converted to ${targetAssetType.assetTypeName}`)
                }
                const assetConvertedDataPath = path.join(os.tmpdir(), "asset-converted-data")
                await converter(assetData, path.join(assetUnzippedPath, "data"), assetConvertedDataPath, (progress) => {
                    assetDocumentRef.update({
                        processedProgress: progress
                    })
                })
                // Update processedProgress to 1 and processed to true
                await assetDocumentRef.update({
                    processedProgress: 1,
                    processed: true
                })
                // Then upload the converted data to the static bucket
                await uploadFolderToBucket(assetConvertedDataPath, staticBucket, `${assetFileName}`)
            }
            // Now that the asset has been processed, delete the temp folder entirely
            fs.rmdirSync(assetUnzippedPath, {recursive: true})
            // And set the asset's document ready as true
            await assetDocumentRef.update({ready: true})
        }
        catch (error) {
            await assetDocument.ref.update({
                pending: false,
                error: error.message
            })
            throw error
        }
    } catch (error) {
        functions.logger.error(error)
        throw error
    }
})


