/**
 * app.ts — Backend Express para Cloud Run.
 *
 * Todas las rutas están protegidas por requireAuth (JWT Firebase).
 * Los handlers usan req.user.residenciaId para filtrar datos del tenant.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requireAuth } from './middleware/auth';
import { roundsRouter } from './routes/rounds';
import { alertsRouter } from './routes/alerts';
import { auditRouter  } from './routes/audit';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? '*',
  methods: ['GET', 'POST', 'PUT'],
}));
app.use(express.json({ limit: '1mb' }));

// Health check (sin auth — usado por Cloud Run liveness probe)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Rutas protegidas
app.use('/rounds',   requireAuth, roundsRouter);
app.use('/alerts',   requireAuth, alertsRouter);
app.use('/audit',    requireAuth, auditRouter);

// 404 catch-all
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = parseInt(process.env.PORT ?? '8080', 10);
app.listen(PORT, () => {
  console.log(`CareSignal API listening on :${PORT}`);
});

export default app;
