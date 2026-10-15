import { Router } from 'express';
import { db } from '../firebaseAdmin';

export const auditRouter = Router();

// GET /audit — paginado (últimas 100 entradas)
auditRouter.get('/', async (req, res) => {
  const { residenciaId } = req.user!;
  try {
    const snap = await db
      .collection('audit').doc(residenciaId)
      .collection('audit')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: 'Error fetching audit log' });
  }
});

// POST /audit — append-only; cualquier usuario autenticado del tenant
auditRouter.post('/', async (req, res) => {
  const { residenciaId } = req.user!;
  try {
    const ref = await db
      .collection('audit').doc(residenciaId)
      .collection('audit').add({
        ...req.body,
        residenciaId,
        timestamp: new Date().toISOString(),
      });
    res.status(201).json({ id: ref.id });
  } catch {
    res.status(500).json({ error: 'Error writing audit event' });
  }
});
