/**
 * accessMode.ts — Modo de acceso de la app (B-06, `docs/19-contrato-acciones-benchmark.md`).
 *
 * Es el "cambio de vías": una sola variable decide cómo entra un visitante, sin tocar
 * guardias de ruta, navegación ni páginas.
 *
 *   guest   → solo perfiles de demo (sin cuenta, sin Firebase). Demo público.
 *   hybrid  → perfiles de demo + "Continuar con Google". QA.
 *   google  → solo Google SSO. Producción. Es el comportamiento previo a B-06.
 *
 * Resolución: `VITE_ACCESS_MODE` válido gana. Si no está definido, se conserva el
 * comportamiento anterior (`google`) cuando Firebase está configurado; sin
 * configuración de Firebase no hay forma de iniciar sesión, así que cae a `guest`.
 */

export type AccessMode = 'guest' | 'hybrid' | 'google';

const ACCESS_MODES: readonly AccessMode[] = ['guest', 'hybrid', 'google'];

const isAccessMode = (value: unknown): value is AccessMode =>
  typeof value === 'string' && (ACCESS_MODES as readonly string[]).includes(value);

export const isFirebaseConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  return typeof apiKey === 'string' && apiKey.length > 0;
};

export const getAccessMode = (): AccessMode => {
  const requested = import.meta.env.VITE_ACCESS_MODE as string | undefined;
  if (isAccessMode(requested)) {
    // Sin Firebase no hay Google: un modo que lo requiere degrada a invitado.
    if (requested !== 'guest' && !isFirebaseConfigured()) return 'guest';
    return requested;
  }
  return isFirebaseConfigured() ? 'google' : 'guest';
};

/**
 * Entrada del modo invitado:
 *   picker → hay que elegir un perfil (demo público).
 *   auto   → entra directo con el primer perfil, como la demo v0.1.0 (suite E2E).
 */
export type GuestEntry = 'picker' | 'auto';

export const getGuestEntry = (): GuestEntry =>
  import.meta.env.VITE_GUEST_ENTRY === 'auto' ? 'auto' : 'picker';
