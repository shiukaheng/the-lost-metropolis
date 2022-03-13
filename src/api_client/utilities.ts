import { WithOptionalRole, InputPost } from './../../api/types';
import { Asset, TaskSequence } from '../../api/types';
import { MultiLangString } from './../types';
import { VaporAPI } from './api';
import { cloneDeep, merge } from 'lodash';
import { Post, Role } from '../../api/types';
import { CollectionReference, deleteDoc, doc, DocumentData, DocumentReference, getDoc, onSnapshot, query, QueryConstraint, setDoc, Timestamp, Unsubscribe, updateDoc } from "firebase/firestore";
import { Maybe, WithID, WithRole } from "../../api/types";
import { auth } from "../firebase-config";
import { onAuthStateChanged, User as FBUser } from 'firebase/auth';
import Defaults from '../../api/defaults';
import { WrappedSnap } from '../../api/implementation_types';

function mapRole<T>(array:Array<T>, role: Role): Array<WithRole<T>> {
    return array.map((post) => ({...post, role}));
}

function concatenate<ElemType>(...roled: Array<Maybe<Array<WithID<ElemType>>>>): Maybe<Array<WithID<ElemType>>> {
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

type ColRef = CollectionReference<DocumentData>;
type RoleMap = Map<Role, Array<QueryConstraint>>;

// Todo replace object with map to maintain order
export function subToRefWithRole<ElemType>(ref:ColRef, queryRoleMap:RoleMap, decoder:(any)=>WithID<ElemType>, callback:(posts: Maybe<Array<WithID<WithRole<ElemType>>>>)=>void): CompositeUnsubscribe {
    const unsubscribers: Unsubscribe[] = []
    const queryResultMap: Map<string, Maybe<Array<WithID<ElemType>>>> = new Map();
    let builtResult: Maybe<Array<WithID<WithRole<ElemType>>>> = null;
    const buildResults = () => {
        const resultsToCombine: Array<Maybe<Array<WithID<WithRole<ElemType>>>>> = [];
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

export function subToRefWithRoleAuthSensitive<ElemType>(ref:ColRef, genQueryRoleMap: (user: Maybe<FBUser>)=>RoleMap, decoder:(any)=>WithID<ElemType>, callback:(posts: Maybe<Array<WithID<WithRole<ElemType>>>>)=>void): CompositeUnsubscribe {
    let unsub: Maybe<CompositeUnsubscribe>;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
        unsub && unsub();
        unsub = subToRefWithRole(ref, genQueryRoleMap(user), decoder, callback);
    })
    return ()=>{
        unsubAuth();
        unsub && unsub();
    }
}

export function createPostObject(partialPost: InputPost): Post {
    // Check if id or owner fields are set, if so, warn user that they will be overwritten
    if (partialPost.id || (partialPost.id !== "")) {
        console.warn("Post id will be overwritten");
    }
    if (partialPost?.metadata?.permissions?.owner) {
        console.warn("Post owner will be overwritten");
    }
    const base = cloneDeep(Defaults.defaultPost);
    const timeNow_ISO = new Date().toISOString();
    const post: Post = merge(base, partialPost, {
        id: "",
        metadata: {
            permissions: {
                owner: auth.currentUser?.uid,
            },
            createdAt: timeNow_ISO,
            updatedAt: timeNow_ISO,
        }
    });
    return post;
}

type CompositeUnsubscribe = ()=>void;

export async function readDocDataFromRef(ref: DocumentReference): Promise<any> {
    const docSnap = await getDoc(ref);
    return docSnap.data();
};

export async function readPostFromRef(ref: DocumentReference): Promise<Post> {
    const data = await readDocDataFromRef(ref);
    const decoded = VaporAPI.decodePost({
        id: ref.id,
        data
    });
    return decoded;
}

export function createTaskSequence(...names: MultiLangString[]): TaskSequence {
    return names.map((name)=>(
        {
            name,
            progress: 0
        }
    ))
}

export function updateTaskSequence(taskSequence: TaskSequence, index: number, progress: number, reuse=true): TaskSequence {
    if (reuse) {
        taskSequence[index].progress = progress;
        return taskSequence;
    } else {
        const newSequence = cloneDeep(taskSequence);
        newSequence[index].progress = progress;
        return newSequence;
    }
}

export async function updateEncodedDoc(collection:CollectionReference, encDoc:WrappedSnap<any>): Promise<void> {
    const ref = doc(collection, encDoc.id);
    await updateDoc(ref, encDoc.data);
}

export async function setEncodedDoc(collection:CollectionReference, encDoc:WrappedSnap<any>): Promise<void> {
    const ref = doc(collection, encDoc.id);
    await setDoc(ref, encDoc.data);
}

export async function deleteEncodedDoc(collection:CollectionReference, encDoc:WrappedSnap<any>): Promise<void> {
    const ref = doc(collection, encDoc.id);
    await deleteDoc(ref);
}

export type Roleable = Post | Asset

export function interpretRole(obj: Roleable): Role {
    if (obj.metadata.permissions.owner === auth.currentUser?.uid) {
        return "owner";
    } else if (obj.metadata.permissions.editors.includes(auth.currentUser?.uid)) {
        return "editor";
    } else if (obj.metadata.permissions.viewers.includes(auth.currentUser?.uid)) {
        return "viewer";
    } else if (obj.metadata.permissions.public === true) {
        return "public"
    } else {
        throw new Error("Unable to determine role")
    }
}

export function rolify(obj: Roleable): WithRole<Roleable> {
    const clone: WithOptionalRole<Roleable> = cloneDeep(obj)
    clone.role = interpretRole(obj)
    return (clone as WithRole<Roleable>)
}