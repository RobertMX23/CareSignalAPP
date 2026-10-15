/**
 * provision-firestore.ts — Sube la semilla demo a Firestore.
 *
 * Crea las colecciones para el tenant `residencia-demo-01` con los datos
 * ficticios de src/data/seed.ts. También crea los documentos `staff/`
 * necesarios para que la Cloud Function setUserClaims encuentre a los usuarios.
 *
 * Uso (desde la raíz del proyecto):
 *   npx ts-node -e "require('./scripts/provision-firestore.ts')"
 *   -- ó --
 *   npm run provision:firestore
 *
 * Requiere GOOGLE_APPLICATION_CREDENTIALS apuntando a una service account key
 * con permisos de escritura en Firestore del proyecto caresignal-prod.
 *
 * ADVERTENCIA: Este script es destructivo — sobreescribe los documentos
 * existentes del tenant. Solo para setup inicial o reset de demo.
 */

import * as admin from 'firebase-admin';

// Importamos la semilla compilada (ejecutar con ts-node desde la raíz)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { buildSeedSnapshot, DEMO_RESIDENCIA_ID } = require('../src/data/seed');

// ── Init ──────────────────────────────────────────────────────────────────────

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId:  process.env.FIREBASE_PROJECT_ID ?? 'caresignal-mvp-2026',
  });
}

const db = admin.firestore();

// ── Helpers ───────────────────────────────────────────────────────────────────

type CollectionName = 'residents' | 'staff' | 'rounds' | 'alerts' | 'incidents' | 'audit';

async function uploadCollection(
  residenciaId: string,
  collection: CollectionName,
  docs: Array<{ id: string; [k: string]: unknown }>
): Promise<void> {
  const batch = db.batch();
  for (const doc of docs) {
    const { id, ...data } = doc;
    const ref = db.collection(collection).doc(residenciaId).collection(collection).doc(id);
    batch.set(ref, data, { merge: false });
  }
  await batch.commit();
  console.log(`  ✓ ${collection}: ${docs.length} documentos`);
}

// ── Staff para SSO (colección separada que lee setUserClaims) ──────────────────
// Los emails deben coincidir con las cuentas de Google Workspace que harán login.
// Ajustar antes de ejecutar en producción.

const STAFF_SSO: Array<{
  id: string;
  email: string;
  role: string;
  residenciaId: string;
  displayName: string;
  shift: string;
  availability: string;
  isActive: boolean;
}> = [
  {
    id:           'staff-supervisor-01',
    email:        'supervisor@residencia.com',
    role:         'supervisor',
    residenciaId: DEMO_RESIDENCIA_ID,
    displayName:  'Dr. Carlos Mendoza',
    shift:        'morning',
    availability: 'available',
    isActive:     true,
  },
  {
    id:           'staff-cuidador-01',
    email:        'cuidador1@residencia.com',
    role:         'caregiver',
    residenciaId: DEMO_RESIDENCIA_ID,
    displayName:  'Ana López',
    shift:        'morning',
    availability: 'available',
    isActive:     true,
  },
  {
    id:           'staff-cuidador-02',
    email:        'cuidador2@residencia.com',
    role:         'caregiver',
    residenciaId: DEMO_RESIDENCIA_ID,
    displayName:  'Marco Ramírez',
    shift:        'afternoon',
    availability: 'available',
    isActive:     true,
  },
  {
    id:           'staff-admin-01',
    email:        'admin@residencia.com',
    role:         'demo_admin',
    residenciaId: DEMO_RESIDENCIA_ID,
    displayName:  'Admin Demo',
    shift:        'morning',
    availability: 'available',
    isActive:     true,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\nProvisionando Firestore para tenant: ${DEMO_RESIDENCIA_ID}`);
  console.log('─'.repeat(55));

  const seed = buildSeedSnapshot() as {
    residents:   Array<{ id: string }>;
    staffMembers: Array<{ id: string }>;
    rounds:      Array<{ id: string }>;
    alerts:      Array<{ id: string }>;
    incidents:   Array<{ id: string }>;
    auditEvents: Array<{ id: string }>;
  };

  // 1. Datos operativos (de la semilla demo)
  await uploadCollection(DEMO_RESIDENCIA_ID, 'residents',  seed.residents);
  await uploadCollection(DEMO_RESIDENCIA_ID, 'staff',      seed.staffMembers);
  await uploadCollection(DEMO_RESIDENCIA_ID, 'rounds',     seed.rounds);
  await uploadCollection(DEMO_RESIDENCIA_ID, 'alerts',     seed.alerts);
  await uploadCollection(DEMO_RESIDENCIA_ID, 'incidents',  seed.incidents);
  await uploadCollection(DEMO_RESIDENCIA_ID, 'audit',      seed.auditEvents);

  // 2. Staff SSO (emails de Google Workspace → claims)
  console.log('\nProvisionando staff SSO:');
  const ssoRef = db.collection('staff');
  const batch  = db.batch();
  for (const member of STAFF_SSO) {
    const { id, ...data } = member;
    batch.set(
      ssoRef.doc(DEMO_RESIDENCIA_ID).collection('staff').doc(id),
      data,
      { merge: true }
    );
    console.log(`  ✓ ${member.email} → role: ${member.role}`);
  }
  await batch.commit();

  console.log('\n✓ Provisioning completo.');
  console.log('  Próximo paso: los usuarios deben hacer login con Google SSO.');
  console.log('  La Cloud Function setUserClaims inyectará los claims automáticamente.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error durante el provisioning:', err);
  process.exit(1);
});
