/**
 * claims.ts — De los claims del token a un usuario de la app (B-06, cierre).
 *
 * Función pura, sin Firebase ni React. Antes de B-06 cerrar, un usuario sin claims entraba
 * como `demo_admin` de `residencia-demo-01`; ahora queda `provisioned: false` y la app le
 * muestra la pantalla de "sin acceso". Un usuario está provisionado solo si el token trae
 * un `role` válido de la taxonomía, un `residenciaId` y un `staffId` no vacíos (los inyecta
 * `functions/src/auth/setUserClaims.ts` o `scripts/set-user-claims.mjs`).
 */

import { ROLES, type Role } from '../domain/taxonomy';
import type { ID } from '../domain/types';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  /** `null` si el token no trae un rol válido (usuario sin provisionar). */
  role: Role | null;
  residenciaId: ID | null;
  staffId: ID | null;
  /** `true` solo con rol válido, residenciaId y staffId. Los invitados de demo lo son. */
  provisioned: boolean;
}

export interface FirebaseIdentity {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && (ROLES as readonly string[]).includes(value);

const nonEmptyString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value : null;

export const claimsToAuthUser = (
  identity: FirebaseIdentity,
  claims: Record<string, unknown>,
): AuthUser => {
  const role = isRole(claims.role) ? claims.role : null;
  const residenciaId = nonEmptyString(claims.residenciaId);
  const staffId = nonEmptyString(claims.staffId);

  return {
    uid: identity.uid,
    email: identity.email ?? '',
    displayName: identity.displayName ?? '',
    photoURL: identity.photoURL ?? undefined,
    role,
    residenciaId,
    staffId,
    provisioned: role !== null && residenciaId !== null && staffId !== null,
  };
};
