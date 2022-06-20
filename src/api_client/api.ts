import { Post, postSchema } from '../../api/types/Post';
import { AssetMetadataFile } from "../../functions/src/lib/types/AssetMetadataFile"
import { Instance, RecursivePartial } from "../../api/utility_types";
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove, where, runTransaction, Transaction } from "firebase/firestore";
import { PostDocData, postDocDataSchema } from '../../api/implementation_types/PostDocData';
import { naiveExport, subToRefWithRoleAuthSensitive } from './utilities';
import { db, storage, functions } from '../firebase-config'
import { instance, uninstance } from '../../api/utilities';
import { cloneDeep, omit, pick } from "lodash"
import { v4 } from "uuid";
import { Asset, assetSchema } from '../../api/types/Asset';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { Roled } from '../../api/implementation_types/Role';
import { httpsCallable } from "firebase/functions"; 

export default class VaporAPI {

    private static postsRef = collection(db, "posts");
    private static storageRef = storage;
    private static publicPostsRoleQueryMap = new Map()
    .set("public", [where("public", "==", true)])

    // Post CRUD
    /**
     * Create post given a post object
     * @param post the {@link Post} object to create the post upon
     * @returns the ID of the post
     */
    static async createPost(post?: Post): Promise<string> {
        let actualPost: Post;
        if (post === undefined) {
            actualPost = postSchema.getDefault()
        } else {
            actualPost = post
        }
        const exported = VaporAPI.exportPost(post);
        // const cloned = JSON.parse(JSON.stringify(exported))
        // console.log(exported, cloned)
        const doc = await addDoc(VaporAPI.postsRef, exported)
        return doc.id
    }

    /**
     * Read post content given a post ID
     * @param id the post ID
     * @returns a {@link Post} object wrapped in a {@link Instance}
     */
    static async readPost(id: string): Promise<Instance<Post>> {
        const docSnap = await getDoc(doc(VaporAPI.postsRef, id))
        const data = docSnap.data()
        if (!(docSnap.exists()) || data === undefined) {
            throw new Error("Document does not exist")
        }
        if (!(postDocDataSchema.isValid(data))) {
            throw new Error("Document is corrupted")
        }
        const decoded = VaporAPI.importPost(data as PostDocData)
        return instance(decoded, docSnap.id)
    }

    /**
     * Update post content
     * @param postInstance a {@link Post} object wrapped in a {@link Instance}
     * @param whitelist optional whitelist of {@link PostDocData} properties that should be updated
     * @param blacklist optional blacklist of {@link PostDocData} properties that should not be updated, if defined the whitelist will be ignored
     */
    static async updatePost(postInstance: Instance<Partial<Post>>, whitelist?: (keyof PostDocData)[], blacklist?: (keyof PostDocData)[]): Promise<void> {
        const [post, id] = uninstance(postInstance)
        let data: Partial<PostDocData> = VaporAPI.exportPost(post, true)
        if (blacklist) {
            data = omit(data, blacklist)
        } else if (whitelist) {
            data = pick(data, whitelist)
        }
        await updateDoc(doc(VaporAPI.postsRef, id), data)
    }

    /**
     * Delete post
     * @param id post id
     */
    static async deletePost(id: string): Promise<void> {
        await deleteDoc(doc(VaporAPI.postsRef, id))
    }

