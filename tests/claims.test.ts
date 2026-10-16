/**
 * claims.test.ts — De claims del token a usuario de la app (B-06, cierre).
 *
 *   C-01  claims completos y válidos → provisionado, con los valores del token
 *   C-02  sin claims → NO provisionado y sin rol (nunca `demo_admin`)
 *   C-03  rol fuera de la taxonomía → no provisionado
 *   C-04  falta residenciaId o staffId (o vacío) → no provisionado
 *   C-05  tipos incorrectos en los claims → no provisionado
 *   C-06  sin email ni nombre → cadenas vacías, sin lanzar
 *   C-07  los cuatro roles de la taxonomía son válidos
 */

import { describe, expect, it } from 'vitest';
import { claimsToAuthUser, isRole, type FirebaseIdentity } from '../src/contexts/claims';
import { ROLES } from '../src/domain/taxonomy';

const identity: FirebaseIdentity = {
  uid: 'uid-1',
  email: 'persona@example.test',
  displayName: 'Persona de prueba',
  photoURL: null,
};

const full = { role: 'supervisor', residenciaId: 'residencia-demo-01', staffId: 'staff-supervisor-01' };

describe('claimsToAuthUser', () => {
  it('C-01: claims completos → provisionado', () => {
    const user = claimsToAuthUser(identity, full);
    expect(user.provisioned).toBe(true);
    expect(user.role).toBe('supervisor');
    expect(user.residenciaId).toBe('residencia-demo-01');
    expect(user.staffId).toBe('staff-supervisor-01');
    expect(user.email).toBe('persona@example.test');
  });

  it('C-02: sin claims → sin provisionar, sin rol por defecto', () => {
    const user = claimsToAuthUser(identity, {});
    expect(user.provisioned).toBe(false);
    expect(user.role).toBeNull();
    expect(user.residenciaId).toBeNull();
    expect(user.staffId).toBeNull();
    expect(user.role).not.toBe('demo_admin');
  });

  it('C-03: rol fuera de la taxonomía → sin provisionar', () => {
    for (const role of ['admin', 'owner', 'paciente', '', 'Supervisor']) {
      const user = claimsToAuthUser(identity, { ...full, role });
      expect(user.provisioned, `rol "${role}"`).toBe(false);
      expect(user.role).toBeNull();
    }
  });

  it('C-04: falta residenciaId o staffId → sin provisionar', () => {
    expect(claimsToAuthUser(identity, { role: 'caregiver', staffId: 's1' }).provisioned).toBe(false);
    expect(claimsToAuthUser(identity, { role: 'caregiver', residenciaId: 'r1' }).provisioned).toBe(false);
    expect(claimsToAuthUser(identity, { ...full, staffId: '   ' }).provisioned).toBe(false);
    expect(claimsToAuthUser(identity, { ...full, residenciaId: '' }).provisioned).toBe(false);
  });

  it('C-05: tipos incorrectos → sin provisionar', () => {
    expect(claimsToAuthUser(identity, { role: 7, residenciaId: 'r1', staffId: 's1' }).provisioned).toBe(false);
    expect(claimsToAuthUser(identity, { role: 'manager', residenciaId: 1, staffId: 's1' }).provisioned).toBe(false);
    expect(claimsToAuthUser(identity, { role: 'manager', residenciaId: 'r1', staffId: null }).provisioned).toBe(false);
  });

  it('C-06: sin email ni nombre no lanza', () => {
    const user = claimsToAuthUser({ uid: 'u', email: null, displayName: null, photoURL: null }, full);
    expect(user.email).toBe('');
    expect(user.displayName).toBe('');
    expect(user.photoURL).toBeUndefined();
  });

  it('C-07: los roles de la taxonomía son válidos', () => {
    for (const role of ROLES) {
      expect(isRole(role)).toBe(true);
      expect(claimsToAuthUser(identity, { ...full, role }).provisioned).toBe(true);
    }
    expect(isRole('demo-admin')).toBe(false);
  });
});
