import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for Lighthouse project
const firebaseConfig = {
  apiKey: "AIzaSyCsKy-Kmy3owx_y1slAvsqnYSfm9tHx0HI",
  authDomain: "lighthouse-hackgt.firebaseapp.com",
  projectId: "lighthouse-hackgt",
  storageBucket: "lighthouse-hackgt.firebasestorage.app",
  messagingSenderId: "33371202765",
  appId: "1:33371202765:web:adef57731a0fc76d70f584",
  measurementId: "G-1QJC093Y80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
