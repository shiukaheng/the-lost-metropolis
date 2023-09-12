// import { addDoc, collection, deleteDoc, onSnapshot, Timestamp, updateDoc, doc, query, where } from "firebase/firestore";
// import { auth, db } from "./firebase-config";
// import { signOut } from "firebase/auth";
// import { createEmptyMultilangString } from './utilities';
// import { Post } from "../api/types/Post";

// // Given a target object, remove all properties that are not in the reference object
// function filterObjectStructure(target, reference) {
//     const filtered = {};
//     for (const key in reference) {
//         if (target[key] !== undefined) {
//             filtered[key] = target[key];
//         }
//     }
//     return filtered;
// }

// // Transform post from firebase format to platform agnostic format
// function transformPost(doc) {
//     const id = doc.id;
//     const data = doc.data();
//     return {
//         id: id,
//         title: data.title,
//         description: data.description,
//         data: data.data,
//         createdAt: data.createdAt.toDate().toISOString(),
//         updatedAt: data.updatedAt.toDate().toISOString(),
//         owner: data.owner,
//         viewers: data.viewers,
//         editors: data.editors,
//         public: data.public,
//     };
// }

// // Transform post from platform agnostic format to firebase format, filters out all properties that are not in the reference object for partial updates
// function inverseTransformPost(obj) {
//     return filterObjectStructure({
//         title: obj.title,
//         description: obj.description,
//         data: obj.data,
//         createdAt: Timestamp.fromDate(new Date(obj.createdAt)),
//         updatedAt: Timestamp.fromDate(new Date(obj.updatedAt)),
//         owner: obj.owner,   
//         viewers: obj.viewers,
//         editors: obj.editors,
//         public: obj.public,
//     }, obj);
// }

// function subscribeToQuery(collection, queryConstraints, callback) {
//     const queryRef = query(collection, ...queryConstraints)
//     return onSnapshot(queryRef, callback)
// }

// function subscribeToPostQuery(queryConstraints, callback) {
//     const postsRef = collection(db, "posts")
//     return subscribeToQuery(postsRef, queryConstraints, (docsRef)=>{
//         callback(docsRef.docs.map(transformPost))
//     })
// }

// export const publicPostProvider = (callback) => subscribeToPostQuery([where("public", "==", true)], callback)

// // From this point on all functions are admin only

// // - Check if is logged in
// export const isLoggedIn = () => {
//     return auth.currentUser !== null;
// }

// export const logOut = async () => {
//     await signOut(auth)
// }

// export const ownerPostProvider = (callback) => subscribeToPostQuery([where("owner", "==", auth.currentUser ? auth.currentUser.uid : null)], callback)
// export const editorPostProvider = (callback) => subscribeToPostQuery([where("editors", "array-contains", auth.currentUser ? auth.currentUser.uid : null)], callback)
// export const viewerPostProvider = (callback) => subscribeToPostQuery([where("viewers", "array-contains", auth.currentUser ? auth.currentUser.uid : null)], callback)

// // // - Create post -> create document in posts collection, returns document id

// // - Update post -> update document in posts collection
// export const createPost = async ({title=createEmptyMultilangString(), description=createEmptyMultilangString(), data=null, viewers=[], editors=[], isPublic=false}={}) => { // Todo: dynamically create template data
//     const postsRef = collection(db, "posts")
//     const created =  new Date().toISOString()
//     const object = {
//         title: title,
//         description: description,
//         data: data,
//         createdAt: created,
//         updatedAt: created,
//         owner: auth.currentUser.uid,
//         viewers: viewers,
//         editors: editors,
//         public: isPublic,
//     }
//     // console.log(inverseTransformPost(object))
//     const docRef = await addDoc(postsRef, inverseTransformPost(object))
//     return docRef.id
// }

// export const updatePost = async (id: string, content: Post) => {
//     const postRef = doc(db, "posts", id)
//     await updateDoc(postRef, inverseTransformPost(content)) // https://firebase.google.com/docs/firestore/manage-data/update-data#update_a_document
// }

// // - Delete post -> delete document in posts collection
// export const deletePost = async (id) => {
//     const postRef = doc(db, "posts", id)
//     await deleteDoc(postRef) // https://firebase.google.com/docs/firestore/manage-data/delete-data#delete_a_document
// }