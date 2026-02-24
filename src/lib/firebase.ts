import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyAI9VLLahwoJuUUQ8MlYWSi2u1VY_iiDAI",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "meher-mala.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "meher-mala",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "meher-mala.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "978172642133",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:978172642133:web:ebb4d9f3f165d15cf225dc",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-TXJCPWL1HN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
