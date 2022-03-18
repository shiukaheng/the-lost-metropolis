import * as functions from "firebase-functions";
import * as admin from "firebase-admin"
import { EventContext } from "firebase-functions";
import { QueryDocumentSnapshot } from "firebase-functions/v1/firestore";
import { assetZipMetadataSchema } from "./lib/types/AssetZipMetadata";
import { checkAssetRequested, unzipAsset, processAsset, uploadAssetToCDN, modifyAsset, cleanupFolders, generatePostFolderPath, generateAssetFolderPath } from "./lib/utilities";
import { postDocDataSchema } from "../../api/implementation_types/PostDocData";

admin.initializeApp();

const onNewFile = async (object: functions.storage.ObjectMetadata) => {
    if (!assetZipMetadataSchema.isValidSync(object.metadata)) {
        throw new Error("Invalid zip metadata")
    }
    // Check if asset is requested, if not, throw error
    const {postRef, asset} = await checkAssetRequested(object)
    const usedPaths: string[] = []
    try {
        // Unzip asset to local temp folder, and parse metadata.json to a variable and updating post doc too
        const {unzippedPath, metadataFile} = await unzipAsset(object, postRef)
        usedPaths.push(unzippedPath)
        // Take metadata and unzipped path as variable and get receiving directory of what to upload to CDN, and update processProgress
        const processedPath = await processAsset(unzippedPath, metadataFile, postRef, asset.id)
        usedPaths.push(processedPath)
        // Upload to CDN and mark asset as ready
        await uploadAssetToCDN(processedPath, object.metadata)
    } catch (e) {
        await modifyAsset(postRef, asset.id, (asset) => {
            asset.metadata.status.error = String(e)
            return asset
        })
        // await cleanupFolders(usedPaths)
        throw e
    }
    // Mark asset as ready
    await modifyAsset(postRef, asset.id, asset => {
        asset.metadata.status.ready = true
        return asset
    })
    // Cleanup temp directories
    // await cleanupFolders(usedPaths)
}

const onPostDocumentDelete = async (snapshot: QueryDocumentSnapshot, context: EventContext) => {
    const postID = snapshot.id
    const bucket = admin.storage().bucket("the-lost-metropolis-production-static")
    bucket.deleteFiles({
        prefix: generatePostFolderPath(postID)+"/"
    })
}

export const handleNewFile = functions.region("asia-east1").storage.object().onFinalize(onNewFile)
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
    // Find all the "subdirectories" of the "folder" of the post from the files list, remove duplicates, and that should be all the assets
    // Do it nicely, in steps, and with comments please.
    const subdirectories = files.filter(file => file.name.split("/").length > 1).map(file => file.name.split("/")[0])
    console.log(subdirectories)
})


