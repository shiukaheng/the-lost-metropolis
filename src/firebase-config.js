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
  apiKey: "AIzaSyBN4OPeQly_ei-ttR9pliK8Rvt1Oem2ARg",
  authDomain: "the-lost-metropolis-prod-c48c6.firebaseapp.com",
  projectId: "the-lost-metropolis-prod-c48c6",
  storageBucket: "the-lost-metropolis-prod-c48c6.appspot.com",
  messagingSenderId: "1056722334454",
  appId: "1:1056722334454:web:5d3395266c2ca560e432d7",
  measurementId: "G-3QRQW5LVCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };