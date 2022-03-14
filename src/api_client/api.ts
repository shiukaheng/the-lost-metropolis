import { Post, postSchema } from '../../api/types/Post';
import { Instance, RecursivePartial } from "../../api/utility_types";
import { addDoc, collection, getDoc, Timestamp } from "firebase/firestore";
import { PostDocData, postDocDataSchema } from './types/PostDocData';
import { naiveExport } from './utility';
import { db, storage } from '../firebase-config'

export default class VaporAPI {

    private static postsRef = collection(db, "posts");
    private static assetsRef = collection(db, "assets");
    private static storageRef = storage;

    // Post CRUD
    static async createPost(post: Post): Promise<string> {
        // returns promise of post ID
        // const docRef = addDoc(VaporAPI.postsRef)
    }
    static async readPost(id: string): Promise<Instance<Post>> {
        // returns promise of post
        throw ("not implemented")
    }
    static async updatePost(postInstance: Instance<Post>, whitelist?: (keyof PostDocData)[], blacklist?: (keyof PostDocData)[]): Promise<void> {
        // returns promise of void
        throw ("not implemented")
    }
    static async deletePost(id: string): Promise<void> {
        // returns promise of void
        throw ("not implemented")
    }

    // Asset CRUD - Not really crud though. Only supports upload and delete.
    static async uploadAsset(postID: string, file: File): Promise<string> {
        // returns promise of asset ID
        throw ("not implemented")
    }
    static async deleteAsset(postID: string, assetID: string): Promise<void> {
        // returns promise void
        throw ("not implemented")
    }

    // Utilities
    static subscribePosts(getPostCallback: (postInstances: Array<Instance<Post>>) => void): () => void {
        // returns unsubscriber
        throw ("not implemented")
    }
    static exportPost(post: RecursivePartial<Post>, cast=false): PostDocData { // Always return a full PostDocData, for partial updates, use PostDocData mask
        if (postSchema.isValidSync(post)) {
            return naiveExport(post)
        } else {
            if (cast) {
                return naiveExport(postSchema.validateSync(post))
            } else {
                throw new Error("Post object is not well formed, yet cast is not enabled")
            }
        }
    }
    static importPost(docData:PostDocData): Post {
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

