/**
 * TourProvider.tsx — Motor del recorrido guiado (L-05 / B-08).
 *
 * Debe montarse dentro de <Router> y de <DemoSessionProvider>. Al iniciar restablece la
 * demo (vía `resetDemo`, que delega en el repositorio) para partir de un estado
 * determinista, y navega paso a paso entre rutas. Nada se persiste.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDemoSession } from '../../components/DemoSessionContext';
import { resetDemo } from '../../data/resetDemo';
import { TourContext, type TourContextValue } from './TourContext';
import { TourOverlay } from './TourOverlay';
import { getTourForRole, type TourStep } from './tours';

/** `VITE_TOUR_AUTOSTART=off` desactiva el inicio automático (la suite E2E lo usa). */
const autostartEnabled = (): boolean => import.meta.env.VITE_TOUR_AUTOSTART !== 'off';

export const TourProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const { activeStaff, refreshDemoData } = useDemoSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [active, setActive] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const canStart = getTourForRole(activeStaff.role) !== undefined;

  const start = useCallback((): void => {
    const tour = getTourForRole(activeStaff.role);
    if (tour === undefined) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    resetDemo();
    refreshDemoData();
    setSteps(tour);
    setStepIndex(0);
    setActive(true);
    navigate(tour[0].route, { replace: true });
  }, [activeStaff.role, navigate, refreshDemoData]);

  const close = useCallback((): void => {
    setActive(false);
    setSteps([]);
    setStepIndex(0);
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  }, []);

  const next = useCallback((): void => {
    if (stepIndex >= steps.length - 1) {
      close();
      return;
    }
    setStepIndex(stepIndex + 1);
  }, [stepIndex, steps.length, close]);

  const prev = useCallback((): void => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Inicio automático: la pantalla de perfiles navega con `state.startTour`.
  useEffect(() => {
    const state = location.state as { startTour?: boolean } | null;
    if (state?.startTour === true && autostartEnabled() && !active) start();
    // Solo reacciona a cambios de navegación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Cada paso lleva a su ruta.
  useEffect(() => {
    if (!active) return;
    const step = steps[stepIndex];
    if (step !== undefined && location.pathname !== step.route) {
      navigate(step.route, { replace: true });
    }
    // `location.pathname` se omite a propósito: no debe forzar la ruta si el usuario navega.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex, steps]);

  const value = useMemo<TourContextValue>(
    () => ({ active, steps, stepIndex, canStart, start, next, prev, close }),
    [active, steps, stepIndex, canStart, start, next, prev, close],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      {active && steps[stepIndex] !== undefined && <TourOverlay />}
    </TourContext.Provider>
  );
};
