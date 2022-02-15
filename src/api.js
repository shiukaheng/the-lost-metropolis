import { addDoc, collection, deleteDoc, onSnapshot, Timestamp, updateDoc, doc } from "firebase/firestore";
import { auth, db, storage } from "./firebase-config";
import { signOut } from "firebase/auth";
import { collection, query, where } from "firebase/firestore";
import { createEmptyMultilangString } from "./utilities";

// Functions to further abstract API calls to firebase for easier understanding / maintenance / migration

// General use

// - Subscribe to all posts that are published -> Subscribe to query posts collection and return all posts with published = true
// This will call a callback with a list of posts in the format from the database whenever there are changes:
// [
//   Document {
//     data: <function>,
//     published: <bool>,
//     createdAt: <str>,
//     updatedAt: <str>,
//     owner: <str>,
//     viewers: <array>,
//     editors: <array>,
//   }
// ]
// Which needs to transformed into the format:
// [
//   {
//     id: <str>, - from document.id
//     title: <str>,
//     description: <str>,
//     data: <str>, - serialized 3D content
//     createdAt: <str>,
//     updatedAt: <str>,
//     owner: <str>,
//     viewers: <array>,
//     editors: <array>,
//   }
// ]

// Given a target object, remove all properties that are not in the reference object
function filterObjectStructure(target, reference) {
    const filtered = {};
    for (const key in reference) {
        if (target[key] !== undefined) {
            filtered[key] = target[key];
        }
    }
    return filtered;
}

// Transform post from firebase format to platform agnostic format
function transformPost(doc) {
    const id = doc.id;
    const data = doc.data();
    return {
        id: id,
        title: data.title,
        description: data.description,
        data: data.data,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
        owner: data.owner,
        viewers: data.viewers,
        editors: data.editors,
        published: data.published,
    };
}

// Transform post from platform agnostic format to firebase format, filters out all properties that are not in the reference object for partial updates
function inverseTransformPost(obj) {
    return filterObjectStructure({
        title: obj.title,
        description: obj.description,
        data: obj.data,
        createdAt: Timestamp.fromDate(new Date(obj.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(obj.updatedAt)),
        owner: obj.owner,   
        viewers: obj.viewers,
        editors: obj.editors,
        published: obj.published,
    }, obj);
}

export const subscribeToPosts = (callback) => {
    const postsRef = collection(db, "posts")
    const queryRef = query(postsRef, where("published", "==", true))
    const unsub = onSnapshot(queryRef, (docsRef) => {
        callback(docsRef.docs.map(transformPost))
    })
    return unsub
}

// - Check if is logged in
export const isLoggedIn = () => {
    return auth.currentUser !== null;
}

export const logOut = async () => {
    await signOut(auth)
}

// Admin / creating data

// Subscribe to all editable posts -> Subscribe to query posts collection and return all posts where owner = currentUser or readCollaborators contains currentUser
// This will call a callback with a list of posts in the format from the database whenever there are changes:
// [
//   {
//     id: <str>, - from document.id
//     title: <str>,
//     description: <str>,
//     data: <str>, - serialized 3D content
//     createdAt: <str>,
//     updatedAt: <str>,
//     owner: <str>,
//     viewers: <array>,
//     editors: <array>,
//   }
// ]
export const subscribeToEditablePosts = (callback) => {
    const postsRef = collection(db, "posts")
    const queryRef = query(postsRef, where("owner", "==", auth.currentUser.uid, "OR", "editors", "array-contains", auth.currentUser.uid))
    const unsub = onSnapshot(queryRef, (docsRef) => {
        callback(docsRef.docs.map(transformPost))
    })
    return unsub
}

// // - Create post -> create document in posts collection, returns document id
// export const createPost = async (postObj) => {
//     const postsRef = collection(db, "posts")
//     const docRef = await addDoc(postsRef, {...inverseTransformPost(postObj), owner: auth.currentUser.uid}) // https://firebase.google.com/docs/firestore/manage-data/add-data#add_a_document
//     return docRef.id
// }

// - Update post -> update document in posts collection
export const updatePost = async (id, content) => {
    const postRef = doc(db, "posts", id)
    await updateDoc(postRef, inverseTransformPost(content)) // https://firebase.google.com/docs/firestore/manage-data/update-data#update_a_document
}

export const createPost = async ({title=createEmptyMultilangString(), description=createEmptyMultilangString(), data="", viewers=[], editors=[], published=false}={}) => { // Todo: dynamically create template data
    const postsRef = collection(db, "posts")
    const created =  new Date().toISOString()
    const object = {
        title: title,
        description: description,
        data: data,
        createdAt: created,
        updatedAt: created,
        owner: auth.currentUser.uid,
        viewers: viewers,
        editors: editors,
        published: published,
    }
    console.log(inverseTransformPost(object))
    const docRef = await addDoc(postsRef, inverseTransformPost(object))
    return docRef.id
}

// - Delete post -> delete document in posts collection
export const deletePost = async (id) => {
    const postRef = doc(db, "posts", id)
    await deleteDoc(postRef) // https://firebase.google.com/docs/firestore/manage-data/delete-data#delete_a_document
}

// - Upload asset -> Creates entry in assets collection and uploads file to storage, marking ready as true
// - Upload packaged asset -> Creates entry in assets collection, and uploads zip file to storage, marking ready as false. Relies on cloud function to unpack files to folder and mark ready as true. Promised based and resolve only when ready is true.
// - Resolve asset -> Resolves the relative paths from the resources object from the database, to get absolute path for the storage bucket. Returns asset object in the format:
// {
//   id: <str>,
//   name: <str>,
//   type: <str>,
//   metadata: <str>,
//   resolvedResources: <array>,
//   ready: <bool>,
//   createdAt: <str>,
//   updatedAt: <str>,
//   owner: <str>,
//   readCollaborators: <array>,
//   writeCollaborators: <array>,
// }
// - Delete asset -> Deletes asset from assets collection and deletes file from storage
// - Update asset -> Updates asset in assets collection