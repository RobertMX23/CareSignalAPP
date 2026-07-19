/**
 * DemoSessionContext.tsx — Estado de sesión ficticia del shell (Chunk 4).
 *
 * No es autenticación real (contrato: "no agregues login real"). Solo recuerda qué
 * usuario ficticio está "activo" para variar la vista (p. ej. Mis rondas) y expone un
 * `refreshToken` que las páginas usan para releer el repositorio después de una acción
 * que cambia datos (restablecer demo, avanzar el reloj). No persiste nada por su cuenta:
 * toda lectura/escritura de datos sigue pasando por `src/data/repository.ts`.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ID, StaffMember } from '../domain/types';
import { listStaffMembers } from '../data/repository';

interface DemoSessionValue {
  staffMembers: StaffMember[];
  activeStaffId: ID;
  activeStaff: StaffMember;
  setActiveStaffId: (id: ID) => void;
  refreshToken: number;
  refreshDemoData: () => void;
}

const DemoSessionContext = createContext<DemoSessionValue | undefined>(undefined);

export const DemoSessionProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [refreshToken, setRefreshToken] = useState(0);
  const staffMembers = useMemo(() => listStaffMembers(), [refreshToken]);
  const [activeStaffId, setActiveStaffId] = useState<ID>(staffMembers[0].id);

  const activeStaff = staffMembers.find((s) => s.id === activeStaffId) ?? staffMembers[0];
  const refreshDemoData = (): void => setRefreshToken((t) => t + 1);

  const value: DemoSessionValue = {
    staffMembers,
    activeStaffId,
    activeStaff,
    setActiveStaffId,
    refreshToken,
    refreshDemoData,
  };

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
};

export const useDemoSession = (): DemoSessionValue => {
  const ctx = useContext(DemoSessionContext);
  if (ctx === undefined) {
    throw new Error('useDemoSession debe usarse dentro de <DemoSessionProvider>.');
  }
  return ctx;
};
