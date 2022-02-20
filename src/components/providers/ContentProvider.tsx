import { createContext } from "react";
import { editorPostProvider, ownerPostProvider, publicPostProvider, viewerPostProvider } from "../../api";
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
    const ownerPosts = mapPostRole(useSubscription(ownerPostProvider, true, "ownerPosts"), "owner");
    const editorPosts = mapPostRole(useSubscription(editorPostProvider, true, "editorPosts"), "editor");
    const viewerPosts = mapPostRole(useSubscription(viewerPostProvider, true, "viewerPosts"), "viewer");
    const publicPosts = mapPostRole(useSubscription(publicPostProvider, false, "publicPosts"), "public");
    const allPosts = concatenatePosts(ownerPosts, editorPosts, viewerPosts, publicPosts);
    return (
        <ContentContext.Provider value={allPosts}>
            {children}
        </ContentContext.Provider>
    )
}