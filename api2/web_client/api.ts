import { RecursivePartial } from "../utility_types";
import { Instance, InstanceID, Post } from "../types";
import { PostDocData } from "./types";

export default class VaporAPI {

    // Post CRUD
    static async createPost(post: Post): Promise<InstanceID> {
        // returns promise of post ID
    }
    static async readPost(id: InstanceID): Promise<Instance<Post>> {
        // returns promise of post
    }
    static async updatePost(postInstance: Instance<Post>): Promise<void> {
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
    static subscribePosts(getPostCallback): () => void {
        // returns unsubscriber
    }
    static exportPost(post: RecursivePartial<Post>, fillDefaults=false): Partial<PostDocData> {
        // returns raw post
    }
    static importPost(rawPost:PostDocData): Post {
        // returns post
    }
    static isValidPost(partialPost: RecursivePartial<Post>): partialPost is Post {
        // returns bool
    }
}

