/**
 * firebase.ts — Inicialización del cliente Firebase (solo frontend).
 *
 * Lee las variables de entorno VITE_FIREBASE_* que Vite inyecta en el bundle.
 * No importar en código de servidor/backend (ahí se usa firebase-admin).
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:    import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId:     import.meta.env.VITE_FIREBASE_APP_ID as string,
};

let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

// Inicialización lazy: en el MVP demo (sin variables VITE_FIREBASE_*) el módulo
// se puede importar sin errores; solo falla si se llama a signIn sin config.
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  // Restringir al dominio del cliente (ajustar cuando se tenga el dominio real)
  // googleProvider.setCustomParameters({ hd: import.meta.env.VITE_ALLOWED_DOMAIN });
} catch {
  // Silencioso en modo demo sin credenciales configuradas
}

export { auth, googleProvider };
