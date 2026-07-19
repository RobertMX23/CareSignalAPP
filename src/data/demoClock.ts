/**
 * demoClock.ts — Reloj de demostración determinista (contrato Chunk 3).
 *
 * No hay esperas reales: el tiempo "actual" de la demo es siempre
 * `clockStartTime + clockOffsetMinutes`, donde el offset se guarda a través del
 * repositorio (única capa de persistencia). Avanzar el reloj es una operación pura y
 * síncrona; dos ejecuciones desde el mismo estado producen siempre el mismo instante.
 */

import type { ISODateTime } from '../domain/types';
import { getClockOffsetMinutes, getClockStartTime, setClockOffsetMinutes } from './repository';

const computeTime = (startTime: ISODateTime, offsetMinutes: number): ISODateTime =>
  new Date(Date.parse(startTime) + offsetMinutes * 60_000).toISOString();

/** Instante simulado actual: hora de inicio de la semilla + minutos avanzados. */
export const getCurrentTime = (): ISODateTime =>
  computeTime(getClockStartTime(), getClockOffsetMinutes());

const advanceBy = (minutes: number): ISODateTime => {
  setClockOffsetMinutes(getClockOffsetMinutes() + minutes);
  return getCurrentTime();
};

export const advanceOneMinute = (): ISODateTime => advanceBy(1);
export const advanceFiveMinutes = (): ISODateTime => advanceBy(5);
export const advanceFifteenMinutes = (): ISODateTime => advanceBy(15);

/** Restablece el reloj a la hora inicial de la semilla (offset 0). */
export const resetClock = (): ISODateTime => {
  setClockOffsetMinutes(0);
  return getCurrentTime();
};
