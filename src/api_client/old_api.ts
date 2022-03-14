import { FetchedPost, IdentifyingPost, FetchedAsset, InputPost, RecursivePartial } from '../../api_old/types';
import { AssetDoc, PostDoc, PostDocData, AssetDocData, WrapSnap } from "../../api_old/implementation_types";
import { addDoc, collection, CollectionReference, deleteDoc, doc, DocumentReference, getDoc, onSnapshot, Timestamp, updateDoc, where } from "firebase/firestore";
import { Permissions, Asset, Post, SubscriberCallback, AbstractVaporAPI, AssetStatus, WithRole, MultiLangString, PostData, Role, PostID, AssetID, TaskProgressCallback, TaskSequence, WithOptionalRole } from '../../api_old/types';
import { db, storage, auth } from '../firebase-config';
import { createPostObject, createTaskSequence, readPostFromRef, subToRefWithRoleAuthSensitive } from './utilities';
import { rolify } from "./utilities"
import { DocumentData, DocumentSnapshot } from '@google-cloud/firestore';
import { ref, uploadBytesResumable } from "firebase/storage";
import Defaults from "../../api_old/defaults";
import { Auth, Unsubscribe } from "firebase/auth";

const subDocData = (docRef: DocumentReference, callback: (data: Asset) => void):Unsubscribe => {
    const unsub = onSnapshot(docRef, docSnapshot => {
        callback(VaporAPI.decodeAsset(WrapSnap(docSnapshot) as AssetDoc))
    });
    return unsub;
};

export class VaporAPI implements AbstractVaporAPI {

    // Common variables

    private static postsRef = collection(db, "posts");

    private static assetsRef = collection(db, "assets");
    
    private static publicPostsRoleQueryMap = new Map()
    .set("public", [where("public", "==", true)])

    private static storageRef = storage;

    // Decode / Encode functions (translating between the API and the database)

    static decodePost(rawPost: PostDoc): Post {
        try {
            return {
                id: rawPost.id,
                title: (rawPost.data.title as MultiLangString),
                description: (rawPost.data.description as MultiLangString),
                data: (rawPost.data.data as PostData),
                metadata: {
                    createdAt: rawPost.data.createdAt.toDate().toISOString(),
                    updatedAt: rawPost.data.updatedAt.toDate().toISOString(),
                    permissions: {
                        owner: rawPost.data.owner,
                        editors: rawPost.data.editors,
                        viewers: rawPost.data.viewers,
                        public: rawPost.data.public,
                    },
                    assets: rawPost.data.assets
                }
            }
        } catch (error) {
            console.error(`Error decoding post ${rawPost.id}`);
            throw error;
        }
    }

    static encodePost(post: WithOptionalRole<Post>): PostDoc {
        try {
            return {
                id: post.id,
                data: {
                    createdAt: Timestamp.fromDate(new Date(post.metadata.createdAt)),
                    updatedAt: Timestamp.fromDate(new Date(post.metadata.updatedAt)),
                    title: post.title,
                    description: post.description,
                    data: post.data,
                    owner: post.metadata.permissions.owner,
                    editors: post.metadata.permissions.editors,
                    viewers: post.metadata.permissions.viewers,
                    public: post.metadata.permissions.public,
                    assets: post.metadata.assets
                }
            }
        } catch (error) {
            console.error(`Error encoding post ${post.id}`);
            throw error;
        }
    }

    static decodeAsset(rawAsset: AssetDoc): Asset {
        try {
            return {
                id: rawAsset.id,
                name: rawAsset.data.name,
                sourceAssetType: rawAsset.data.sourceAssetType,
                targetAssetType: rawAsset.data.targetAssetType,
                data: rawAsset.data.data,
                metadata: {
                    createdAt: "",
                    permissions: {
                        owner: "",
                        editors: [],
                        viewers: [],
                        public: false
                    },
                    status: {
                        uploaded: false,
                        pending: false,
                        processedProgress: 0,
                        processed: false,
                        ready: false
                    }
                }
            }
        } catch (error) {
            console.error(`Error decoding asset ${rawAsset.id}`);
            throw error;
        }
    }

