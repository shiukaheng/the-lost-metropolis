import { createContext } from "react";
import { subscribeToEditablePosts, subscribeToPosts } from "../../api";
import { useSubscription } from "../../utilities";

export const ContentContext = createContext({
    posts: [],
    editablePosts: [],
});

export const ContentProvider = ({children}) => {
    const posts = useSubscription(subscribeToPosts, false, "posts");
    const editablePosts = useSubscription(subscribeToEditablePosts, true, "editablePosts");
    // console.log("Content updated:", posts, editablePosts)
    return (
        <ContentContext.Provider value={{ posts, editablePosts }}>
            {children}
        </ContentContext.Provider>
    )
}