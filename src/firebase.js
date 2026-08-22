import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  enableIndexedDbPersistence,
} from "firebase/firestore";

// Works both inside a sandbox/canvas environment that injects
// __firebase_config / __app_id / __initial_auth_token globals,
// and as a normal Vite app reading from a .env file.
const injectedConfig =
  typeof __firebase_config !== "undefined" ? JSON.parse(__firebase_config) : null;

const firebaseConfig = injectedConfig || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const appId =
  typeof __app_id !== "undefined"
    ? __app_id
    : import.meta.env.VITE_APP_ID || "vasool-raja-demo";

export const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

export {
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  enableIndexedDbPersistence,
};
