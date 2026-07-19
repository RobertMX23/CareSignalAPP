/**
 * resetDemo.ts — Punto de entrada único para restablecer la demo (contrato Chunk 3).
 *
 * Usado por el futuro botón "restablecer demo" (Chunk 4). Delegar en
 * `repository.resetToSeed()` es suficiente: la semilla fresca ya fija
 * `clockOffsetMinutes` en 0, por lo que datos y reloj quedan sincronizados en un solo
 * paso determinista, sin esperas reales.
 */

import { resetToSeed, type DemoStore } from './repository';

/** Restablece datos, auditoría y reloj a la semilla determinista original. */
export const resetDemo = (): DemoStore => resetToSeed();
