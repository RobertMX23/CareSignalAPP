/**
 * useGuestSession.ts — Sesión de invitado sobre el `DemoSessionContext` existente (B-06).
 *
 * Fuente única de verdad del perfil activo: `activeStaff` del demo. El "usuario" invitado
 * se deriva de él, así que cambiar de perfil desde la cabecera actualiza el usuario sin
 * código adicional. Solo se persiste el ID del perfil elegido, vía capa repositorio.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDemoSession } from '../components/DemoSessionContext';
import type { AuthUser } from '../contexts/AuthContext';
import { clearGuestStaffId, readGuestStaffId, writeGuestStaffId } from '../data/repository';
import type { Role } from '../domain/taxonomy';
import type { StaffMember } from '../domain/types';
import { getGuestEntry } from './accessMode';

/** Perfil representativo de un rol: prefiere personal disponible. */
export const pickProfileForRole = (staff: StaffMember[], role: Role): StaffMember | undefined =>
  staff.find((s) => s.role === role && s.availability === 'available') ??
  staff.find((s) => s.role === role);

export interface GuestSession {
  user: AuthUser | null;
  enter: (role: Role) => void;
  leave: () => void;
}

export const useGuestSession = (): GuestSession => {
  const { staffMembers, activeStaff, setActiveStaffId } = useDemoSession();

  // `undefined` = aún sin decisión (en modo `auto` cuenta como sesión abierta);
  // `false` = el visitante cerró sesión; `true` = entró con un perfil.
  const [storedStaffId] = useState(() => readGuestStaffId());
  const [signedIn, setSignedIn] = useState<boolean | undefined>(
    storedStaffId !== null ? true : undefined,
  );

  useEffect(() => {
    if (storedStaffId !== null && staffMembers.some((s) => s.id === storedStaffId)) {
      setActiveStaffId(storedStaffId);
    }
    // Solo al montar: restaura el perfil guardado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enter = useCallback(
    (role: Role): void => {
      const profile = pickProfileForRole(staffMembers, role);
      if (profile === undefined) return;
      setActiveStaffId(profile.id);
      writeGuestStaffId(profile.id);
      setSignedIn(true);
    },
    [staffMembers, setActiveStaffId],
  );

  const leave = useCallback((): void => {
    clearGuestStaffId();
    setSignedIn(false);
  }, []);

  const open = signedIn === true || (signedIn === undefined && getGuestEntry() === 'auto');

  const user = useMemo<AuthUser | null>(
    () =>
      open
        ? {
            uid: `guest-${activeStaff.id}`,
            email: '',
            displayName: activeStaff.displayName,
            role: activeStaff.role,
            residenciaId: activeStaff.residenciaId,
            staffId: activeStaff.id,
          }
        : null,
    [open, activeStaff],
  );

  return useMemo(() => ({ user, enter, leave }), [user, enter, leave]);
};
