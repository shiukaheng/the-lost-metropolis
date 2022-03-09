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
    createdAt: any;
    updatedAt: any;
    title: MultiLangString;
    description: MultiLangString;
    data: object;
    viewers: string[];
    editors: string[];
    owner: string;
    public: boolean;
    role?: Role;
}

