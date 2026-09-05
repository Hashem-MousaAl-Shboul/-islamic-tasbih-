import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as FirebaseAuth from 'firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

const app = getApps().length ? getApp() : initializeApp(config);

let authInstance;
try {
  const { getReactNativePersistence } = FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
  };
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage) as any,
  });
} catch {
  authInstance = getAuth(app);
}

export const firebaseAuth = authInstance;
export const firestore = getFirestore(app);
