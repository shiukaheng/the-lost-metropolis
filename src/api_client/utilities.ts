import { CollectionReference, getDoc, onSnapshot, query, Timestamp, Unsubscribe } from "firebase/firestore";
import { Post } from "../../api/types/Post";
import { PostDocData } from "./types/PostDocData";
import { addDoc, collection, doc } from "firebase/firestore";
import { Role, Roled } from "./types/Role";
import { Instance } from "../../api/utility_types";

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

export function role<T>(data: T, role: Role): Roled<T> {
    return {
        ...data,
        role
    }
}

export function unrole<T>(data: Roled<T>): T {
    return {
        ...data,
        role: undefined
    }
}

// Todo replace object with map to maintain order
export function subToRefWithRole<ElemType>(ref:CollectionReference, queryRoleMap:RoleMap, decoder:(any)=>Instance<ElemType>, callback:(posts: Array<Instance<Roled<ElemType>>> | null)=>void): () => void {
    const unsubscribers: Unsubscribe[] = []
    const queryResultMap: Map<string, Array<Instance<ElemType>> | null> = new Map();
    let builtResult: Array<Instance<Roled<ElemType>>> | null = null;
    const buildResults = () => {
        const resultsToCombine: Array<Array<Instance<Roled<ElemType>>> | null> = [];
        queryRoleMap.forEach((_, role) => {
            const results = queryResultMap.get(role);
            if (!(results === null || results === undefined)) {
                resultsToCombine.push(mapRole(results, role));
            } else {
                resultsToCombine.push(null);
            }
        });
        if (resultsToCombine.length === 0) {
            builtResult = resultsToCombine[0]; 
        } else {
            builtResult = concatenate(...resultsToCombine);
        }
    }
    queryRoleMap.forEach((constraints, role) => {
        const queryRef = query(ref, ...constraints)
        unsubscribers.push(
            onSnapshot(queryRef, (snapshot) => {
                queryResultMap.set(role, snapshot.docs.map(doc => decoder(doc.data())));
                buildResults()
                callback(builtResult);
            })
        )
    })
    return ()=>{
        unsubscribers.forEach(f => f())
    }
}