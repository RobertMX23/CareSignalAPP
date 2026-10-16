/**
 * initialProfile.ts — Perfil activo con el que arranca la demo (B-06, arreglo de recarga).
 *
 * Función pura. Antes, el perfil activo arrancaba siempre en el primer miembro del personal y
 * el perfil de invitado guardado se restauraba en un efecto, DESPUÉS del primer render. En ese
 * instante `RoleGuard` veía a un cuidador y rebotaba cualquier ruta de supervisor o gerente al
 * dashboard: recargar en `#/alertas` aterrizaba en `#/dashboard`. Resolverlo antes del primer
 * render elimina el rebote.
 */

import type { ID, StaffMember } from '../domain/types';
import type { AccessMode } from './accessMode';

/**
 * - En modos con invitado (`guest`, `hybrid`) se usa el perfil guardado si todavía existe.
 * - En modo `google` se ignora: un perfil de invitado antiguo no debe afectar a una cuenta real.
 * - En cualquier otro caso, el primer miembro del personal (comportamiento histórico).
 */
export const resolveInitialStaffId = (
  staff: readonly StaffMember[],
  mode: AccessMode,
  storedStaffId: ID | null,
): ID => {
  if (mode !== 'google' && storedStaffId !== null && staff.some((s) => s.id === storedStaffId)) {
    return storedStaffId;
  }
  return staff[0].id;
};
