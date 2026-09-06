import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as FirebaseAuth from 'firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra;

const config = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    extra?.EXPO_PUBLIC_FIREBASE_API_KEY ||
    '',

  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    '',

  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    '',

  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    '',

  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    '',

  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    extra?.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '',
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

// استخدام قيم مؤقتة غير فارغة في حال عدم التكفّل بالمتغيرات لمنع خطأ auth/invalid-api-key
const firebaseConfig = isFirebaseConfigured
  ? config
  : {
      apiKey: 'demo-api-key-placeholder',
      authDomain: 'demo-app.firebaseapp.com',
      projectId: 'demo-app',
      storageBucket: 'demo-app.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:demo',
    };

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let authInstance: FirebaseAuth.Auth;
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