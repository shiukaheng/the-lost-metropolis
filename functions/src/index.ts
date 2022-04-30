import * as functions from "firebase-functions";
import * as admin from "firebase-admin"
import { EventContext } from "firebase-functions";
import { QueryDocumentSnapshot } from "firebase-functions/v1/firestore";
import { assetZipMetadataSchema } from "./lib/types/AssetZipMetadata";
import { checkAssetRequested, unzipAsset, processAsset, uploadAssetToCDN, modifyAsset, cleanupFolders, generatePostFolderPath, generateAssetFolderPath, getTempDir, getAssetType } from "./lib/utilities";
import { postDocDataSchema } from "../../api/implementation_types/PostDocData";
import * as path from "path";
import { SourceAssetLiteral, TargetAssetLiteral } from "../../api/types/AssetLiteral";
import { Asset } from "../../api/types/Asset";
import { AssetConverterFunction, AssetType, assetTypes } from "./lib/types/AssetType";
import * as fs from "fs";

admin.initializeApp();

const onNewFile = async (object: functions.storage.ObjectMetadata) => {
    if (!assetZipMetadataSchema.isValidSync(object.metadata)) {
        throw new Error("Invalid zip metadata")
    }
    // Check if asset is requested, if not, throw error
    const {postRef, asset} = await checkAssetRequested(object)
    if (object.metadata?.singleFile === "true") {
        await processSingleFileAsset(object, asset, postRef);
    } else {
        await processZippedAsset(object, postRef, asset);
    }
}

const onPostDocumentDelete = async (snapshot: QueryDocumentSnapshot, context: EventContext) => {
    const postID = snapshot.id
    const bucket = admin.storage().bucket("the-lost-metropolis-production-static")
    bucket.deleteFiles({
        prefix: generatePostFolderPath(postID)+"/"
    })
}

export const handleNewFile = functions.region("asia-east1").runWith({
    timeoutSeconds: 540,
    memory: "8GB"
}).storage.object().onFinalize(onNewFile)
export const handlePostDocumentDelete = functions.region("asia-east1").firestore.document("posts/{postID}").onDelete(onPostDocumentDelete)

export type CullUnreferencedAssetData = {
    assetID: string
}

export const cullUnreferencedAssets = functions.region("asia-east1").https.onCall(async (data, context) => {
    const db = admin.firestore();
    const {postID} = data
    // Get post document
    const postRef = db.collection("posts").doc(postID)
    const postDoc = await postRef.get()
    if (!postDoc.exists) {
        throw new Error("Post does not exist")
    }
    const post = postDoc.data() as any
    await postDocDataSchema.validate(post)
    // Get assets object
    const assets = post.assets
    const assetIDs = assets.map(asset => asset.id) // Asset IDs mentioned in post, we need to remove assets in the static folder that are not mentioned
    // Find all assets in static folder with prefix of postID
    const bucket = admin.storage().bucket("the-lost-metropolis-production-static")
    const files = await bucket.getFiles({
        prefix: generatePostFolderPath(postID)
    })
    const ids = files[0].map(file => file.name.split("/")[1])
    const ids_distinct = [...new Set(ids)]
    const ids_to_delete = ids_distinct.filter(id => !assetIDs.includes(id))
    // Delete all files that has its name start with <postID>/<assetID>/
    console.log(ids_to_delete)
    for (const assetID of ids_to_delete) {
        await bucket.deleteFiles({
            prefix: generateAssetFolderPath(postID, assetID)
        })
    }
    return {}
})

