import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as unzipper from "unzipper";
import { AssetMetadataFile, assetMetadataFileSchema } from "./types/AssetMetadataFile";
import { AssetZipMetadata, assetZipMetadataSchema } from "./types/AssetZipMetadata";
import { promises as fsAsync } from "fs";
import * as fs from "fs";
import { Instance } from "../../../api/utility_types";
import { Asset } from "../../../api/types/Asset";
import { cloneDeep } from "lodash";
import { assetTypes } from "./types/AssetType";
import * as path from "path";
import { PostDocData, postDocDataSchema } from "../../../api/implementation_types/PostDocData"
import * as os from "os"

/**
 * Used for generating post path to upload to CDN
 */
export function generatePostFolderPath(postID: string): string {
    return `${postID}`;
}
/**
 * Used for generating post asset path to upload to CDN
 */
export function generateAssetFolderPath(postID: string, assetID: string): string {
    return `${generatePostFolderPath(postID)}/${assetID}`;
}
export async function checkAssetRequested(object: functions.storage.ObjectMetadata) {
    // Validate object's metadata field
    if (!assetZipMetadataSchema.isValidSync(object.metadata)) {
        throw new Error(`File ${object.name} does not have valid metadata`);
    }
    const metadata = object.metadata;
    // Check if post document exists wit id metadata.postID, if not, throw error
    const postRef = admin.firestore().collection("posts").doc(metadata.postID);
    const doc = await postRef.get();
    if (!doc.exists) {
        throw new Error(`Post with id ${metadata.postID} does not exist`);
    }
    // Validate post document
    const postSnap: PostDocData = doc.data() as PostDocData;
    if (!postDocDataSchema.isValidSync(postSnap)) {
        throw new Error(`Post with id ${metadata.postID} does not have valid data`);
    }
    // Check if asset exists on post.assets with id metadata.assetID, if not, throw error
    const asset: Instance<Asset> | undefined = postSnap.assets.find((asset: Instance<Asset>) => asset.id === metadata.assetID);
    if (!asset) {
        throw new Error(`Asset with id ${metadata.assetID} does not exist on post with id ${metadata.postID}`);
    }
    // Check if asset is pending (means not picked up by cloud function), if not, throw error
    if (!asset.data.metadata.status.pending) {
        throw new Error(`Asset with id ${metadata.assetID} has already been initialized`);
    }
    return { postRef, postSnap, asset };
}

function getTempDir() {
    if ( process.env.FUNCTIONS_EMULATOR ) {
        return os.tmpdir();
    } else {
        return "/tmp/";
    }
}

/**
 * Unzip asset, parse metadata.json, and update post document
 * @param object
 * @param postRef
 */
export async function unzipAsset(object: functions.storage.ObjectMetadata, postRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>): Promise<{ unzippedPath: string; metadataFile: AssetMetadataFile; }> {
    // Download zip to current directory
    const bucket = admin.storage().bucket();
    if (!(typeof object.name === "string")) {
        throw new Error(`File ${object.name} does not have a valid name`);
    }
    const tempDir = getTempDir();
    const zipDestination = path.resolve(tempDir, "compressed-asset");
    console.log("Fetching zip from bucket");
    await bucket.file(object.name).download({
        destination: zipDestination
    });
    // Deleting zip from bucket
    console.log("Deleting zip from bucket")
    await bucket.file(object.name).delete();
    // Unzip to temp folder
    const unzippedPath = path.resolve(tempDir, "extracted-asset");
    console.log("Unzipping")
    try {
        await unzip(zipDestination, unzippedPath);
    } catch (e) {
        await fsAsync.rm(path.resolve(zipDestination), { recursive: true });
        console.log(`Unzipping failed, reason: ${e}`);
        throw new Error(`Unable to unzip asset ${object.name}`);
    }
    console.log("Unzipping successful, deleting")
    // const unzippedPath = path.resolve(unzippingPath, fs.readdirSync(unzippingPath)[0]);
    // Delete zip
    await fsAsync.rm(path.resolve(zipDestination), { recursive: true });
    // Parse metadata.json
    console.log("Parsing metadata")
    const metadataRaw = await fsAsync.readFile(path.resolve(unzippedPath, "metadata.json"), "utf8");
    const metadataFile = JSON.parse(metadataRaw);
    if (!assetMetadataFileSchema.isValidSync(metadataFile)) {
        throw new Error(`Metadata file is not valid`);
    }
    // Check object.metadata integrity
    if (!(assetZipMetadataSchema.isValidSync(object.metadata))) {
        throw new Error("Invalid zip metadata");
    }
    // Update post document's asset entry from metadata
    await modifyAsset(postRef, object.metadata.assetID, (asset => {
        asset.metadata.sourceAssetType = metadataFile.sourceAssetType;
        asset.metadata.targetAssetType = metadataFile.targetAssetType;
        asset.metadata.name = metadataFile.name || "untitled";
        asset.metadata.status.pending = false;
        asset.data = metadataFile.assetData;
        return asset;
    }));
    return { unzippedPath, metadataFile };
}

