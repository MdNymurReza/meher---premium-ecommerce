import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyDYsBEDpt-QEPZ4tcJaT0YZfsygoLsosVg",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "meher-mala-website.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "meher-mala-website",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "meher-mala-website.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "712259782719",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:712259782719:web:87013812fce5bea12c908a",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-JV676CNB3F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
