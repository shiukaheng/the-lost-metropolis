import { addDoc, collection, deleteDoc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore";
import { transform } from "lodash";
import {auth, db, storage} from "./firebase-config";
import { signOut } from "firebase/auth";

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
//     readCollaborators: <array>,
//     writeCollaborators: <array>,
//   }
// ]
// Which needs to transformed into the format:
// [
//   {
//     id: <str>, - from document.id
//     title: <str>,
//     description: <str>,
//     content: <str>, - serialized 3D content
//     createdAt: <str>,
//     updatedAt: <str>,
//     owner: <str>,
//     readCollaborators: <array>,
//     writeCollaborators: <array>,
//   }
// ]
function transformPost(doc) {
    const { data, id } = doc;
    return {
        id: id,
        title: data.title,
        description: data.description,
        content: data.content,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        owner: data.owner,
        readCollaborators: data.readCollaborators,
        writeCollaborators: data.writeCollaborators,
    };
}

export const subscribeToPosts = (callback) => {
    const postsRef = collection(db, "posts")
    const query = query(postsRef, where("published", "==", true))
    const unsub = onSnapshot(query, (docs) => {
        callback(docs.map(transformPost))
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

// Admin / creating content

// - Create post -> create document in posts collection, returns document id
export const createPost = async (title, description, content, readCollaborators, writeCollaborators) => {
    const postsRef = collection(db, "posts")
    const post = {
        title: title,
        description: description,
        content: content,
        createdAt: Timestamp(),
        updatedAt: Timestamp(),
        owner: auth.currentUser.uid,
        readCollaborators: readCollaborators,
        writeCollaborators: writeCollaborators,
    }
    const docRef = await addDoc(postsRef, post) // https://firebase.google.com/docs/firestore/manage-data/add-data#add_a_document
    return docRef.id
}
// - Update post -> update document in posts collection
export const updatePost = async (id, title, description, content, readCollaborators, writeCollaborators) => {
    const postRef = doc(db, "posts", id)
    const post = {
        title: title,
        description: description,
        content: content,
        updatedAt: Timestamp(),
        readCollaborators: readCollaborators,
        writeCollaborators: writeCollaborators,
    }
    await updateDoc(postRef, post) // https://firebase.google.com/docs/firestore/manage-data/update-data#update_a_document
}

// - Delete post -> delete document in posts collection
export const deletePost = async (id) => {
    const postRef = collection(db, "posts", id)
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