import { createContext } from "react";
import { Post } from "../../../api/types/Post";
import { Instance } from "../../../api/utility_types";
import { Roled } from "../../api_client/types/Role";

export const ContentContext = createContext<Instance<Roled<Post>>[]>([]);

function concatenatePosts(...postArrays) {
    // Concatenates all posts from all post arrays, but prevent duplicates by checking post.id
    // If any postArrays are null or undefined, return null
    if (postArrays.some(postArray => postArray === null || postArray === undefined)) {
        return null;
    }
    const allPosts = postArrays.reduce((acc, curr) => {
        return acc.concat(curr.filter((post) => {
            return !acc.some((accPost) => {
                return accPost.id === post.id;
            });
        }));
    }, []);
    return allPosts;
}

function mapPostRole(array, role) {
    if (array === null || array === undefined) {
        return null;
    } else {
        return array.map((post) => ({...post, role}));
    }
}

export const ContentProvider = ({children}) => {
    const allPosts = concatenatePosts(ownerPosts, editorPosts, viewerPosts, publicPosts);
    // 
    return (
        <ContentContext.Provider value={allPosts}>
            {children}
        </ContentContext.Provider>
    )
}