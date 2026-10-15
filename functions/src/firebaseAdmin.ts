import * as admin from 'firebase-admin';

// initializeApp() sin argumentos usa GOOGLE_APPLICATION_CREDENTIALS
// (inyectado automáticamente en Cloud Run / Cloud Functions).
if (!admin.apps.length) {
  admin.initializeApp();
}

export const auth = admin.auth();
export const db   = admin.firestore();
