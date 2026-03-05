import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type { Env } from './env.js';

export const initFirebase = (env: Env) => {
  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY
      }),
      storageBucket: env.FIREBASE_STORAGE_BUCKET
    });

  return {
    firestore: getFirestore(app),
    storage: getStorage(app)
  };
};
