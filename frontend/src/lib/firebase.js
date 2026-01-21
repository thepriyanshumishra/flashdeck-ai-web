import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInAnonymously,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    updateProfile
} from "firebase/auth";

// FlashDeck AI Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAHXQH_hz9QcFVLtiVLQADIY2uXXKa_xhc",
    authDomain: "flashdeckai.firebaseapp.com",
    projectId: "flashdeckai",
    storageBucket: "flashdeckai.firebasestorage.app",
    messagingSenderId: "912514612536",
    appId: "1:912514612536:web:6be51aa900c57852e695cd",
    measurementId: "G-4YFHJCWCR4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInAnonymously,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    updateProfile,
    analytics
};
