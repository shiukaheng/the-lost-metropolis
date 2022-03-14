import { RecursivePartial } from "../utility_types";
import { Instance, InstanceID, Post, isValidPost, postSchema } from "../types";
import { PostDocData } from "./types";

export default class VaporAPI {

    // Post CRUD
    static async createPost(post: Post): Promise<InstanceID> {
        // returns promise of post ID
    }
    static async readPost(id: InstanceID): Promise<Instance<Post>> {
        // returns promise of post
    }
    static async updatePost(postInstance: Instance<Post>, whitelist?: (keyof PostDocData)[], blacklist?: (keyof PostDocData)[]): Promise<void> {
        // returns promise of void
    }
    static async deletePost(id: InstanceID): Promise<void> {
        // returns promise of void
    }

    // Asset CRUD - Not really crud though. Only supports upload and delete.
    static async uploadAsset(postID: InstanceID, file: File): Promise<InstanceID> {
        // returns promise of asset ID
    }
    static async deleteAsset(postID: InstanceID, assetID: InstanceID): Promise<void> {
        // returns promise void
    }

    // Utilities
    static subscribePosts(getPostCallback: (postInstances: Array<Instance<Post>>) => void): () => void {
        // returns unsubscriber
    }
    static exportPost(post: RecursivePartial<Post>, cast=false): PostDocData { // Always return a full PostDocData, for partial updates, use PostDocData mask
        if (isValidPost(post)) {
            return {
                title: post.data.title,
                description: post.data.description,
                data: post.data,
                assets: [],
                createdAt: new Timestamp,
                updatedAt: new Timestamp,
                owner: "",
                editors: [],
                viewers: [],
                public: false
            }
        }
    }
    static importPost(rawPost:PostDocData): Post {
        // returns post
    }
}