    // Asset CRUD, a bit more managed than the post CRUD
    /**
     * Uploads an asset to a post, file will be a .vaps file which is just a zip archive with a metadata.json and a data folder containing files used by the asset. E.g., Potree and 3D tiles.
     * @param postID the post ID
     * @param file the .vaps package to upload
     * @param onUploadProgress callback for upload progress
     * @param tags optional tags to add to the asset
     * @returns Promise of the asset ID
     */
    static async uploadAsset(postID: string, file: File, onUploadProgress: (number)=>void, tags?: string[]): Promise<string> {
        // Generate a uuidv4 as an id for the asset
        const assetID = v4()
        // Create an empty Asset object using the assetSchema
        const asset: Asset = assetSchema.getDefault()
        // Concatenate tags to the asset, not just setting it
        if (tags) {
            asset.metadata.tags.push(...tags)
        }
        // Wrap the Asset object in an instance with the uuid
        const assetInstance = instance(asset, assetID)
        // Get the post document's reference on firebase
        const postDocRef = doc(VaporAPI.postsRef, postID)
        // Use arrayUnion and addDoc to add the asset to the assets array
        await updateDoc(postDocRef, { assets: arrayUnion(assetInstance) })
        // Use storageRef to upload the file to /<postID>/<assetID>, although the name is not important. Just to avoid collisions.
        const fileRef = ref(VaporAPI.storageRef, `${postID}/${assetID}`)
        const uploadFile: Promise<void> = new Promise((resolve, reject) => {
            try {
                const uploadTask = uploadBytesResumable(fileRef, file, {contentType: "application/zip", customMetadata: {assetID, postID, singleFile: "false"}})
                uploadTask.on("state_changed", (snapshot) => {
                    const progress = snapshot.bytesTransferred / snapshot.totalBytes;
                    if (onUploadProgress !== undefined) {
                        onUploadProgress(progress)
                    }
                }, (error) => {
                    reject(error)
                }, () => {
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        })
        await uploadFile
        return assetID
    }

    // TODO: Move AssetMetadataFile out of functions and into the api
    /**
     * Convenience method to upload an asset that only uses a single file, like images, sounds, etc. Supplying a metadata file is optional, but recommended as file types can be ambiguous and naming the asset is important.
     * @param postID the post ID
     * @param file the file to upload
     * @param metadata optional metadata to attach to asset
     * @param onUploadProgress callback for upload progress
     * @param tags optional tags to add to the asset
     * @returns Promise of the asset ID
     */
    static async uploadSingleFileAsset(postID: string, file: File, metadata: Partial<AssetMetadataFile>={}, onUploadProgress: (number)=>void, tags?: string[]): Promise<string> {
        // Generate a uuidv4 as an id for the asset
        const assetID = v4()
        // Generate AssetMetadataFile json with the information we have
        const asset = generateAsset(metadata);
        // Add tags to the asset
        if (tags) {
            asset.metadata.tags.push(...tags)
        }
        // Wrap the Asset object in an instance with the uuid
        const assetInstance = instance(asset, assetID)
        // Get the post document's reference on firebase
        const postDocRef = doc(VaporAPI.postsRef, postID)
        // Use arrayUnion and addDoc to add the asset to the assets array
        await updateDoc(postDocRef, { assets: arrayUnion(assetInstance) })
        // Use storageRef to upload the file to /<postID>/<assetID>/<file name>, the filename here is important as it is preserved.
        const fileRef = ref(VaporAPI.storageRef, `${postID}/${assetID}/${file.name}`)
        const uploadFile: Promise<void> = new Promise((resolve, reject) => {
            try {
                const uploadTask = uploadBytesResumable(fileRef, file, {contentType: "application/octet-stream", customMetadata: {assetID, postID, singleFile: "true"}})
                uploadTask.on("state_changed", (snapshot) => {
                    const progress = snapshot.bytesTransferred / snapshot.totalBytes;
                    if (onUploadProgress !== undefined) {
                        onUploadProgress(progress)
                    }
                }, (error) => {
                    reject(error)
                }, () => {
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        })
        try {
            await uploadFile
        } catch (e) {
            if (window.location.hostname !== "localhost") {
                throw e
            } else {
                console.warn("Error uploading asset, but most likely due to firebase-emu bug", e)
            }
        }
        
        return assetID
    }

    /**
     * Updates the asset object in database, but does not update the asset file.
     * @param postID the ID of the post the asset belongs to
     * @param assetID the asset ID to be updated
     * @param newAsset, either a new asset object, or a function that takes in the asset object and returns the updated asset object
     */
    static async updateAsset(postID: string, assetID: string, newAsset: Asset | ((Asset) => Asset)): Promise<void> {
        // Determine update type
        try {
            await runTransaction(db, async(transaction: Transaction) => {
                const postRef = doc(VaporAPI.postsRef, postID)
                const postData = (await transaction.get(postRef)).data();
                if (!postDocDataSchema.isValidSync(postData)) {
                    throw new Error("Invalid post document");
                }
                const assets: Instance<Asset>[] = postData.assets;
                const oldAsset = postData.assets.find(asset => asset.id === assetID);
                if (oldAsset === undefined) {
                    throw new Error("Asset not found");
                }
                var updatedAsset: Asset;
                if (typeof newAsset === "function") {
                    updatedAsset = newAsset(cloneDeep(oldAsset.data));
                } else {
                    updatedAsset = newAsset;
                }
                // Check newAsset schema
                if (!assetSchema.isValidSync(updatedAsset)) {
                    throw new Error("Invalid asset object");
                }
                
                const newAssets: Instance<Asset>[] = assets.map(asset => (asset.id === assetID) ? { id: assetID, data: updatedAsset } : asset);
                transaction.update(postRef, {
                    assets: newAssets
                });
            }) 
        } catch (e) {
            console.error(e)
            throw new Error("Transaction failure");
        }
    }

    /**
     * Deletes an asset from a post
     * @param postID the post ID
     * @param assetID the asset ID
     */
    static async deleteAsset(postID: string, assetID: string): Promise<void> {
        const postDocRef = doc(VaporAPI.postsRef, postID)
        // Get the post document's data
        const postDocData = (await getDoc(postDocRef)).data()
        // Import the post document's data
        const post = VaporAPI.importPost(postDocData as PostDocData)
        // Get the asset instance
        const assetInstance = post.assets.find(asset => asset.id === assetID)
        // Delete the asset from the post
        await updateDoc(postDocRef, { assets: arrayRemove(assetInstance) })
        // Note: Could be optimized to use an existing assetInstance that could be supplied as a parameter
        const culler = httpsCallable(functions, "cullUnreferencedAssets");
        await culler({postID})
    }

    // Utilities

    /**
     * Subscribes to all posts the current user has access to 
     * @param getPostCallback callback for new arrays of {@link Post} wrapped in {@link Instance} and {@link Roled}
     */
    static subscribePosts(getPostCallback: (postInstances: Array<Instance<Roled<Post>>> | null) => void): () => void {
        return subToRefWithRoleAuthSensitive(
            VaporAPI.postsRef, 
            (user) => {
                if (user !== null && user !== undefined) {
                    return new Map()
                    .set("owner", [where("owner", "==", user.uid)])
                    .set("editor", [where("editors", "array-contains", user.uid)])
                    .set("viewer", [where("viewers", "array-contains", user.uid)])
                    .set("public", [where("public", "==", true)]);
                } else {
                    return this.publicPostsRoleQueryMap;
                }
            },
            VaporAPI.importPost,
            getPostCallback)
    }

    /**
     * Exports a {@link Post} object to a {@link PostDocData} object
     * @param post rescursive partial of the {@link Post} object to export
     * @param cast whether to force cast to {@link PostDocData} or not, otherwise if {@link post} is not well formed it will throw an error
     * @returns a {@link PostDocData} object
     */
    // TODO: Make exportPost and importPost more dynamic, just replacing the properties with unsupported data types with another.
    static exportPost(post: RecursivePartial<Post>, cast=false): PostDocData { // Always return a full PostDocData, for partial updates, use PostDocData mask
        if (postSchema.isValidSync(post)) {
            return naiveExport(post)
        } else {
            if (cast) {
                return naiveExport(postSchema.validateSync(post))
            } else {
                console.warn(`Malformed post:`, post)
                throw new Error("Post object is not well formed, yet cast is not enabled")
            }
        }
    }

    /**
     * Imports a {@link PostDocData} object to a {@link Post} object
     * @param docData {@link PostDocData} object to import
     * @returns a {@link Post} object
     */
    static importPost(docData:PostDocData): Post {
        postDocDataSchema.validateSync(docData, {strict: true})
        return {
            title: docData.title,
            description: docData.description,
            configuration: docData.configuration,
            sceneChildren: docData.sceneChildren,
            assets: docData.assets,
            owner: docData.owner,
            editors: docData.editors,
            viewers: docData.viewers,
            public: docData.public,
            listed: docData.listed,
            createdAt: docData.createdAt.toDate().toISOString(),
            updatedAt: docData.updatedAt.toDate().toISOString(),
            theme: docData.theme,
            tags: docData.tags,
            sponsors: docData.sponsors,
        }
    }

    /**
     * Resolves an asset's root path given a post ID and an asset ID
     */
    static resolveAsset(postID: string, assetID: string): string {
        if ((import.meta.env.MODE === "development") && (window.location.hostname === "localhost")) {
            return `http://localhost:5341/the-lost-metropolis-production-static/${postID}/${assetID}/`
        } else {
            return `https://static.thelostmetropolis.org/${postID}/${assetID}/`
        }
    }
}

function generateAsset(metadata: Partial<AssetMetadataFile>) {
    const asset = assetSchema.getDefault()
    if (metadata.name !== undefined && metadata.name !== null) {
        asset.metadata.name = metadata.name
    }
    if (metadata.sourceAssetType !== undefined && metadata.sourceAssetType !== null) {
        asset.metadata.sourceAssetType = metadata.sourceAssetType
    }
    if (metadata.targetAssetType !== undefined && metadata.targetAssetType !== null) {
        asset.metadata.targetAssetType = metadata.targetAssetType
    }
    if (metadata.assetData !== undefined && metadata.assetData !== null) {
        asset.data = metadata.assetData
    }
    return asset;
}
