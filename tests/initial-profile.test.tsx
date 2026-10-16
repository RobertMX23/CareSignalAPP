/**
 * initial-profile.test.tsx — Perfil activo inicial de la demo (B-06, arreglo de recarga).
 *
 *   IP-01  modos guest/hybrid usan el perfil guardado si existe
 *   IP-02  modo google lo ignora (un invitado antiguo no afecta a una cuenta real)
 *   IP-03  perfil guardado inexistente o ausente → primer miembro (comportamiento histórico)
 *   IP-04  el proveedor aplica el perfil guardado YA en el primer render (sin rebote de RoleGuard)
 *   IP-05  sin perfil guardado, el primer render sigue siendo el primer miembro
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { resolveInitialStaffId } from '../src/access/initialProfile';
import { DemoSessionProvider, useDemoSession } from '../src/components/DemoSessionContext';
import type { StaffMember } from '../src/domain/types';

const staff = [
  { id: 'staff-caregiver-01', role: 'caregiver' },
  { id: 'staff-supervisor-01', role: 'supervisor' },
  { id: 'staff-manager-01', role: 'manager' },
] as unknown as StaffMember[];

describe('resolveInitialStaffId', () => {
  it('IP-01: guest y hybrid usan el perfil guardado', () => {
    expect(resolveInitialStaffId(staff, 'guest', 'staff-supervisor-01')).toBe('staff-supervisor-01');
    expect(resolveInitialStaffId(staff, 'hybrid', 'staff-manager-01')).toBe('staff-manager-01');
  });

  it('IP-02: google ignora el perfil guardado', () => {
    expect(resolveInitialStaffId(staff, 'google', 'staff-supervisor-01')).toBe('staff-caregiver-01');
  });

  it('IP-03: guardado inexistente o ausente → primer miembro', () => {
    expect(resolveInitialStaffId(staff, 'guest', 'staff-fantasma')).toBe('staff-caregiver-01');
    expect(resolveInitialStaffId(staff, 'guest', null)).toBe('staff-caregiver-01');
  });
});

describe('DemoSessionProvider (primer render)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubEnv('VITE_ACCESS_MODE', 'guest');
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  const primerRender = (): string => {
    const vistos: string[] = [];
    const Sonda = (): null => {
      vistos.push(useDemoSession().activeStaff.role);
      return null;
    };
    render(
      <DemoSessionProvider>
        <Sonda />
      </DemoSessionProvider>,
    );
    return vistos[0];
  };

  it('IP-04: aplica el perfil guardado ya en el primer render', () => {
    window.localStorage.setItem('caresignal:guest-profile:v1', JSON.stringify({ staffId: 'staff-supervisor-01' }));
    expect(primerRender()).toBe('supervisor');
  });

  it('IP-05: sin perfil guardado, el primer render es el primer miembro', () => {
    expect(primerRender()).toBe('caregiver');
  });
});
