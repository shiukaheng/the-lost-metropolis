// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClNjD0uFDgapYKOnsMkmj212PBbeSIA5s",
  authDomain: "the-lost-metropolis.firebaseapp.com",
  projectId: "the-lost-metropolis",
  storageBucket: "the-lost-metropolis.appspot.com",
  messagingSenderId: "796499308381",
  appId: "1:796499308381:web:ffee9756612bea6ec842b4",
  measurementId: "G-9GNB7T4RG4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };