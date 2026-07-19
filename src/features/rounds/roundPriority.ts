/**
 * roundPriority.ts — Clasificación y orden de "Mis rondas" (contrato Chunk 5).
 *
 * Puro: no hace IO. Orden exigido: 1) alertas/rondas rojas, 2) rondas amarillas,
 * 3) en progreso, 4) próximas, 5) completadas. El matiz "amarillo por ronda" se
 * expresa vía alerta activa amarilla (no existe un `RoundStatus` amarillo — ver
 * `domain/rules.ts`); una ronda `overdue` sin alerta activa roja también cuenta como
 * roja, porque "vencida" ya es la condición más urgente por sí sola.
 */

import type { Alert, ISODateTime, Round } from '../../domain/types';
import { isAlertActive } from '../../domain/rules';

export type RoundPriorityBucket = 'red' | 'yellow' | 'in_progress' | 'upcoming' | 'done';

const BUCKET_ORDER: Record<RoundPriorityBucket, number> = {
  red: 0,
  yellow: 1,
  in_progress: 2,
  upcoming: 3,
  done: 4,
};

export const classifyRoundPriority = (round: Round, roundAlerts: readonly Alert[]): RoundPriorityBucket => {
  const active = roundAlerts.filter((a) => isAlertActive(a.status));
  if (active.some((a) => a.severity === 'red') || round.status === 'overdue') return 'red';
  if (active.some((a) => a.severity === 'yellow')) return 'yellow';
  if (round.status === 'in_progress') return 'in_progress';
  if (round.status === 'completed' || round.status === 'cancelled') return 'done';
  return 'upcoming';
};

export const bucketLabel = (bucket: RoundPriorityBucket, round: Round): string => {
  switch (bucket) {
    case 'red':
      return 'Roja — urgente';
    case 'yellow':
      return 'Amarilla — atención';
    case 'in_progress':
      return 'En progreso';
    case 'upcoming':
      return 'Próxima';
    case 'done':
      return round.status === 'cancelled' ? 'Cancelada' : 'Completada';
    default:
      return bucket;
  }
};

export const compareByPriority = (
  a: { round: Round; bucket: RoundPriorityBucket },
  b: { round: Round; bucket: RoundPriorityBucket },
): number => {
  const bucketDiff = BUCKET_ORDER[a.bucket] - BUCKET_ORDER[b.bucket];
  return bucketDiff !== 0 ? bucketDiff : a.round.scheduledAt.localeCompare(b.round.scheduledAt);
};

/** Texto de retraso frente al reloj simulado; `undefined` si no aplica (aún no vence o ya es terminal). */
export const describeDelay = (round: Round, currentTime: ISODateTime): string | undefined => {
  if (round.status === 'completed' || round.status === 'cancelled') return undefined;
  const delayMinutes = Math.floor((Date.parse(currentTime) - Date.parse(round.dueAt)) / 60_000);
  if (delayMinutes <= 0) return undefined;
  const hours = Math.floor(delayMinutes / 60);
  const minutes = delayMinutes % 60;
  return hours > 0 ? `Retraso: ${hours} h ${minutes} min` : `Retraso: ${minutes} min`;
};
