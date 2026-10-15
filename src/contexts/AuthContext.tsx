/**
 * AuthContext.tsx — Contexto de autenticación real con Firebase Auth + Google SSO.
 *
 * Reemplaza DemoSessionContext en producción. Expone:
 *   - user: AuthUser | null  (null = no autenticado)
 *   - signIn()               (popup Google SSO)
 *   - signOut()
 *   - loading                (true mientras Firebase verifica la sesión inicial)
 *
 * Los custom claims (role, residenciaId, staffId) los inyecta la Cloud Function
 * onUserCreate; aquí se leen del token via getIdTokenResult().
 *
 * Uso en App.tsx:
 *   <AuthProvider>
 *     {user ? <AppShell /> : <LoginPage />}
 *   </AuthProvider>
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import type { ID } from '../domain/types';
import type { Role } from '../domain/taxonomy';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  /** Inyectado por Cloud Function onUserCreate */
  role: Role;
  residenciaId: ID;
  staffId: ID;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function toAuthUser(firebaseUser: User): Promise<AuthUser> {
  let claims: Record<string, unknown> = {};
  try {
    const tokenResult = await firebaseUser.getIdTokenResult(false);
    claims = tokenResult.claims as Record<string, unknown>;
  } catch {
    // Sin claims — el usuario entra con rol por defecto
  }
  return {
    uid:          firebaseUser.uid,
    email:        firebaseUser.email ?? '',
    displayName:  firebaseUser.displayName ?? '',
    photoURL:     firebaseUser.photoURL ?? undefined,
    role:         (claims.role as Role) ?? 'demo_admin',
    residenciaId: (claims.residenciaId as ID) ?? 'residencia-demo-01',
    staffId:      (claims.staffId as ID) ?? '',
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    // Sin configuración de Firebase (CI, demo local) no hay sesión que verificar.
    if (auth === undefined) {
      setLoading(false);
      return undefined;
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authUser = await toAuthUser(firebaseUser); // toAuthUser nunca lanza
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (): Promise<void> => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged se dispara automáticamente después del popup
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
    }
  };

  const signOut = async (): Promise<void> => {
    if (auth !== undefined) await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return ctx;
};
