/**
 * firestore.rules.test.ts — Pruebas de las Security Rules contra el emulador (B-01).
 *
 * Se ejecutan con `npm run test:rules` (emulador de Firestore; requiere Java, corre en CI).
 * NO forman parte de `npm test`: ver `vitest.config` (exclude) y `vitest.rules.config.ts`.
 *
 * Los documentos viven en `{coleccion}/{residenciaId}/{coleccion}/{id}` (4 segmentos), la
 * misma forma que escriben `scripts/provision-firestore.ts` y `backend/src/routes/*`.
 * `docPath()` es la única fuente de esa forma en los tests, para que una migración de paths
 * sea un cambio localizado.
 *
 *   R-01  lectura/escritura legítima dentro del tenant (prueba la hipótesis de B-01)
 *   R-02  aislamiento entre tenants (residenciaId distinto → denegado)
 *   R-03  caregiver: solo actualiza rondas asignadas a su staffId
 *   R-04  alertas e incidentes: escritura solo para supervisor / manager / demo_admin
 *   R-05  audit append-only: create sí; update y delete nunca
 *   R-06  rondas no se eliminan
 *   R-07  sin autenticación → todo denegado
 *   R-08  colecciones no listadas y claims incompletos → denegado
 *   R-09  staff: escritura solo demo_admin
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const TENANT_A = 'residencia-demo-01';
const TENANT_B = 'residencia-otra-02';

/** Forma real de un documento: coleccion/residenciaId/coleccion/id. */
const docPath = (collection: string, residenciaId: string, id: string): string =>
  `${collection}/${residenciaId}/${collection}/${id}`;

let testEnv: RulesTestEnvironment;

const asUser = (role: string, residenciaId: string, staffId: string) =>
  testEnv.authenticatedContext(`uid-${staffId}`, { role, residenciaId, staffId }).firestore();

const caregiverA = (staffId = 'staff-caregiver-01') => asUser('caregiver', TENANT_A, staffId);
const supervisorA = () => asUser('supervisor', TENANT_A, 'staff-supervisor-01');
const managerA = () => asUser('manager', TENANT_A, 'staff-manager-01');
const adminA = () => asUser('demo_admin', TENANT_A, 'staff-demo-admin-01');
const supervisorB = () => asUser('supervisor', TENANT_B, 'staff-supervisor-b1');

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-caresignal-rules',
    firestore: { rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8') },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, docPath('rounds', TENANT_A, 'round-1')), {
      assignedStaffId: 'staff-caregiver-01',
      status: 'due',
    });
    await setDoc(doc(db, docPath('rounds', TENANT_A, 'round-2')), {
      assignedStaffId: 'staff-caregiver-02',
      status: 'due',
    });
    await setDoc(doc(db, docPath('residents', TENANT_A, 'resident-01')), { displayName: 'Marta' });
    await setDoc(doc(db, docPath('alerts', TENANT_A, 'alert-1')), { status: 'open' });
    await setDoc(doc(db, docPath('incidents', TENANT_A, 'incident-1')), { status: 'open' });
    await setDoc(doc(db, docPath('audit', TENANT_A, 'event-1')), { action: 'seed' });
    await setDoc(doc(db, docPath('staff', TENANT_A, 'staff-caregiver-01')), { role: 'caregiver' });
  });
});

describe('R-01 acceso legítimo dentro del tenant', () => {
  it('supervisor lee una ronda de su residencia', async () => {
    await assertSucceeds(getDoc(doc(supervisorA(), docPath('rounds', TENANT_A, 'round-1'))));
  });

  it('caregiver lee residentes de su residencia', async () => {
    await assertSucceeds(getDoc(doc(caregiverA(), docPath('residents', TENANT_A, 'resident-01'))));
  });

  it('supervisor crea una ronda', async () => {
    await assertSucceeds(
      setDoc(doc(supervisorA(), docPath('rounds', TENANT_A, 'round-new')), { status: 'scheduled' }),
    );
  });
});

describe('R-02 aislamiento entre tenants', () => {
  it('supervisor de otra residencia no lee rondas', async () => {
    await assertFails(getDoc(doc(supervisorB(), docPath('rounds', TENANT_A, 'round-1'))));
  });

  it('supervisor de otra residencia no escribe alertas', async () => {
    await assertFails(
      setDoc(doc(supervisorB(), docPath('alerts', TENANT_A, 'alert-x')), { status: 'open' }),
    );
  });

  it('el claim residenciaId manda: un usuario no lee bajo el path de otro tenant', async () => {
    await assertFails(getDoc(doc(caregiverA(), docPath('residents', TENANT_B, 'resident-01'))));
  });
});

