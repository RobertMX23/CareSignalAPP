import { Router } from 'express';
import { db } from '../firebaseAdmin';
import { requireRole } from '../middleware/auth';

export const alertsRouter = Router();

// GET /alerts
alertsRouter.get('/', async (req, res) => {
  const { residenciaId } = req.user!;
  try {
    const snap = await db
      .collection('alerts').doc(residenciaId)
      .collection('alerts')
      .orderBy('createdAt', 'desc')
      .get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: 'Error fetching alerts' });
  }
});

// GET /alerts/:id
alertsRouter.get('/:id', async (req, res) => {
  const { residenciaId } = req.user!;
  const doc = await db
    .collection('alerts').doc(residenciaId)
    .collection('alerts').doc(req.params.id).get();
  if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ id: doc.id, ...doc.data() });
});

// PUT /alerts/:id — solo supervisor
alertsRouter.put('/:id', requireRole('supervisor', 'demo_admin'), async (req, res) => {
  const { residenciaId } = req.user!;
  const ref = db.collection('alerts').doc(residenciaId)
                .collection('alerts').doc(req.params.id);
  const existing = await ref.get();
  if (!existing.exists) { res.status(404).json({ error: 'Not found' }); return; }
  await ref.update({ ...req.body, updatedAt: new Date().toISOString() });
  res.json({ ok: true });
});
