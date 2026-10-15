/**
 * access-mode.test.ts — Resolución del modo de acceso y sesión de invitado (B-06).
 *
 *   A-01  sin variables → guest (no hay Firebase, no hay login posible)
 *   A-02  con Firebase y sin VITE_ACCESS_MODE → google (comportamiento previo)
 *   A-03  VITE_ACCESS_MODE válido con Firebase → ese modo
 *   A-04  hybrid/google sin Firebase → degrada a guest
 *   A-05  VITE_ACCESS_MODE inválido → ignora y aplica la regla por defecto
 *   A-06  VITE_GUEST_ENTRY: solo "auto" activa entrada directa
 *   A-07  pickProfileForRole prefiere personal disponible del rol pedido
 *   A-08  sesión de invitado: write/read/clear vía repositorio; reset de demo no la borra
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAccessMode, getGuestEntry } from '../src/access/accessMode';
import { pickProfileForRole } from '../src/access/useGuestSession';
import type { StaffMember } from '../src/domain/types';

const stubEnv = (env: Record<string, string>): void => {
  vi.stubEnv('VITE_FIREBASE_API_KEY', '');
  vi.stubEnv('VITE_ACCESS_MODE', '');
  vi.stubEnv('VITE_GUEST_ENTRY', '');
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getAccessMode', () => {
  it('A-01: sin variables → guest', () => {
    stubEnv({});
    expect(getAccessMode()).toBe('guest');
  });

  it('A-02: con Firebase y sin modo explícito → google', () => {
    stubEnv({ VITE_FIREBASE_API_KEY: 'k' });
    expect(getAccessMode()).toBe('google');
  });

  it('A-03: modo explícito válido con Firebase', () => {
    stubEnv({ VITE_FIREBASE_API_KEY: 'k', VITE_ACCESS_MODE: 'hybrid' });
    expect(getAccessMode()).toBe('hybrid');
    stubEnv({ VITE_FIREBASE_API_KEY: 'k', VITE_ACCESS_MODE: 'guest' });
    expect(getAccessMode()).toBe('guest');
  });

  it('A-04: hybrid/google sin Firebase degradan a guest', () => {
    stubEnv({ VITE_ACCESS_MODE: 'google' });
    expect(getAccessMode()).toBe('guest');
    stubEnv({ VITE_ACCESS_MODE: 'hybrid' });
    expect(getAccessMode()).toBe('guest');
  });

  it('A-05: modo inválido se ignora', () => {
    stubEnv({ VITE_FIREBASE_API_KEY: 'k', VITE_ACCESS_MODE: 'admin' });
    expect(getAccessMode()).toBe('google');
  });
});

describe('getGuestEntry', () => {
  it('A-06: solo "auto" activa entrada directa', () => {
    stubEnv({});
    expect(getGuestEntry()).toBe('picker');
    stubEnv({ VITE_GUEST_ENTRY: 'auto' });
    expect(getGuestEntry()).toBe('auto');
    stubEnv({ VITE_GUEST_ENTRY: 'cualquier-cosa' });
    expect(getGuestEntry()).toBe('picker');
  });
});

describe('pickProfileForRole', () => {
  const staff = [
    { id: 's1', role: 'caregiver', availability: 'off_shift' },
    { id: 's2', role: 'caregiver', availability: 'available' },
    { id: 's3', role: 'manager', availability: 'off_shift' },
  ] as unknown as StaffMember[];

  it('A-07: prefiere disponible; si no hay, el primero del rol; sin rol → undefined', () => {
    expect(pickProfileForRole(staff, 'caregiver')?.id).toBe('s2');
    expect(pickProfileForRole(staff, 'manager')?.id).toBe('s3');
    expect(pickProfileForRole(staff, 'supervisor')).toBeUndefined();
  });
});

describe('sesión de invitado en el repositorio', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  it('A-08: write → read → clear, y resetToSeed no la borra', async () => {
    const repo = await import('../src/data/repository');
    expect(repo.readGuestStaffId()).toBeNull();

    repo.writeGuestStaffId('staff-supervisor-01');
    expect(repo.readGuestStaffId()).toBe('staff-supervisor-01');

    repo.resetToSeed();
    expect(repo.readGuestStaffId()).toBe('staff-supervisor-01');

    repo.clearGuestStaffId();
    expect(repo.readGuestStaffId()).toBeNull();
  });

  it('A-08b: valor corrupto se trata como sin sesión', async () => {
    window.localStorage.setItem('caresignal:guest-profile:v1', '{no es json');
    const repo = await import('../src/data/repository');
    expect(repo.readGuestStaffId()).toBeNull();
  });
});
