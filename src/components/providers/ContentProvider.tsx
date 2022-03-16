import { createContext, useEffect, useState } from "react";
import { Post } from "../../../api/types/Post";
import { Instance } from "../../../api/utility_types";
import { editorPostProvider, ownerPostProvider, publicPostProvider, viewerPostProvider } from "../../api";
import VaporAPI from "../../api_client/api";
import { Roled } from "../../api_client/types/Role";
import { useSubscription } from "../../utilities";

export const ContentContext = createContext([]);

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
    const [posts, setPosts] = useState<Instance<Roled<Post>>[]>(null);
    useEffect(()=>{
        VaporAPI.subscribePosts((posts) => {
            setPosts(posts);
            // console.log(posts)
        })
    }, [])
    // 
    return (
        <ContentContext.Provider value={posts}>
            {children}
        </ContentContext.Provider>
    )
}