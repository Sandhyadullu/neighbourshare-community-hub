// Firebase Initialization & Config Service
// NeighbourShare supports both direct Cloud Firestore / Firebase Auth
// and an intelligent Local-First Firestore persistent mock engine for zero-friction setup.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== "YOUR_API_KEY"
);

let app = null;
let auth = null;
let firestore = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    console.log("⚡ NeighbourShare connected to Google Firebase Cloud");
  } catch (err) {
    console.warn("Firebase initialization warning (falling back to local Firestore persistence):", err);
  }
} else {
  console.log("⚡ NeighbourShare running with Local-First Firestore Database (Storage & Auth ready)");
}

export { app, auth, firestore, storage, firebaseConfig };
