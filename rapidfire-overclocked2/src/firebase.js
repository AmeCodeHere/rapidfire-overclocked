import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, get } from 'firebase/database';

/**
 * OVERCLOCKED Rapid Fire - Firebase Realtime Database Configuration
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBqZJj1mwNOmMeo1Q_bDbgQ67witmc6cgs",
  authDomain: "rapid-fire-7c89e.firebaseapp.com",
  databaseURL: "https://rapid-fire-7c89e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rapid-fire-7c89e",
  storageBucket: "rapid-fire-7c89e.firebasestorage.app",
  messagingSenderId: "1839524971",
  appId: "1:1839524971:web:2be5a559770d764e36152e"
};

// Retrieve any custom config saved via Admin UI or fallback to default
export const getActiveFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem('overclocked_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.databaseURL || parsed.apiKey)) {
        return { ...firebaseConfig, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Error reading saved Firebase config:', e);
  }
  return firebaseConfig;
};

export const saveFirebaseConfig = (config) => {
  try {
    localStorage.setItem('overclocked_firebase_config', JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
  }
};

let app = null;
let db = null;
let isConfigured = false;

const config = getActiveFirebaseConfig();
try {
  app = getApps().length === 0 ? initializeApp(config) : getApp();
  db = getDatabase(app);
  isConfigured = true;
  console.log("⚡ Connected to Firebase Realtime Database: rapid-fire-7c89e");
} catch (error) {
  console.warn("Firebase initialization warning:", error);
  isConfigured = false;
}

export { app, db, isConfigured, ref, onValue, set, update, get };