async function processSingleFileAsset(object: functions.storage.ObjectMetadata, asset, postRef: admin.firestore.DocumentReference<admin.firestore.DocumentData>) {
    const usedPaths = []
    try {
        // Download file to local directory
        console.log("Downloading file to local directory")
        const bucket = admin.storage().bucket();
        if (!(typeof object.name === "string")) {
            throw new Error(`File ${object.name} does not have a valid name`);
        }
        const tempDir = getTempDir();
        // Make a single-file-asset folder
        console.log("Making single-file-asset folder")
        const fileDestination = path.resolve(tempDir, "single-file-asset", object.name);
        const downloadFolder = path.dirname(fileDestination)
        usedPaths.push(downloadFolder)
        fs.mkdirSync(downloadFolder, { recursive: true });
        console.log("Fetching file from temp bucket");
        await bucket.file(object.name).download({
            destination: fileDestination
        });
        // Delete file from bucket
        console.log("Deleting file from temp bucket");
        await bucket.file(object.name).delete();
        // Get asset from post
        console.log("Determining asset types")
        // Determine source and target asset types using function that takes in provided info in database and the file itself
        const { sourceAssetType, targetAssetType } = determineSFAssetAssetTypePair(fileDestination, asset.data);
        // Change source and target types, and set pending to false
        console.log("Updating asset source, target types:", sourceAssetType.assetLiteral, targetAssetType.assetLiteral)
        await modifyAsset(postRef, asset.id, asset => {
            asset.metadata.sourceAssetType = sourceAssetType.assetLiteral;
            asset.metadata.targetAssetType = targetAssetType.assetLiteral;
            asset.metadata.status.pending = false;
            return asset;
        });
        // Convert asset to target asset type if required
        var targetPath: string;
        const sourcePath = path.dirname(fileDestination);
        if (sourceAssetType !== targetAssetType) {
            console.log("Converting asset to target asset type")
            targetPath = path.resolve(tempDir, "converted_data");
            usedPaths.push(targetPath)
            fs.mkdirSync(targetPath, { recursive: true });
            (sourceAssetType.getConverter(targetAssetType) as AssetConverterFunction)(
                asset.data.data,
                sourcePath,
                targetPath,
                (progress) => {
                    // Update process progress
                    modifyAsset(postRef, asset.id, asset => {
                        asset.metadata.status.processedProgress = progress;
                        return asset;
                    });
                }
            );
        } else {
            console.log("No conversion required")
            targetPath = sourcePath;
        }
        // Mark asset as processed
        console.log("Marking asset as processed")
        modifyAsset(postRef, asset.id, asset => {
            asset.metadata.status.processedProgress = 1;
            asset.metadata.status.processed = true;
            return asset;
        });
        // Upload to CDN
        console.log("Uploading to CDN")
        // Verify object.metadata is valid
        if (!assetZipMetadataSchema.isValidSync(object.metadata)) {
            throw new Error("Invalid file metadata")
        }
        await uploadAssetToCDN(targetPath, object.metadata);
    } catch (e) {
        await modifyAsset(postRef, asset.id, (asset) => {
            asset.metadata.status.error = String(e);
            return asset;
        });
        await cleanupFolders(usedPaths);
        throw e;
    }
    // Mark asset as ready
    modifyAsset(postRef, asset.id, asset => {
        asset.metadata.status.ready = true;
        return asset;
    });
    await cleanupFolders(usedPaths);
    console.log("Done creating asset")
}

async function processZippedAsset(object: functions.storage.ObjectMetadata, postRef: admin.firestore.DocumentReference<admin.firestore.DocumentData>, asset) {
    const usedPaths: string[] = [];
    try {
        // Unzip asset to local temp folder, and parse metadata.json to a variable and updating post doc too
        const { unzippedPath, metadataFile } = await unzipAsset(object, postRef);
        usedPaths.push(unzippedPath);
        // Take metadata and unzipped path as variable and get receiving directory of what to upload to CDN, and update processProgress
        const processedPath = await processAsset(unzippedPath, metadataFile, postRef, asset.id);
        usedPaths.push(processedPath);
        // Verify object.metadata is valid
        if (!assetZipMetadataSchema.isValidSync(object.metadata)) {
            throw new Error("Invalid zip metadata")
        }
        // Upload to CDN and mark asset as ready
        await uploadAssetToCDN(processedPath, object.metadata);
    } catch (e) {
        await modifyAsset(postRef, asset.id, (asset) => {
            asset.metadata.status.error = String(e);
            return asset;
        });
        await cleanupFolders(usedPaths);
        throw e;
    }
    // Mark asset as ready
    await modifyAsset(postRef, asset.id, asset => {
        asset.metadata.status.ready = true;
        return asset;
    });
    // Cleanup temp directories
    await cleanupFolders(usedPaths);
}

