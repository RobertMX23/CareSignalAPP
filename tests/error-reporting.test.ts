/**
 * error-reporting.test.ts — Reporte de errores del navegador (B-05).
 *
 *   R-01  el identificador tiene formato E-XXXX-XXXX y es distinto entre errores
 *   R-02  normaliza Error, texto, objetos y valores no serializables; trunca lo largo
 *   R-03  escribe un solo console.error estructurado y avisa a los destinos registrados
 *   R-04  un destino que falla no provoca otro error; se puede dar de baja
 *   R-05  el mismo error en menos de 1 s no se duplica; uno distinto sí
 *   R-06  los manejadores globales reportan `error` y `unhandledrejection` y se pueden quitar
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getLastErrorReport,
  installGlobalErrorHandlers,
  newErrorId,
  registerErrorSink,
  reportError,
  resetErrorReportingForTests,
  type ErrorReport,
} from '../src/lib/errorReporting';

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  resetErrorReportingForTests();
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  consoleError.mockRestore();
  vi.useRealTimers();
});

describe('errorReporting', () => {
  it('R-01: id con formato y único', () => {
    const a = newErrorId();
    const b = newErrorId();
    expect(a).toMatch(/^E-[0-9A-Z]+-[0-9A-Z]{4}$/);
    expect(a).not.toBe(b);
  });

  it('R-02: normaliza distintos tipos y trunca', () => {
    expect(reportError(new Error('falló X'), 'window-error').message).toBe('falló X');
    expect(reportError('texto suelto', 'window-error').message).toBe('texto suelto');
    expect(reportError({ codigo: 7 }, 'window-error').message).toBe('{"codigo":7}');

    const circular: Record<string, unknown> = {};
    circular.yo = circular;
    expect(reportError(circular, 'window-error').message).toBe('Error no serializable');

    const largo = reportError(new Error('x'.repeat(2000)), 'window-error');
    expect(largo.message.length).toBeLessThanOrEqual(501);
    expect(largo.message.endsWith('…')).toBe(true);
    expect(largo.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('R-03: console.error estructurado y destinos avisados', () => {
    const recibidos: ErrorReport[] = [];
    registerErrorSink((r) => recibidos.push(r));
    const report = reportError(new Error('boom'), 'react-boundary', { componentStack: '\n    at Pagina' });

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][0]).toBe('CareSignal error');
    expect(recibidos).toEqual([report]);
    expect(report.source).toBe('react-boundary');
    expect(report.componentStack).toContain('Pagina');
    expect(getLastErrorReport()).toBe(report);
  });

  it('R-04: destino defectuoso no rompe; se puede dar de baja', () => {
    const bueno = vi.fn();
    registerErrorSink(() => {
      throw new Error('destino roto');
    });
    const baja = registerErrorSink(bueno);

    expect(() => reportError(new Error('a'), 'window-error')).not.toThrow();
    expect(bueno).toHaveBeenCalledTimes(1);

    baja();
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 5000);
    reportError(new Error('b'), 'window-error');
    expect(bueno).toHaveBeenCalledTimes(1);
  });

  it('R-05: deduplica el mismo error en menos de 1 s', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-16T10:00:00Z'));
    const sink = vi.fn();
    registerErrorSink(sink);

    const primero = reportError(new Error('repetido'), 'react-boundary');
    const segundo = reportError(new Error('repetido'), 'react-boundary');
    expect(segundo).toBe(primero);
    expect(sink).toHaveBeenCalledTimes(1);

    reportError(new Error('distinto'), 'react-boundary');
    expect(sink).toHaveBeenCalledTimes(2);

    vi.setSystemTime(new Date('2026-10-16T10:00:02Z'));
    reportError(new Error('repetido'), 'react-boundary');
    expect(sink).toHaveBeenCalledTimes(3);
  });

  it('R-06: manejadores globales de error y promesas', () => {
    const sink = vi.fn();
    registerErrorSink(sink);
    // Objetivo aislado: un ErrorEvent real sobre `window` lo marcaría Vitest como error no manejado.
    const objetivo = new EventTarget();
    const quitar = installGlobalErrorHandlers(objetivo as unknown as Window);

    objetivo.dispatchEvent(new ErrorEvent('error', { message: 'fallo global', error: new Error('fallo global') }));
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink.mock.calls[0][0].source).toBe('window-error');

    const rechazo = new Event('unhandledrejection') as PromiseRejectionEvent;
    Object.defineProperty(rechazo, 'reason', { value: new Error('promesa rota') });
    objetivo.dispatchEvent(rechazo);
    expect(sink).toHaveBeenCalledTimes(2);
    expect(sink.mock.calls[1][0].source).toBe('unhandled-rejection');
    expect(sink.mock.calls[1][0].message).toBe('promesa rota');

    quitar();
    objetivo.dispatchEvent(new ErrorEvent('error', { message: 'otro', error: new Error('otro') }));
    expect(sink).toHaveBeenCalledTimes(2);
  });
});
