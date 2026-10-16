/**
 * TourContext.tsx — Estado del recorrido guiado (L-05 / B-08).
 * Capa de presentación: no modifica dominio, reglas ni transiciones.
 */

import { createContext, useContext } from 'react';
import type { TourStep } from './tours';

export interface TourContextValue {
  active: boolean;
  steps: TourStep[];
  stepIndex: number;
  /** `false` si el rol activo no tiene recorrido (p. ej. demo_admin). */
  canStart: boolean;
  /** Restablece la demo y empieza el recorrido del rol activo. */
  start: () => void;
  next: () => void;
  prev: () => void;
  close: () => void;
}

const noop = (): void => undefined;

export const TourContext = createContext<TourContextValue>({
  active: false,
  steps: [],
  stepIndex: 0,
  canStart: false,
  start: noop,
  next: noop,
  prev: noop,
  close: noop,
});

export const useTour = (): TourContextValue => useContext(TourContext);
