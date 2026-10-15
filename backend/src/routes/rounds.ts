/**
 * rounds.ts — Rutas de rondas para la API de Cloud Run.
 *
 * Todas las queries filtran por req.user.residenciaId — nunca se exponen datos
 * de otro tenant aunque el token sea válido para una residenciaId diferente.
 */

import { Router } from 'express';
import { db } from '../firebaseAdmin';
import { requireRole } from '../middleware/auth';

export const roundsRouter = Router();

// GET /rounds — lista rondas del tenant
roundsRouter.get('/', async (req, res) => {
  const { residenciaId } = req.user!;
  try {
    const snap = await db
      .collection('rounds')
      .doc(residenciaId)
      .collection('rounds')
      .orderBy('scheduledAt', 'asc')
      .get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: 'Error fetching rounds' });
  }
});

// GET /rounds/:id
roundsRouter.get('/:id', async (req, res) => {
  const { residenciaId } = req.user!;
  const doc = await db
    .collection('rounds').doc(residenciaId)
    .collection('rounds').doc(req.params.id)
    .get();
  if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ id: doc.id, ...doc.data() });
});

// PUT /rounds/:id — supervisor o cuidador asignado
roundsRouter.put('/:id', async (req, res) => {
  const { residenciaId, staffId, role } = req.user!;
  const ref = db.collection('rounds').doc(residenciaId)
                .collection('rounds').doc(req.params.id);
  const existing = await ref.get();
  if (!existing.exists) { res.status(404).json({ error: 'Not found' }); return; }

  const data = existing.data()!;
  const isSupervisor = ['supervisor', 'demo_admin'].includes(role);
  const isAssigned   = data.assignedStaffId === staffId;

  if (!isSupervisor && !isAssigned) {
    res.status(403).json({ error: 'Not authorized to update this round' });
    return;
  }

  await ref.update({ ...req.body, updatedAt: new Date().toISOString() });
  res.json({ ok: true });
});

// POST /rounds — solo supervisor
roundsRouter.post('/', requireRole('supervisor', 'demo_admin'), async (req, res) => {
  const { residenciaId } = req.user!;
  const ref = await db
    .collection('rounds').doc(residenciaId)
    .collection('rounds').add(req.body);
  res.status(201).json({ id: ref.id });
});
