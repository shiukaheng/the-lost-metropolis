import { Post, postSchema } from '../../api/types/Post';
import { Instance, RecursivePartial } from "../../api/utility_types";
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove, where } from "firebase/firestore";
import { PostDocData, postDocDataSchema } from './types/PostDocData';
import { naiveExport, subToRefWithRoleAuthSensitive } from './utilities';
import { db, storage } from '../firebase-config'
import { instance, uninstance } from '../../api/utilities';
import { omit, pick } from "lodash"
import { v4 as uuidv4 } from "uuid";
import { Asset, assetSchema } from '../../api/types/Asset';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { Roled } from './types/Role';

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
        if (post === undefined) {
            post = postSchema.getDefault()
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
    static async updatePost(postInstance: Instance<Post>, whitelist?: (keyof PostDocData)[], blacklist?: (keyof PostDocData)[]): Promise<void> {
        const [post, id] = uninstance(postInstance)
        let data: Partial<PostDocData> = VaporAPI.exportPost(post)
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

    // Asset CRUD - Not really crud though. Only supports upload and delete.
    /**
     * Uploads an asset to a post
     * @param postID the post ID
     * @param file the file to upload
     * @param onUploadProgress callback for upload progress
     * @returns Promise of the asset ID
     */
    static async uploadAsset(postID: string, file: File, onUploadProgress: (number)=>void): Promise<string> {
        // Generate a uuidv4 as an id for the asset
        const assetID = uuidv4()
        // Create an empty Asset object using the assetSchema
        const asset: Asset = assetSchema.getDefault()
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
                const uploadTask = uploadBytesResumable(fileRef, file, {contentType: "application/zip", customMetadata: {assetID, postID}})
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
        const assetInstance = post.data.assets.find(asset => asset.id === assetID)
        // Delete the asset from the post
        await updateDoc(postDocRef, { assets: arrayRemove(assetInstance) })
        // Note: Could be optimized to use an existing assetInstance that could be supplied as a parameter
    }

    // Utilities

    /**
     * Subscribes to all posts the current user has access to 
     * @param getPostCallback callback for new arrays of {@link Post} wrapped in {@link Instance} and {@link Roled}
     */
    static subscribePosts(getPostCallback: (postInstances: Array<Instance<Roled<Post>>>) => void): () => void {
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
        if (!postDocDataSchema.isValidSync(docData)) {
            console.error("Malformed post document from the database", docData)
            throw new Error("Error parsing post document")
        }
        return {
            data: {
                title: docData.title,
                description: docData.description,
                configuration: docData.configuration,
                sceneChildren: docData.sceneChildren,
                assets: docData.assets
            },
            metadata: {
                createdAt: docData.createdAt.toDate().toISOString(),
                updatedAt: docData.updatedAt.toDate().toISOString(),
                permissions: {
                    owner: docData.owner,
                    viewers: docData.viewers,
                    editors: docData.editors,
                    public: docData.public
                }
            }
        }
    }
}