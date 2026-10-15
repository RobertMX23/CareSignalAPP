/**
 * setUserClaims.ts — Cloud Function triggered al crear un usuario en Firebase Auth.
 *
 * Busca al usuario en la colección `staff` (query por email sobre todos los tenants
 * usando collectionGroup). Si lo encuentra, inyecta los custom claims:
 *   { role, residenciaId, staffId }
 *
 * Si el email no está provisionado en Firestore, el usuario queda sin claims
 * y el backend devolverá 403 en cada request (no puede operar la app).
 *
 * IMPORTANTE: los custom claims solo se reflejan en nuevos tokens; el cliente
 * debe llamar user.getIdToken(true) después del primer login para forzar el refresh.
 */

import * as functions from 'firebase-functions/v2';
import { auth, db } from '../firebaseAdmin';

interface StaffDoc {
  email: string;
  role: string;
  residenciaId: string;
  displayName: string;
}

export const setUserClaims = functions.auth.user().onCreate(async (user) => {
  if (!user.email) return;

  const snap = await db
    .collectionGroup('staff')
    .where('email', '==', user.email)
    .limit(1)
    .get();

  if (snap.empty) {
    // Usuario no provisionado — sin claims, sin acceso al producto
    functions.logger.warn('setUserClaims: email no provisionado', { email: user.email });
    return;
  }

  const doc   = snap.docs[0];
  const data  = doc.data() as StaffDoc;

  await auth.setCustomUserClaims(user.uid, {
    role:         data.role,
    residenciaId: data.residenciaId,
    staffId:      doc.id,
  });

  functions.logger.info('setUserClaims: claims inyectados', {
    uid:          user.uid,
    role:         data.role,
    residenciaId: data.residenciaId,
    staffId:      doc.id,
  });
});
