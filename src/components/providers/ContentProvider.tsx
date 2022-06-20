import { createContext, useEffect, useState } from "react";
import { Post } from "../../../api/types/Post";
import { Instance } from "../../../api/utility_types";
import { Roled } from "../../../api/implementation_types/Role";
import VaporAPI from "../../api_client/api";

export const ContentContext = createContext<Instance<Roled<Post>>[] | null>(null);

// TODO: Make hide posts better (a.k.a. not included in the query to start with)
// We will need to the query for subscription, and change the permissions to disallow querying for unlisted posts
// Finally, we need to edit the View component so that it will try to fetch a post ID if its not provided in content context
// Or.. maybe keep it as is and have logged in people who have permissions to see the post
export function hidePosts(posts: Instance<Roled<Post>>[] | null) {
    if (posts === null) {
        return null;
    } else {
        return posts.filter(post => post.data.listed === true);
    }
}

export const ContentProvider = ({children}) => {
    const [content, setContent] = useState<Instance<Roled<Post>>[] | null>(null);
    useEffect(()=>{
        const unsub = VaporAPI.subscribePosts(
            // TODO: Make this backend logic
            (postInstances) => {
                setContent(postInstances.sort(
                    (a, b) => {
                        return new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime();
                    }
                ));
            }
        )
        return () => {
            unsub();
        }
    }, [])
    return (
        <ContentContext.Provider value={content}>
            {children}
        </ContentContext.Provider>
    )
}