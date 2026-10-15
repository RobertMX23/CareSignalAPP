import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// initializeApp() sin argumentos usa GOOGLE_APPLICATION_CREDENTIALS
// (inyectado automáticamente en Cloud Run / Cloud Functions) o los emuladores locales.
// API modular: firebase-admin >= 13 retiró el namespace `admin.*`.
if (getApps().length === 0) {
  initializeApp();
}

export const auth = getAuth();
export const db   = getFirestore();
