import { LRUCache, PriorityQueue } from "3d-tiles-renderer";
import { createContext, MutableRefObject, useRef } from "react";

type TilesContextType = {
    lruCacheRef: MutableRefObject<LRUCache | null>;
    downloadQueueRef: MutableRefObject<PriorityQueue | null>;
    parseQueueRef: MutableRefObject<PriorityQueue | null>;
    initializedRef: MutableRefObject<boolean>; 
}

export const TilesContext = createContext<null | TilesContextType>(null)

// Optional manager component that allows tiles to share a single LRUCache, download and parse queues
export function TilesManager({children}) {
    const lruCacheRef = useRef<LRUCache>(null);
    const downloadQueueRef = useRef<PriorityQueue>(null);
    const parseQueueRef = useRef<PriorityQueue>(null);
    const initializedRef = useRef<boolean>(false);
    return (
        <TilesContext.Provider value={{
            lruCacheRef,
            downloadQueueRef,
            parseQueueRef,
            initializedRef
        }}>
            {children}
        </TilesContext.Provider>
    )
}