async function unzip(zip_destination: string, unzipped_path: string): Promise<void> {
    const read: Promise<void> = new Promise((resolve, reject) => {
        const stream = fs.createReadStream(zip_destination).pipe(unzipper.Extract({ path: path.resolve(unzipped_path) }));
        stream.on("close", () => {
            resolve();
        });
    })
    return read;
}

/**
 * Updates asset from post document
 */
export async function modifyAsset(postRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, assetID: string, modifier: (x: Asset) => Asset): Promise<void> {
    const db = admin.firestore();
    try {
        await db.runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
            const postData = (await transaction.get(postRef)).data();
            if (!postDocDataSchema.isValidSync(postData)) {
                throw new Error("Invalid post document");
            }
            const assets: Instance<Asset>[] = postData.assets;
            const oldAsset = postData.assets.find(asset => asset.id === assetID);
            if (oldAsset === undefined) {
                throw new Error("Asset not found");
            }
            const newAssetData: Asset = modifier(cloneDeep(oldAsset.data));
            const newAssets: Instance<Asset>[] = assets.map(asset => (asset.id === assetID) ? { id: assetID, data: newAssetData } : asset);
            transaction.update(postRef, {
                assets: newAssets
            });
        });
        console.log("Transaction successful");
    } catch (e) {
        console.log("Transaction failure", e);
    }
}
/**
 * Return path of converted assets folder (by converting, or returning unzippedPath), has side effect of updating asset's progress field
 * @param unzippedPath
 * @param metadataFile
 * @param */
export async function processAsset(unzippedPath: any, metadataFile: AssetMetadataFile, postRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, assetID: string) {
    const unzippedDataPath = path.resolve(unzippedPath, "data");
    const tempDir = getTempDir();
    const convertedDataPath = path.resolve(tempDir, "converted_data");
    const targetType = assetTypes.find(type => type.assetLiteral === metadataFile.targetAssetType);
    if (targetType === undefined) {
        throw new Error("Unrecognized target type");
    }
    const sourceType = assetTypes.find(type => type.assetLiteral === metadataFile.sourceAssetType);
    if (sourceType === undefined) {
        throw new Error("Unrecognized source type");
    }
    if (metadataFile.sourceAssetType === metadataFile.targetAssetType) {
        sourceType.validate(metadataFile.assetData, unzippedDataPath);
        modifyAsset(postRef, assetID, (asset => {
            asset.metadata.status.processed = true;
            asset.metadata.status.processedProgress = 1;
            return asset;
        }));
        return unzippedDataPath;
    } else {
        const converter = targetType.conversionMap.get(sourceType);
        if (converter === undefined) {
            throw new Error(`No conversion method from ${sourceType.assetLiteral} tp ${targetType.assetLiteral}`);
        }
        await converter(metadataFile.assetData, unzippedDataPath, convertedDataPath, (progress) => {
            modifyAsset(postRef, assetID, (asset => {
                // Update processing progress
                asset.metadata.status.processedProgress = progress;
                return asset;
            }));
        });
        // Mark processing as done
        await modifyAsset(postRef, assetID, (asset => {
            asset.metadata.status.processed = true;
            return asset;
        }));
        return convertedDataPath;
    }
}
export async function uploadAssetToCDN(processedPath: any, metadata: AssetZipMetadata) {
    // Get static bucket reference and upload all files (recursive) of processedPath to the bucket under the folder `${postID}/${assetID}/`
    const bucket = admin.storage().bucket("the-lost-metropolis-production-static");
    const assetPath = generateAssetFolderPath(metadata.postID, metadata.assetID);
    const files = await fsAsync.readdir(processedPath);
    for (const file of files) {
        await bucket.upload(`${processedPath}/${file}`, {
            destination: `${assetPath}/${file}`
        });
    }
}
export async function cleanupFolders(paths: string[]) {
    for (const path of paths) {
        // Check if path exists
        if (fs.existsSync(path)) {
            await fsAsync.rm(path, { recursive: true });
        }
    }
}