describe('R-03 caregiver y rondas', () => {
  it('actualiza su ronda asignada', async () => {
    await assertSucceeds(
      updateDoc(doc(caregiverA('staff-caregiver-01'), docPath('rounds', TENANT_A, 'round-1')), {
        status: 'in_progress',
      }),
    );
  });

  it('no actualiza una ronda asignada a otro caregiver', async () => {
    await assertFails(
      updateDoc(doc(caregiverA('staff-caregiver-01'), docPath('rounds', TENANT_A, 'round-2')), {
        status: 'in_progress',
      }),
    );
  });

  it('no crea rondas', async () => {
    await assertFails(
      setDoc(doc(caregiverA(), docPath('rounds', TENANT_A, 'round-new')), { status: 'scheduled' }),
    );
  });
});

describe('R-04 alertas e incidentes', () => {
  it('caregiver no crea alertas', async () => {
    await assertFails(
      setDoc(doc(caregiverA(), docPath('alerts', TENANT_A, 'alert-new')), { status: 'open' }),
    );
  });

  it('supervisor actualiza una alerta', async () => {
    await assertSucceeds(
      updateDoc(doc(supervisorA(), docPath('alerts', TENANT_A, 'alert-1')), { status: 'assigned' }),
    );
  });

  it('manager actualiza una alerta (cierra el ciclo)', async () => {
    await assertSucceeds(
      updateDoc(doc(managerA(), docPath('alerts', TENANT_A, 'alert-1')), { status: 'closed' }),
    );
  });

  it('caregiver no escribe incidentes', async () => {
    await assertFails(
      updateDoc(doc(caregiverA(), docPath('incidents', TENANT_A, 'incident-1')), { status: 'closed' }),
    );
  });
});

describe('R-05 audit append-only', () => {
  it('caregiver crea un evento de audit', async () => {
    await assertSucceeds(
      setDoc(doc(caregiverA(), docPath('audit', TENANT_A, 'event-new')), { action: 'round_started' }),
    );
  });

  it('manager crea un evento de audit', async () => {
    await assertSucceeds(
      setDoc(doc(managerA(), docPath('audit', TENANT_A, 'event-mgr')), { action: 'alert_closed' }),
    );
  });

  it('nadie actualiza un evento, ni siquiera demo_admin', async () => {
    await assertFails(updateDoc(doc(adminA(), docPath('audit', TENANT_A, 'event-1')), { action: 'x' }));
    await assertFails(updateDoc(doc(supervisorA(), docPath('audit', TENANT_A, 'event-1')), { action: 'x' }));
  });

  it('nadie elimina un evento', async () => {
    await assertFails(deleteDoc(doc(adminA(), docPath('audit', TENANT_A, 'event-1'))));
  });
});

describe('R-06 rondas no se eliminan', () => {
  it('ni supervisor ni demo_admin eliminan una ronda', async () => {
    await assertFails(deleteDoc(doc(supervisorA(), docPath('rounds', TENANT_A, 'round-1'))));
    await assertFails(deleteDoc(doc(adminA(), docPath('rounds', TENANT_A, 'round-1'))));
  });
});

describe('R-07 sin autenticación', () => {
  it('denegado en lectura y escritura', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, docPath('rounds', TENANT_A, 'round-1'))));
    await assertFails(setDoc(doc(anon, docPath('alerts', TENANT_A, 'alert-x')), { status: 'open' }));
  });
});

describe('R-08 colecciones no listadas y claims incompletos', () => {
  it('colección no listada → denegado aun siendo demo_admin', async () => {
    await assertFails(getDoc(doc(adminA(), 'secretos/residencia-demo-01/secretos/x')));
    await assertFails(setDoc(doc(adminA(), 'otra/x'), { a: 1 }));
  });

  it('usuario autenticado sin claims de tenant → denegado', async () => {
    const noClaims = testEnv.authenticatedContext('uid-sin-claims', {}).firestore();
    await assertFails(getDoc(doc(noClaims, docPath('rounds', TENANT_A, 'round-1'))));
  });
});

describe('R-09 staff', () => {
  it('cualquier usuario del tenant lee el personal', async () => {
    await assertSucceeds(getDoc(doc(caregiverA(), docPath('staff', TENANT_A, 'staff-caregiver-01'))));
  });

  it('supervisor no escribe personal', async () => {
    await assertFails(
      setDoc(doc(supervisorA(), docPath('staff', TENANT_A, 'staff-x')), { role: 'caregiver' }),
    );
  });

  it('demo_admin escribe personal', async () => {
    await assertSucceeds(
      setDoc(doc(adminA(), docPath('staff', TENANT_A, 'staff-x')), { role: 'caregiver' }),
    );
  });
});
