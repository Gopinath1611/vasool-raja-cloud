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

// உங்களது உண்மையான Firebase விவரங்களை இங்கே நேரடியாகப் போடவும்:
const firebaseConfig = {
  apiKey: "AIzaSyD2MgO9vr37dN4AvC5pFpeL8YSIaxYn3Dk",
  authDomain: "vasool-raja-cloud.firebaseapp.com",
  projectId: "vasool-raja-cloud",
  storageBucket: "vasool-raja-cloud.firebasestorage.app",
  messagingSenderId: "525595668471",
  appId: "1:525595668471:web:11a821ef7e83613b6848f2",
  measurementId: "G-9JL7T1R65J"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const appId = "vasool-raja-production";
export const initialAuthToken = null;

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
