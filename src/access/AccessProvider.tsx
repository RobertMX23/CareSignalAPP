/**
 * AccessProvider.tsx — Conmutador de modo de acceso (B-06).
 *
 * Reemplaza a <AuthProvider> en `App.tsx`. Entrega el MISMO contrato de `useAuth()` en
 * los tres modos, de modo que `AuthGuard`, `AppLayout` y las páginas no cambian.
 * Debe montarse dentro de <DemoSessionProvider>.
 */

import { useMemo, type ReactNode } from 'react';
import { AuthContext, AuthProvider, useAuth, type AuthContextValue } from '../contexts/AuthContext';
import { AccessContext, type AccessContextValue } from './AccessContext';
import { getAccessMode } from './accessMode';
import { useGuestSession } from './useGuestSession';

const noop = async (): Promise<void> => undefined;

const GuestOnlyProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const guest = useGuestSession();

  const auth = useMemo<AuthContextValue>(
    () => ({
      user: guest.user,
      loading: false,
      signIn: noop,
      signOut: async () => guest.leave(),
      error: null,
    }),
    [guest],
  );
  const access = useMemo<AccessContextValue>(
    () => ({ mode: 'guest', isGuest: guest.user !== null, enterAsGuest: guest.enter }),
    [guest],
  );

  return (
    <AuthContext.Provider value={auth}>
      <AccessContext.Provider value={access}>{children}</AccessContext.Provider>
    </AuthContext.Provider>
  );
};

/** Modo híbrido: la sesión de Google (si existe) tiene prioridad sobre la de invitado. */
const HybridBridge = ({ children }: { children: ReactNode }): JSX.Element => {
  const google = useAuth();
  const guest = useGuestSession();

  const auth = useMemo<AuthContextValue>(
    () => ({
      user: google.user ?? guest.user,
      loading: google.loading,
      signIn: google.signIn,
      signOut: async () => {
        guest.leave();
        if (google.user !== null) await google.signOut();
      },
      error: google.error,
    }),
    [google, guest],
  );
  const access = useMemo<AccessContextValue>(
    () => ({
      mode: 'hybrid',
      isGuest: google.user === null && guest.user !== null,
      enterAsGuest: guest.enter,
    }),
    [google.user, guest],
  );

  return (
    <AuthContext.Provider value={auth}>
      <AccessContext.Provider value={access}>{children}</AccessContext.Provider>
    </AuthContext.Provider>
  );
};

export const AccessProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const mode = getAccessMode();

  if (mode === 'guest') return <GuestOnlyProvider>{children}</GuestOnlyProvider>;

  if (mode === 'hybrid') {
    return (
      <AuthProvider>
        <HybridBridge>{children}</HybridBridge>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AccessContext.Provider value={{ mode: 'google', isGuest: false, enterAsGuest: null }}>
        {children}
      </AccessContext.Provider>
    </AuthProvider>
  );
};
