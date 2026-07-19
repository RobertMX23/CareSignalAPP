/**
 * demoClock.ts — Reloj de demostración determinista (contrato Chunk 3/7).
 *
 * No hay esperas reales: el tiempo "actual" de la demo es siempre
 * `clockStartTime + clockOffsetMinutes`, donde el offset se guarda a través del
 * repositorio (única capa de persistencia). Avanzar el reloj es una operación pura y
 * síncrona; dos ejecuciones desde el mismo estado producen siempre el mismo instante.
 *
 * Desde el Chunk 7, cada avance del reloj ejecuta el motor temporal
 * (`temporalEngine.ts`) para mantener rondas y alertas sincronizadas con la nueva
 * hora — "integra el reloj de demostración con las rondas y alertas".
 */

import type { ISODateTime } from '../domain/types';
import { getClockOffsetMinutes, getClockStartTime, setClockOffsetMinutes } from './repository';
import { runTemporalEngine } from './temporalEngine';

const computeTime = (startTime: ISODateTime, offsetMinutes: number): ISODateTime =>
  new Date(Date.parse(startTime) + offsetMinutes * 60_000).toISOString();

/** Instante simulado actual: hora de inicio de la semilla + minutos avanzados. */
export const getCurrentTime = (): ISODateTime =>
  computeTime(getClockStartTime(), getClockOffsetMinutes());

/** Avanza el reloj N minutos (N puede ser cualquier entero positivo) y resincroniza. */
export const advanceByMinutes = (minutes: number): ISODateTime => {
  setClockOffsetMinutes(getClockOffsetMinutes() + minutes);
  const now = getCurrentTime();
  runTemporalEngine(now);
  return now;
};

export const advanceOneMinute = (): ISODateTime => advanceByMinutes(1);
export const advanceFiveMinutes = (): ISODateTime => advanceByMinutes(5);
export const advanceFifteenMinutes = (): ISODateTime => advanceByMinutes(15);

/** Restablece el reloj a la hora inicial de la semilla (offset 0) y resincroniza. */
export const resetClock = (): ISODateTime => {
  setClockOffsetMinutes(0);
  const now = getCurrentTime();
  runTemporalEngine(now);
  return now;
};
