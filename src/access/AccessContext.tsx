/**
 * AccessContext.tsx — Información de acceso para la pantalla de entrada (B-06).
 * Complementa a `AuthContext`: aquel dice QUIÉN es el usuario; este dice CÓMO se puede entrar.
 */

import { createContext, useContext } from 'react';
import type { Role } from '../domain/taxonomy';
import type { AccessMode } from './accessMode';

export interface AccessContextValue {
  mode: AccessMode;
  /** `true` cuando la sesión actual es de invitado (perfil de demo, sin Google). */
  isGuest: boolean;
  /** Entra con el perfil de demo de ese rol. `null` si el modo no permite invitado. */
  enterAsGuest: ((role: Role) => void) | null;
}

export const AccessContext = createContext<AccessContextValue>({
  mode: 'google',
  isGuest: false,
  enterAsGuest: null,
});

export const useAccess = (): AccessContextValue => useContext(AccessContext);
