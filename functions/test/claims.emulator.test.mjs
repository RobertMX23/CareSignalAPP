/**
 * claims.emulator.test.mjs — Integración de `setUserClaims` contra los emuladores (B-04).
 *
 * Se ejecuta con `npm run test:functions` (raíz): `firebase emulators:exec` levanta
 * Auth + Functions + Firestore y expone FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST.
 * Requiere Java (emulador de Firestore); corre en CI. Nunca toca el proyecto real:
 * si faltan las variables del emulador, el test se niega a correr.
 *
 *   F-01  usuario con email provisionado → recibe { role, residenciaId, staffId }
 *   F-02  usuario con email no provisionado → queda sin claims
 */

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.GCLOUD_PROJECT ?? 'demo-caresignal-functions';
const RESIDENCIA = 'residencia-test';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForClaims(auth, uid, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const user = await auth.getUser(uid);
    if (user.customClaims && Object.keys(user.customClaims).length > 0) return user.customClaims;
    await sleep(500);
  }
  return undefined;
}

describe('setUserClaims (emuladores)', () => {
  let auth;
  let db;

  before(async () => {
    assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'FIRESTORE_EMULATOR_HOST no definido: usa emulators:exec');
    assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, 'FIREBASE_AUTH_EMULATOR_HOST no definido: usa emulators:exec');
    initializeApp({ projectId: PROJECT_ID });
    auth = getAuth();
    db = getFirestore();
    await db.doc(`staff/${RESIDENCIA}/staff/staff-sup-01`).set({
      email: 'supervisor@example.test',
      role: 'supervisor',
      residenciaId: RESIDENCIA,
      displayName: 'Supervisor de prueba',
    });
  });

  after(async () => {
    await db.doc(`staff/${RESIDENCIA}/staff/staff-sup-01`).delete();
  });

  it('F-01: email provisionado recibe role, residenciaId y staffId', async () => {
    const user = await auth.createUser({ uid: 'uid-provisionado', email: 'supervisor@example.test' });
    const claims = await waitForClaims(auth, user.uid, 30_000);
    assert.deepEqual(claims, {
      role: 'supervisor',
      residenciaId: RESIDENCIA,
      staffId: 'staff-sup-01',
    });
  });

  it('F-02: email no provisionado queda sin claims', async () => {
    const user = await auth.createUser({ uid: 'uid-sin-staff', email: 'nadie@example.test' });
    const claims = await waitForClaims(auth, user.uid, 8_000);
    assert.equal(claims, undefined);
  });
});