    static encodeAsset(asset: WithOptionalRole<Asset>): AssetDoc {
        try {
            return {
                id: asset.id,
                data: {
                    createdAt: Timestamp.fromDate(new Date(asset.metadata.createdAt)),
                    name: asset.name,
                    sourceAssetType: asset.sourceAssetType,
                    targetAssetType: asset.targetAssetType,
                    data: asset.data,
                    owner: asset.metadata.permissions.owner,
                    editors: asset.metadata.permissions.editors,
                    viewers: asset.metadata.permissions.viewers,
                    public: asset.metadata.permissions.public,
                    uploaded: asset.metadata.status.uploaded,
                    pending: asset.metadata.status.pending,
                    processedProgress: asset.metadata.status.processedProgress,
                    processed: asset.metadata.status.processed,
                    ready: asset.metadata.status.ready,
                }
            }
        } catch (error) {
            console.error(`Error encoding asset ${asset.id}`);
            throw error;
        }
    }

    // Post CRUD

    static subscribePosts(callback: SubscriberCallback<FetchedPost[]>): () => void {
        return subToRefWithRoleAuthSensitive(
            this.postsRef,
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
            (snapshot:DocumentSnapshot) => {
                const data = snapshot.data();
                if (snapshot.exists && data !== undefined) {
                    return VaporAPI.decodePost({
                        id: snapshot.id,
                        data: (data as PostDocData)
                    });
                } else {
                    throw new Error("Post not found");
                }
            },
            callback
        )
    }

    static async createPost(partialPost: InputPost): Promise<void> {
        const post: Post = createPostObject(partialPost);
        const rawPost = VaporAPI.encodePost(post);
        await addDoc(VaporAPI.postsRef, rawPost.data)
    }

    static async readPost(id: PostID): Promise<FetchedPost> {
        // Reads post document with id in posts collection
        const docRef = doc(VaporAPI.postsRef, id);
        return rolify(await readPostFromRef(docRef)) as FetchedPost; // Need to cast to FetchedPost because of dependent types
    }

    static async updatePost(post: FetchedPost): Promise<void> {
        // Updates post document with id in posts collection
        const encoded = VaporAPI.encodePost(post);
        const docRef = doc(VaporAPI.postsRef, post.id);
        await updateDoc(docRef, encoded.data);
    }

    static async deletePost(id: PostID): Promise<void> {
        // Deletes post document with id in posts collection
        const docRef = doc(VaporAPI.postsRef, id);
        await deleteDoc(docRef);
    }

    // Asset CRUD

    static subscribeAssets(callback: SubscriberCallback<FetchedAsset[]>): () => void {
        return subToRefWithRoleAuthSensitive(
            this.assetsRef,
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
            VaporAPI.decodeAsset,
            callback
        )
    }

    // static async listPostAssets(postID: PostID): Promise<FetchedAsset[]> {
    //     throw new Error("Method not implemented.");
    // }

    static async createAssetWithProgress(file: File, permissions?: Permissions, progressCallback?: TaskProgressCallback, waitForReady=false): Promise<AssetID> {
        const tasks = waitForReady ? 
        createTaskSequence({"en": "uploading file", "zh": "上傳檔案中"}, {"en": "awaiting processing", "zh": "等待處理"}, {"en": "processing", "zh": "處理中"}, {"en": "uploading to cdn", "zh": "上傳到CDN中"}) :
        createTaskSequence({"en": "uploading file", "zh": "上傳檔案中"});

        // Upload new document in assets collection
        const [docRef, initAsset] = await createAssetDocument(VaporAPI.assetsRef, permissions);

        // Upload file to storage with name as document id
        const storageRef = VaporAPI.storageRef
        const fileRef = ref(storageRef, docRef.id);
        await uploadAsset(tasks, fileRef, file, progressCallback);

        // Wait for processing if needed
        if (waitForReady) {
            // Listen for changes on asset document, and call callback function whenever there are any changes
            return (await asyncWaitForReady(tasks, docRef, progressCallback)).id
        } else {
            return initAsset.id;
        }
    }

