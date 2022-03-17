import { createContext, useEffect, useState } from "react";
import { Post } from "../../../api/types/Post";
import { Instance } from "../../../api/utility_types";
import { Roled } from "../../../api/implementation_types/Role";
import VaporAPI from "../../api_client/api";

export const ContentContext = createContext<Instance<Roled<Post>>[] | null>(null);

export const ContentProvider = ({children}) => {
    const [content, setContent] = useState<Instance<Roled<Post>>[] | null>(null);
    useEffect(()=>{
        const unsub = VaporAPI.subscribePosts(
            (postInstances) => {
                setContent(postInstances);
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