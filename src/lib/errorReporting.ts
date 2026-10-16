/**
 * errorReporting.ts — Reporte de errores inesperados del navegador (B-05).
 *
 * Hoy el destino es la consola con un formato estructurado y un identificador corto que la
 * persona usuaria puede citar. `registerErrorSink` deja la puerta abierta a un destino remoto
 * (por ejemplo un colector propio) sin tocar los componentes. No se envía nada fuera del
 * navegador: el MVP usa datos ficticios y no tiene backend de errores.
 *
 * Módulo sin React: lo usan el `ErrorBoundary`, `main.tsx` y las pruebas.
 */

export type ErrorSource = 'react-boundary' | 'window-error' | 'unhandled-rejection';

export interface ErrorReport {
  id: string;
  source: ErrorSource;
  message: string;
  stack?: string;
  componentStack?: string;
  at: string;
}

export type ErrorSink = (report: ErrorReport) => void;

const MAX_MESSAGE = 500;
const MAX_STACK = 4000;
const DEDUPE_WINDOW_MS = 1000;

const sinks = new Set<ErrorSink>();
let lastKey = '';
let lastAt = 0;
let lastReport: ErrorReport | undefined;

export const registerErrorSink = (sink: ErrorSink): (() => void) => {
  sinks.add(sink);
  return () => {
    sinks.delete(sink);
  };
};

/** Identificador corto y legible para citar en un reporte: `E-<hora base36>-<4 caracteres>`. */
export const newErrorId = (now: number = Date.now()): string =>
  `E-${now.toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const truncate = (text: string, max: number): string => (text.length > max ? `${text.slice(0, max)}…` : text);

const describe = (error: unknown): { message: string; stack?: string } => {
  if (error instanceof Error) {
    return { message: truncate(error.message || error.name, MAX_MESSAGE), stack: error.stack ? truncate(error.stack, MAX_STACK) : undefined };
  }
  if (typeof error === 'string') return { message: truncate(error, MAX_MESSAGE) };
  try {
    return { message: truncate(JSON.stringify(error) ?? String(error), MAX_MESSAGE) };
  } catch {
    return { message: 'Error no serializable' };
  }
};

/** Último reporte emitido (útil para mostrarlo en pantalla). */
export const getLastErrorReport = (): ErrorReport | undefined => lastReport;

/**
 * Registra un error. Devuelve el reporte; si es idéntico al anterior en menos de un segundo
 * (React puede avisar por varias vías) devuelve el existente sin duplicar el aviso.
 */
export const reportError = (
  error: unknown,
  source: ErrorSource,
  extra: { componentStack?: string } = {},
): ErrorReport => {
  const { message, stack } = describe(error);
  const now = Date.now();
  const key = `${source === 'react-boundary' ? 'ui' : 'win'}|${message}`;

  if (lastReport !== undefined && key === lastKey && now - lastAt < DEDUPE_WINDOW_MS) return lastReport;

  const report: ErrorReport = {
    id: newErrorId(now),
    source,
    message,
    stack,
    componentStack: extra.componentStack ? truncate(extra.componentStack, MAX_STACK) : undefined,
    at: new Date(now).toISOString(),
  };
  lastKey = key;
  lastAt = now;
  lastReport = report;

  console.error('CareSignal error', report);
  for (const sink of sinks) {
    try {
      sink(report);
    } catch {
      // Un destino defectuoso no debe provocar otro error.
    }
  }
  return report;
};

/** Reinicia el estado interno (solo para pruebas). */
export const resetErrorReportingForTests = (): void => {
  sinks.clear();
  lastKey = '';
  lastAt = 0;
  lastReport = undefined;
};

/** Escucha `error` y `unhandledrejection` de la ventana. Devuelve la función que los quita. */
export const installGlobalErrorHandlers = (target: Window = window): (() => void) => {
  const onError = (event: ErrorEvent): void => {
    reportError(event.error ?? event.message, 'window-error');
  };
  const onRejection = (event: PromiseRejectionEvent): void => {
    reportError(event.reason, 'unhandled-rejection');
  };
  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onRejection);
  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onRejection);
  };
};