/**
 * Determines the source and target asset types of a single file asset
 * @param fileDestination The path to the file that was downloaded
 * @param asset The asset object in the database
 */
function determineSFAssetAssetTypePair(fileDestination: string, asset: Asset): { sourceAssetType: typeof AssetType; targetAssetType: typeof AssetType; } {
    console.log("Asset detection with params:", fileDestination, asset)
    var sourceType: typeof AssetType = null;
    var targetType: typeof AssetType = null;
    var sourceTypeVerified = false;
    console.log("Getting asset folder")
    const assetFolder = path.dirname(fileDestination);
    // Check if sourceAssetType and targetAssetType are provided in metadata
    // Conditional: If both sourceAssetType and targetAssetType is provided, 
    if (asset.metadata.sourceAssetType && asset.metadata.targetAssetType) {
        console.log("Source and target asset types provided in metadata, checking if they are a valid pair")
        // If yes, check if it is a valid source-target pair
        const proposedSourceAssetType = getAssetType(asset.metadata.sourceAssetType);
        const proposedTargetAssetType = getAssetType(asset.metadata.targetAssetType);
        console.log("Proposed source and target asset types:", proposedSourceAssetType, proposedTargetAssetType)
        console.log((proposedSourceAssetType.assetLiteral === proposedTargetAssetType.assetLiteral), (proposedTargetAssetType.target), (proposedTargetAssetType.source))
        if (proposedSourceAssetType.conversionMap.has(proposedTargetAssetType) || 
        ((proposedSourceAssetType.assetLiteral === proposedTargetAssetType.assetLiteral) && (proposedTargetAssetType.target) && (proposedTargetAssetType.source))) {
            // If yes: set sourceAssetType and targetAssetType to the provided values
            console.log("Valid source-target pair, setting source and target asset types")
            sourceType = proposedSourceAssetType;
            targetType = proposedTargetAssetType;
        } else {
            // If not, throw error: Invalid source-target pair
            console.error("Invalid source-target pair, throwing error")
            throw new Error("Invalid source-target pair specified");
        }
        console.log("Source and target asset types verified")
    } else {
        console.log("No source or target asset types provided in metadata, checking if file belongs to a known asset type")
        // If no: try detect sourceAssetType
        const detectedTypes = detectAssetTypes(asset.data, assetFolder)
        const sourceTypes = detectedTypes.filter(type => type.source)
        if (sourceTypes.length === 1) {
            // If a single sourceType is found, see if it is also a targetAssetType
            sourceType = sourceTypes[0];
            sourceTypeVerified = true;
            if (sourceType.target) {
                // If yes: Set targetAssetType to the sourceAssetType
                targetType = sourceType;
            } else {
                // If no: Throw error: Given file is a sourceAssetType but not a targetAssetType, please provide targetAssetType
                throw new Error("Given file is a sourceAssetType but not a targetAssetType, please provide targetAssetType");
            }
        } else if (sourceTypes.length > 1) {
            // If multiple sourceTypes are found, throw error: Given file is ambiguous, please provide sourceAssetType and targetAssetType
            throw new Error("Given file is ambiguous, please provide sourceAssetType and targetAssetType");
        } else {
            throw new Error("Given file is not a valid asset, please provide sourceAssetType and targetAssetType");
        }   
    }
    // Check sourceType validity if it was not verified before
    console.log("Validating proposed types:", sourceType, targetType)
    if (!sourceTypeVerified) {
        sourceType.validate(asset.data, assetFolder);
    }
    return { sourceAssetType: sourceType, targetAssetType: targetType };
}

function detectAssetTypes(assetData: any, rootPath: string): (typeof AssetType)[] {
    const possibleTypes = [];
    for (const assetType of assetTypes) {
        try {
            assetType.validate(assetData, rootPath)
            possibleTypes.push(assetType);
        } catch {
            // Do nothing
        }
    }
    return possibleTypes;
}