import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase Services
export const auth = getAuth(app);

// Use default database for Firestore
export const db = getFirestore(app);

// Firebase Storage disabled for Spark testing - image URLs are stored directly in Firestore
export const storage = null;

export default app;
