// Note: The types in this file are used to define the types that are exposed by the API.
// So far it has only been implemented on the client side, but its not limited to that.
// The API abstracts away the implementation details of the API for easier maintenance and migration down the road.

export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

export interface JSONObject {
    [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> { }

export type Language = "en" | "zh"

export type MultiLangString = {
    [key in Language]: string
}

export type UserID = string

export type CameraProps = {
    fov: number;
    position: [number, number, number];
    rotation: [number, number, number];
}

export interface ComponentBaseProps {
    position?: [number, number, number],
    rotation?: [number, number, number],
    scale?: [number, number, number],
    name?: string,
    objectID: string,
    [key: string]: any
}

export type SceneComponent = {
    componentType: string;
    props: ComponentBaseProps;
}

export type SceneConfiguration = {
    defaultCameraProps: CameraProps,
    potreePointBudget: number,
}

export type PostData = {
    configuration: SceneConfiguration;
    sceneChildren: SceneComponent[]
}

export type Role = "owner" | "editor" | "viewer" | "public"

export type Permissions = {
    owner: UserID,
    viewers: UserID[],
    editors: UserID[],
    public: boolean
}

export type Post = {
    id: PostID,
    title: MultiLangString,
    description: MultiLangString,
    data: PostData,
    metadata: {
        createdAt: string,
        updatedAt: string,
        permissions: Permissions,
        assets: AssetID[]
    }
}

export type SubscriberCallback<T> = (data: T) => void

export type AssetStatusBase = {
    uploaded: boolean,
    processedProgress: number,
    processed: boolean,
    ready: boolean
}

export type InitAssetStatus = AssetStatusBase & {pending: false}
export type UnintAssetStatus = AssetStatusBase & {pending: true}
export type AssetStatus = InitAssetStatus | UnintAssetStatus

export function isAssetStatusInit(assetStatus: AssetStatus): assetStatus is InitAssetStatus {
    return assetStatus.pending === false;
}

export type Asset = {
    id: AssetID,
    name: string,
    sourceAssetType: string,
    targetAssetType: string,
    data: JSONObject,
    metadata: {
        createdAt: string,
        permissions: Permissions,
        status: AssetStatus,
    }
}

export type PostID = string

export type AssetID = string

export type Task = {
    "name": MultiLangString,
    "progress": number,
}

export type TaskSequence = Array<Task>

export type TaskProgressCallback = (taskSequence: TaskSequence) => void

export type InputPost = RecursivePartial<WithOptionalRole<Post>> // Lax version of Post with optional role

export type IdentifyingPost = InputPost & {id: PostID}

export type FetchedPost = WithRole<Post> // Post fetched from the server which interprets user roles

export type InputAsset = RecursivePartial<WithOptionalRole<Asset>> // Lax version of Asset with optional role

export type FetchedAsset = WithRole<Asset> // Asset fetched from the server which interprets user roles

/**
 * VaporAPI is the main API class. It is used to provide a consistent API for interacting with the database and backend. Makes it easy to migrate to a new backend.
 */
export abstract class AbstractVaporAPI { // API 2.0
    // Translate between API and database

    /**
     * Decodes a post from the database format to the API format.
     * @param databasePost The post in the database format.
     */
    static decodePost<RawPostType>(databasePost: RawPostType): Post {
        throw("Not implemented")
    }

    /**
     * Encodes a post from the API format to the database format.
     * @param post The post in the API format.
     */
    static encodePost<RawPostType>(post: WithOptionalRole<Post>): RawPostType {
        throw("Not implemented")
    }

    /**
     * Decodes an asset from the database format to the API format.
     * @param databaseAsset The asset in the database format.
     */
    static decodeAsset<RawAssetType>(databaseAsset: RawAssetType): Asset {
        throw("Not implemented")
    }

    /**
     * Encodes an asset from the API format to the database format.
     * @param asset The asset in the API format.
     */
    static encodeAsset<RawAssetType>(asset: WithOptionalRole<Asset>): RawAssetType {
        throw("Not implemented")
    }

    // Post CRUD

    /**
     * Subscribes a callback function to a list of posts with a role property appended representing user permissions.
     * @param callback The callback function.
     */
    static subscribePosts(callback: SubscriberCallback<FetchedPost[]>): ()=>void {
        throw("Not implemented")
    }

    /**
     * Creates a post given content and permissions, returns post or throws error.
     * @param post The post in the API format.
     */
    static async createPost(post: IdentifyingPost): Promise<void> {
        throw("Not implemented")
    }

    /**
     * Reads a post given post id - should not be required as posts are already subscribed to all posts available to the current user.
     * @param id The post id.
     */
    static async readPost(id: PostID): Promise<FetchedPost> {
        throw("Not implemented")
    }

    /**
     * Updates post given a {@link Post}.
     * @param post The post in the API format.
     */
    static async updatePost(post: IdentifyingPost): Promise<void> {
        throw("Not implemented")
    }

    /**
     * Deletes post given a post id.
     * @param id The post id.
     */
    static async deletePost(id: PostID): Promise<void> {
        throw("Not implemented")
    }

    // Asset CRUD - No update as assets are immutable

    /**
     * Subscribes a callback function to a list of assets that the current user is allowed to see / edit.
     * @param callback The callback function.
     */
    static subscribeAssets(callback: SubscriberCallback<FetchedAsset[]>): ()=>void {
        throw("Not implemented")
    }

    /**
     * Lists all assets associated with a post.
     * @param postID The post id.
     */
    static async listPostAssets(postID: PostID): Promise<FetchedAsset[]> {
        throw("Not implemented")
    }

    /**
     * Creates an asset given a file, viewers and editors, and whether it is public or not.
     * @param file The file.
     * @param permission The permission.
     */
    static async createAsset(file: File, permission: Permissions): Promise<PostID> {
        throw("Not implemented")
    }

    /**
     * Reads an asset given an asset id.
     * @param id The asset id.
     */
    static async readAsset(id: AssetID): Promise<FetchedAsset> {
        throw("Not implemented")
    }

    /**
     * Deletes an asset given an asset id.
     * @param id The asset id.
     */
    static async deleteAsset(id: AssetID): Promise<void> {
        throw("Not implemented")
    }
}

export type Maybe<T> = T | null | undefined;
export type WithID<T> = T & {id: string};
export type WithRole<T> = T & {role: Role};
export type WithOptionalRole<T> = T & {role?: Role};

export type RecursivePartial<T> = {
    [P in keyof T]?:
      T[P] extends (infer U)[] ? RecursivePartial<U>[] :
      T[P] extends object ? RecursivePartial<T[P]> :
      T[P];
};

// /**
//  * A partial part of a post that has the most essential information required to create a post
//  */
// export type PartialPost = Partial<Post> & { id: string; metadata: { permissions: { owner: string; }; }; }