import { addDoc, collection, deleteDoc, onSnapshot, Timestamp, updateDoc, doc, collection, query, where, setDoc } from "firebase/firestore";
import { auth, db, storage } from "./firebase-config";
import { ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { signOut } from "firebase/auth";
import { createEmptyMultilangString } from "./utilities";
import { v4 as uuidv4 } from "uuid";

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

export const createPost = async ({title=createEmptyMultilangString(), description=createEmptyMultilangString(), data=null, viewers=[], editors=[], published=false}={}) => { // Todo: dynamically create template data
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
    // console.log(inverseTransformPost(object))
    const docRef = await addDoc(postsRef, inverseTransformPost(object))
    return docRef.id
}

// - Delete post -> delete document in posts collection
export const deletePost = async (id) => {
    const postRef = doc(db, "posts", id)
    await deleteDoc(postRef) // https://firebase.google.com/docs/firestore/manage-data/delete-data#delete_a_document
}

type Progress = {
    currentStage: string,
    stages: string[],
    currentProgress: number
}

// - Upload asset -> Creates entry in assets collection and uploads zip to storage -> Cloud function gets triggered to unzip files to folder -> Updates document in assets collection
export const uploadAsset = async (file, waitUntilProcessed=true, onProgress=(progress:Progress)=>{}) => {
    const name = uuidv4()
    const stages = waitUntilProcessed ? ["upload", "process"] : ["upload"]
    // Make a reference for the zip file
    const zipRef = ref(storage, `pendingAssets/${name}`)
    // Create entry in assets collection
    await setDoc(doc(db, "assets", name), {
        owner: auth.currentUser.uid,
        createdAt: Timestamp.fromDate(new Date()),
        pending: true, // Means to be picked up by the cloud function
        processed: false, // Means it has been processed by the cloud function
        processedProgress: 0, // Progress of the processing
        metaData: null // This will be filled in by the cloud function
    })
    // Upload zip file to storage
    const uploadTask = uploadBytesResumable(zipRef, file)
    // Wait for upload to finish
    uploadTask.on("state_changed", (snapshot)=>{
        const progress = snapshot.bytesTransferred / snapshot.totalBytes
        onProgress({ // Updating upload progress
            currentStage: "upload",
            stages: stages,
            currentProgress: progress
        })
    }, (error)=>{
        console.warn("Upload unsucessful", error)
    }, async ()=>{
        // Upload finished
        console.log("Upload finished")
        if (waitUntilProcessed) {
            await waitForProcessing(stages, name, onProgress)
        }
        return name
    })
}

function waitForProcessing(stages: any, name: any, onProgress: (progress: Progress) => void) {
    return new Promise((resolve, reject) => {
        // Monitor cloud function progress by subscribing to the document
        const unsub = onSnapshot(doc(db, "assets", name), (docRef)=>{
            const {processed, processedProgress} = docRef.data() // Updating processing progress if required
            if (processed) {
                unsub()
                onProgress({
                    currentStage: "process",
                    stages: stages,
                    currentProgress: 1
                })
                resolve(name)
            } else {
                onProgress({
                    currentStage: "process",
                    stages: stages,
                    currentProgress: processedProgress
                })
            }
        })
    })
}