    static async createAsset(file: File, permissions: Permissions): Promise<AssetID> {
        return await VaporAPI.createAssetWithProgress(file, permissions);     
    }

    static async readAsset(id: AssetID): Promise<FetchedAsset> {
        // Get asset document snapshot
        const docRef = doc(VaporAPI.assetsRef, id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            const snapshotData = snapshot.data()
            const raw: AssetDoc = {
                id: snapshot.id,
                data: (snapshotData as AssetDocData)
            }
            const decoded: Asset = VaporAPI.decodeAsset(raw)
            const roled: FetchedAsset = rolify(decoded) as FetchedAsset // Casting needed because of dependent types
            return roled // TODO: seperate this logic into a reusable function
        } else {
            throw new Error("")
        }
    }

    static async deleteAsset(id: string): Promise<void> {
        // Delete asset document
        const docRef = doc(VaporAPI.assetsRef, id);
        await deleteDoc(docRef);
    }
    
}

function asyncWaitForReady(tasks: TaskSequence, docRef: DocumentReference<DocumentData>, progressCallback?: TaskProgressCallback) {
    return new Promise((resolve: (asset: Asset) => void, reject) => {
        const doneCallback = (asset: Asset) => {
            resolve(asset);
        };
        try {
            requestWaitForReady(tasks, doneCallback, docRef, progressCallback);
        } catch (error) {
            reject(error);
        }
    });
}

function requestWaitForReady(tasks: TaskSequence, doneCallback: (asset: Asset) => void, docRef: DocumentReference<DocumentData>, progressCallback?: TaskProgressCallback) {
    let unsub: Unsubscribe;
    const changeCb = (asset: Asset) => {
        if (!(asset.metadata.status.pending)) { // Update await processing task
            tasks[1].progress = 1;
        }
        tasks[2].progress = asset.metadata.status.processedProgress; // Update processing task
        if (asset.metadata.status.processed) { // Force update processing task to 1 if finished
            tasks[2].progress = 1;
        }
        // Todo: Add progress update upload to cdn task
        if (asset.metadata.status.ready) { // Force update upload to cdn task to 1 if finished
            // Final stage is done
            tasks[3].progress = 1;
            unsub();
            doneCallback(asset);
        }
        if (progressCallback) {
            progressCallback(tasks);
        }
    };
    unsub = subDocData(docRef, changeCb);
}

async function uploadAsset(tasks: TaskSequence, fileRef, file: File, progressCallback: TaskProgressCallback | undefined) {
    let doneUpload;
    const upload = new Promise((resolve, reject) => {
        doneUpload = resolve;
    });

    const onFinishUpload = () => {
        // Upload finished
        tasks[0].progress = 1;
        doneUpload();
    };

    uploadFileWithProgress(fileRef, file, tasks, onFinishUpload, progressCallback);
    await upload;
}

function uploadFileWithProgress(fileRef, file: File, tasks: TaskSequence, onFinishUpload: () => void, progressChangeCallback?: TaskProgressCallback) {
    const uploadTask = uploadBytesResumable(fileRef, file);
    uploadTask.on("state_changed", (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        tasks[0].progress = progress;
        if (progressChangeCallback !== undefined) {
            progressChangeCallback(tasks)
        }
    }, (error) => {
        throw error;
    }, onFinishUpload);
}

async function createAssetDocument(assetsRef:CollectionReference<DocumentData>, permissions: Permissions | undefined): Promise<[DocumentReference<DocumentData>, Asset]> {
    const uid = (auth as Auth)?.currentUser?.uid;
    if (uid === undefined || uid === null) {
        throw new Error("Not logged in");
    }
    const actualPermissions = permissions || {
        owner: uid
    };
    const placeholderData = Defaults.fillPartials(Defaults.defaultAsset, {
        metadata: {
            createdAt: new Date().toISOString(),
            permissions: actualPermissions
        }
    });
    const newDoc = await addDoc(assetsRef, placeholderData);
    return [newDoc, placeholderData];
}