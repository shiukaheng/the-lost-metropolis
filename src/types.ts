// Post subscriptions

export type Unsubscriber = () => void;
export type SubscriberCallback = (data: any) => void;
export type SubscriptionProvider = (callback: SubscriberCallback) => Unsubscriber

// Posts

export type Language = "en" | "zh"

export type MultiLangString = {
    [key in Language]: string
}

export type Role = "owner" | "editor" | "viewer" | "public"

export type Post = {
    createdAt: string;
    updatedAt: string;
    title: MultiLangString;
    description: MultiLangString;
    data: object;
    viewers: string[];
    editors: string[];
    owner: string;
    public: boolean;
    role?: Role;
}

export type Asset = {
    createdAt: string;
    name: string;
    sourceAssetType: string;
    targetAssetType: string;
    assetData: object;
    uploaded: boolean; // Marked when uploaded to firebase by client
    pending: boolean; // Marked as true initially, update to false when cloud function recognizes uploaded asset
    processedProgress: number; // 0 to 1, updated by cloud function
    processed: boolean; // Marked as true when all processing completed
    viewers: string[]; // Note permission controls are disabled for now, all assets will be publically viewable
    editors: string[];
    owner: string;
    public: boolean;
}

export type RawAssetDocument = {
    createdAt: any;
    name: string;
    sourceAssetType: string;
    targetAssetType: string;
    assetData: object;
    uploaded: boolean;
    pending: boolean;
    processedProgress: number;
    processed: boolean;
    viewers: string[];
    editors: string[];
    owner: string;
    public: boolean;
}

