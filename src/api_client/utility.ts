import { Timestamp } from "firebase/firestore";
import { Post } from "../../api/types/Post";
import { PostDocData } from "./types/PostDocData";

export function naiveExport(post: Post): PostDocData {
    return {
        title: post.data.title,
        description: post.data.description,
        configuration: post.data.configuration,
        sceneChildren: post.data.sceneChildren,
        assets: post.data.assets,
        createdAt: Timestamp.fromDate(new Date(post.metadata.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(post.metadata.updatedAt)),
        owner: post.metadata.permissions.owner,
        editors: post.metadata.permissions.editors,
        viewers: post.metadata.permissions.viewers,
        public: post.metadata.permissions.public
    }
}