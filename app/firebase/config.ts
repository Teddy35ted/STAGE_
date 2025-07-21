// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcTK1Zc6n4Y-R-B4tu6gDAdc63dBI8c2U",
  authDomain: "dashboard-4f9c8.firebaseapp.com",
  projectId: "dashboard-4f9c8",
  storageBucket: "dashboard-4f9c8.firebasestorage.app",
  messagingSenderId: "871267008837",
  appId: "1:871267008837:web:e1bf86dec4a5a31165fe2c"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Enable persistence for Firestore (optional)
// enableNetwork(db);

export default app;