import { CollectionReference, onSnapshot, query, QueryConstraint, Timestamp, Unsubscribe } from "firebase/firestore";
import { Post } from "../../api/types/Post";
import { PostDocData } from "./types/PostDocData";
import { Role, Roled } from "./types/Role";
import { Instance } from "../../api/utility_types";
import { instance, uninstance } from "../../api/utilities";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from '../firebase-config'

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

export function setRole<T>(data: T, role: Role): Roled<T> {
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

type RoleMap = Map<Role, Array<QueryConstraint>>;

/**
 * Concats all posts from all post arrays, but prevent duplicates by checking post.id, leaving the role of the first post
 * @param roled an array of arrays of posts, each array is a different role
 * @returns an array of posts, with the role of the first post in the array
 */
function concatenate<ElemType>(...roled: Array<Array<Instance<ElemType>> | null>): Array<Instance<ElemType>> | null {
    // Concatenates all posts from all post arrays, but prevent duplicates by checking post.id
    // If any postArrays are null or undefined, return null
    const allPosts = roled.reduce((acc, curr) => {
        if (curr === null || curr === undefined || acc === null || acc === undefined ) {
            return null;
        }
        return acc.concat(curr.filter((post) => {
            return !acc.some((accPost) => {
                return accPost.id === post.id;
            });
        }));
    }, []); // If duplicates exist, only the first post with that id will be included
    return allPosts;
}

/**
 * Maps a role to an array of posts
 * @param array an array of posts
 * @param role the role to map
 * @returns an array of posts with the given role
 */
function mapRole<T>(array:Array<Instance<T>>, role: Role): Array<Instance<Roled<T>>> {
    return array.map((instancePost) => {
        const [post, id] = uninstance(instancePost);
        return instance(setRole(post, role), id)
    });
}

function subToRefWithRole<T>(ref:CollectionReference, queryRoleMap:RoleMap, decoder:(any)=>T, callback:(posts: Array<Instance<Roled<T>>> | null)=>void): () => void {
    const unsubscribers: Unsubscribe[] = []
    const queryResultMap: Map<string, Array<Instance<T>> | null> = new Map();
    let builtResult: Array<Instance<Roled<T>>> | null = null;
    const buildResults = () => {
        const resultsToCombine: Array<Array<Instance<Roled<T>>> | null> = [];
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
        const unsub = onSnapshot(queryRef, (snapshot) => {
            const decodedPosts: Array<Instance<T>> = []
            snapshot.docs.forEach(doc => {
                try {
                    const data = decoder(doc.data())
                    decodedPosts.push(instance(data, doc.id))
                } catch (e) {
                    console.warn("Failed to decode post, skipping", doc.data(), e);
                }
            })
            queryResultMap.set(role, decodedPosts);
            buildResults()
            callback(builtResult);
        })
        unsubscribers.push(unsub);
    })
    return ()=>{
        unsubscribers.forEach(f => f())
    }
}

/**
 * Generic function to subscribe to a collection in which its schema fits Instance<T>, for which we can determine the role for using user supplied logic
 * @param ref the reference to the collection
 * @param genQueryRoleMap a function that takes a user and returns a map that maps roles to list of query constraints
 * @param decoder a function that takes a document and returns an instance of T
 * @param callback a function that takes an array of Instance<Roled<T>>
 * @returns a function that unsubscribes from the subscription
 */
export function subToRefWithRoleAuthSensitive<T>(
    ref:CollectionReference, genQueryRoleMap: (user: User | null)=>RoleMap, 
    decoder:(any)=>T, 
    callback:(posts: Array<Instance<Roled<T>>> | null)=>void): () => void {
    let unsub: () => void | null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
        unsub && unsub();
        unsub = subToRefWithRole(ref, genQueryRoleMap(user), decoder, callback);
    })
    return ()=>{
        unsubAuth();
        unsub && unsub();
    }
}