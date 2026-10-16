/**
 * error-boundary.test.tsx — ErrorBoundary de dos niveles (B-05).
 *
 *   B-01  sin error, muestra a los hijos y no interfiere
 *   B-02  nivel página: alerta con código, avisos del contrato y el resto de la UI intacta
 *   B-03  "Reintentar" recupera cuando el problema desaparece
 *   B-04  cambiar `resetKey` (otra ruta) limpia el error
 *   B-05  nivel app: pantalla completa con avisos y botón de restablecer
 *   B-06  el error se reporta una sola vez, con pila de componentes
 *   B-07  "Restablecer demo y recargar" llama a resetDemo y recarga
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { registerErrorSink, resetErrorReportingForTests, type ErrorReport } from '../src/lib/errorReporting';

const resetDemoMock = vi.fn();
vi.mock('../src/data/resetDemo', () => ({ resetDemo: () => resetDemoMock() }));

let consoleError: ReturnType<typeof vi.spyOn>;
let fallo = true;

const Bomba = (): JSX.Element => {
  if (fallo) throw new Error('boom de prueba');
  return <p>contenido sano</p>;
};

beforeEach(() => {
  fallo = true;
  resetDemoMock.mockReset();
  resetErrorReportingForTests();
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  consoleError.mockRestore();
});

describe('ErrorBoundary', () => {
  it('B-01: sin error muestra a los hijos', () => {
    fallo = false;
    render(
      <ErrorBoundary level="page">
        <Bomba />
      </ErrorBoundary>,
    );
    expect(screen.getByText('contenido sano')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('B-02: nivel página muestra alerta, código y avisos; el resto sigue visible', () => {
    render(
      <div>
        <nav>navegación intacta</nav>
        <ErrorBoundary level="page">
          <Bomba />
        </ErrorBoundary>
      </div>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Esta pantalla tuvo un problema')).toBeTruthy();
    expect(screen.getByText(/E-[0-9A-Z]+-[0-9A-Z]{4}/)).toBeTruthy();
    expect(screen.getByText(/no dispositivo médico/i)).toBeTruthy();
    expect(screen.getByText('navegación intacta')).toBeTruthy();
    expect(screen.queryByText(/boom de prueba/)).toBeNull();
  });

  it('B-03: Reintentar recupera cuando el problema desaparece', () => {
    render(
      <ErrorBoundary level="page">
        <Bomba />
      </ErrorBoundary>,
    );
    fallo = false;
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(screen.getByText('contenido sano')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('B-04: cambiar resetKey limpia el error', () => {
    const { rerender } = render(
      <ErrorBoundary level="page" resetKey="/rondas">
        <Bomba />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    fallo = false;
    rerender(
      <ErrorBoundary level="page" resetKey="/alertas">
        <Bomba />
      </ErrorBoundary>,
    );
    expect(screen.getByText('contenido sano')).toBeTruthy();
  });

  it('B-05: nivel app muestra pantalla completa con avisos', () => {
    render(
      <ErrorBoundary level="app">
        <Bomba />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Algo salió mal')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Restablecer demo y recargar' })).toBeTruthy();
    expect(screen.getByText(/MVP operacional, no dispositivo médico/)).toBeTruthy();
    expect(screen.getByText(/datos ficticios/i)).toBeTruthy();
  });

  it('B-06: reporta una sola vez, con pila de componentes', () => {
    const recibidos: ErrorReport[] = [];
    registerErrorSink((r) => recibidos.push(r));
    render(
      <ErrorBoundary level="page">
        <Bomba />
      </ErrorBoundary>,
    );
    expect(recibidos).toHaveLength(1);
    expect(recibidos[0].source).toBe('react-boundary');
    expect(recibidos[0].message).toBe('boom de prueba');
    expect(recibidos[0].componentStack).toContain('Bomba');
  });

  it('B-07: Restablecer demo y recargar llama a resetDemo y recarga', () => {
    const recargar = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', { value: { ...original, reload: recargar }, writable: true, configurable: true });

    render(
      <ErrorBoundary level="app">
        <Bomba />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer demo y recargar' }));
    expect(resetDemoMock).toHaveBeenCalledTimes(1);
    expect(recargar).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true });
  });
});
