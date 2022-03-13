import { AssetFileMetadata } from '../../api/implementation_types';
import { Potree2_0PointCloud } from './asset_types/Potree2_0PointCloud';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin"
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { Bucket } from "@google-cloud/storage"

export const assetTypes = [Potree2_0PointCloud]

export const uploadFolderToBucket = async (localPath:string, bucket:Bucket, bucketUploadPath:string, progressCallback?:(progress: number)=>any) => {
    // Maps all the files recursively in the localPath directory, and uploads them to the bucket in the same folder structure:
    // Get all the files in the localPath directory
    const files = fs.readdirSync(localPath)
    // Get an array of file sizes
    // const fileSizes = files.map(file => fs.statSync(path.join(localPath, file)).size)
    // For each file, create a new filename that includes the path used in the bucket, and upload the file to the bucket
    for (const file of files) {
        const localFilePath = path.join(localPath, file)
        const bucketFilePath = path.join(bucketUploadPath, file)
        functions.logger.log(`Uploading ${localFilePath} to ${bucketFilePath}`)
        await bucket.upload(localFilePath, { destination: bucketFilePath })
    }
    // No progress tracking for now
}


export async function initHandleNewFile(object: functions.storage.ObjectMetadata) {
    if (!(typeof object.name === "string")) {
        throw new Error("Invalid file name");
    }
    const assetFileName = path.basename(object.name).split(".")[0];
    if (assetFileName.length === 0) {
        throw new Error("Invalid file name after stripping extension and path");
    }
    const assetDocumentRef = admin.firestore().collection("assets").doc(assetFileName);
    // Throw error if document does not exist
    const assetDocument = await assetDocumentRef.get();
    if (!assetDocument.exists) {
        throw new Error(`Asset document ${assetFileName} does not exist`);
    }
    return { assetFileName, assetDocumentRef, assetDocument };
}

export async function processAsset(sourceAssetClass: typeof Potree2_0PointCloud, targetAssetClass: typeof Potree2_0PointCloud, assetDocumentRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, assetUnzippedPath: string, staticBucket: Bucket, assetFileName: string, converter: import("c:/Users/shiuk/Documents/GitHub/the-lost-metropolis-draft/functions/src/asset_types/AssetType").AssetConverterFunction | undefined, assetData: object) {
    if (sourceAssetClass === targetAssetClass) {
        // Update processedProgress to 1 and processed to true
        await assetDocumentRef.update({
            processedProgress: 1,
            processed: true
        });
        // If sourceAssetType === targetAssetType, then just copy the data folder's contents into a folder in the static bucket with the name set to the asset's id
        await uploadFolderToBucket(path.join(assetUnzippedPath, "data"), staticBucket, `${assetFileName}`);
    } else {
        // If conversion is needed, convert the asset to the targetAssetType and upload the converted data to the static bucket
        if (converter === undefined) {
            throw new Error(`File ${assetFileName} cannot be converted to ${targetAssetClass.assetTypeName}`);
        }
        const assetConvertedDataPath = path.join(os.tmpdir(), "asset-converted-data");
        await converter(assetData, path.join(assetUnzippedPath, "data"), assetConvertedDataPath, (progress) => {
            assetDocumentRef.update({
                processedProgress: progress
            });
        });
        // Update processedProgress to 1 and processed to true
        await assetDocumentRef.update({
            processedProgress: 1,
            processed: true
        });
        // Then upload the converted data to the static bucket
        await uploadFolderToBucket(assetConvertedDataPath, staticBucket, `${assetFileName}`);
    }
    // Now that the asset has been processed, delete the temp folder entirely
    fs.rmdirSync(assetUnzippedPath, { recursive: true });
    // And set the asset's document ready as true
    await assetDocumentRef.update({ ready: true });
}

export async function updateAssetDocument(metadataFile: AssetFileMetadata, assetDocumentRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, sourceAssetClass: typeof Potree2_0PointCloud, targetAssetClass: typeof Potree2_0PointCloud) {
    const assetData: object = metadataFile.assetData;
    const name = metadataFile.name;
    await assetDocumentRef.update({
        assetData,
        sourceAssetType: sourceAssetClass.assetTypeName,
        targetAssetType: targetAssetClass.assetTypeName,
        name
    });
    return assetData;
}

export function checkConversion(sourceAssetClass: typeof Potree2_0PointCloud, targetAssetClass: typeof Potree2_0PointCloud) {
    let converter = sourceAssetClass.getConverter(targetAssetClass);
    if (!(sourceAssetClass === targetAssetClass) && converter === undefined) {
        throw new Error(`File cannot be converted to ${targetAssetClass.assetTypeName}`);
    }
    return converter;
}

export function getBuckets() {
    const bucket = admin.storage().bucket();
    const staticBucket = admin.storage().bucket('the-lost-metropolis-production-static');
    return { bucket, staticBucket };
}

export function getAssetClasses(metadataFile: AssetFileMetadata) {
    const sourceAssetClass = assetTypes.find(assetType => assetType.assetTypeName === metadataFile.sourceAssetType);
    const targetAssetClass = assetTypes.find(assetType => assetType.assetTypeName === metadataFile.targetAssetType);
    // Throw error if the metadata.json file does not contain a valid sourceAssetType
    if (!sourceAssetClass) {
        throw new Error(`File does not contain a valid sourceAssetType`)
    }
    // Throw error if the metadata.json file does not contain a valid targetAssetType
    if (!targetAssetClass) {
        throw new Error(`File does not contain a valid targetAssetType`)
    }
    return { sourceAssetClass, targetAssetClass };
}

export async function unzipFile(bucket: Bucket, object: functions.storage.ObjectMetadata, assetFileName: string) {
    if (object.name === undefined) {
        throw new Error(`File ${assetFileName} does not have a name`)
    }
    const assetUnzippedPath = path.join(os.tmpdir(), "asset-unzip");
    await bucket.file(object.name).download({ destination: assetUnzippedPath });
    // Throw error if the zip does not contain a metadata.json at the root in the temp folder
    if (!(fs.existsSync(path.join(assetUnzippedPath, "metadata.json")) && fs.lstatSync(path.join(assetUnzippedPath, "metadata.json")).isFile())) {
        throw new Error(`File ${assetFileName} does not contain a metadata.json file`);
    }
    // Throw error if the zip does not contain a data folder
    if (!(fs.existsSync(path.join(assetUnzippedPath, "data")) && fs.lstatSync(path.join(assetUnzippedPath, "data")).isDirectory())) {
        throw new Error(`File ${assetFileName} does not contain a data folder`);
    }
    return assetUnzippedPath;
}

export function parseMetadataFile(assetUnzippedPath: string): AssetFileMetadata {
    return JSON.parse(fs.readFileSync(path.join(assetUnzippedPath, "metadata.json"), "utf8"));
}