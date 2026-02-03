// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// PASTE YOUR CONFIG OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSyDG8l4zCw8qFP_YcPzCJZ1pX7v94SW1TOM",
  authDomain: "wildguess-810cb.firebaseapp.com",
  projectId: "wildguess-810cb",
  storageBucket: "wildguess-810cb.firebasestorage.app",
  messagingSenderId: "534801192362",
  appId: "1:534801192362:web:90d4053ad89a2dbe0307d3",
  measurementId: "G-7RKBPRH5JQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };

