/**
 * toast.test.tsx — Pruebas unitarias del sistema de notificaciones (E5 L-01).
 *
 * Cubre:
 *   U-T01  TOAST_DURATION_MS exportada vale 5_000
 *   U-T02  pushToast añade un toast (longitud 1)
 *   U-T03  orden newest-first: tres pushToast → el último es toasts[0]
 *   U-T04  MAX_TOASTS=3: cuatro pushToast → toasts.length === 3, el más antiguo desaparece
 *   U-T05  IDs únicos: cuatro pushToast consecutivos → sin colisiones
 *   U-T06  dismissToast(id) elimina exactamente ese toast y conserva el resto
 *   U-T07  dismissToast con id inexistente no modifica el array
 *   U-T08  (L01-03) auto-dismiss: el toast se desmonta tras TOAST_DURATION_MS ms
 *   U-T09  (L01-04) click en botón × llama onDismiss de inmediato
 *   U-T10  pause en mouseenter + resume en mouseleave: el timer no dispara durante hover
 *   U-T11  severity="red"    → role="alert"  + aria-live="assertive"
 *   U-T12  severity="yellow" → role="status" + aria-live="polite"
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import {
  TOAST_DURATION_MS,
  ToastProvider,
  useToast,
  type Toast,
} from '../src/components/ToastContext';
import { ToastItem } from '../src/components/ToastContainer';

// ─── helpers ──────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

const makePayload = (
  overrides: Partial<Omit<Toast, 'id'>> = {},
): Omit<Toast, 'id'> => ({
  severity: 'yellow',
  residentName: 'Residente Test',
  type: 'created',
  ...overrides,
});

const makeToast = (overrides: Partial<Toast> = {}): Toast => ({
  id: 'toast-test-1',
  severity: 'yellow',
  residentName: 'Residente Test',
  type: 'created',
  ...overrides,
});

// ─── Bloque 1 — Constantes exportadas ─────────────────────────────────────────

describe('Toast L-01 — constantes exportadas', () => {
  it('U-T01 TOAST_DURATION_MS es 5_000', () => {
    expect(TOAST_DURATION_MS).toBe(5_000);
  });
});

// ─── Bloque 2 — pushToast y dismissToast ──────────────────────────────────────

describe('Toast L-01 — pushToast y dismissToast', () => {
  it('U-T02 pushToast añade un toast al array (longitud 1)', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current.toasts).toHaveLength(0);

    act(() => {
      result.current.pushToast(makePayload());
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it('U-T03 orden newest-first: tres pushToast → el último en entrar es toasts[0]', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.pushToast(makePayload({ residentName: 'Primero' }));
      result.current.pushToast(makePayload({ residentName: 'Segundo' }));
      result.current.pushToast(makePayload({ residentName: 'Tercero' }));
    });

    expect(result.current.toasts[0].residentName).toBe('Tercero');
    expect(result.current.toasts[2].residentName).toBe('Primero');
  });

  it('U-T04 MAX_TOASTS=3: cuatro pushToast → longitud 3, el más antiguo desaparece', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.pushToast(makePayload({ residentName: 'Antiguo' }));
      result.current.pushToast(makePayload({ residentName: 'Segundo' }));
      result.current.pushToast(makePayload({ residentName: 'Tercero' }));
      result.current.pushToast(makePayload({ residentName: 'Nuevo' }));
    });

    expect(result.current.toasts).toHaveLength(3);
    const nombres = result.current.toasts.map((t) => t.residentName);
    expect(nombres).not.toContain('Antiguo');
    expect(nombres[0]).toBe('Nuevo');
  });

  it('U-T05 IDs únicos: cuatro pushToast consecutivos sin colisiones', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.pushToast(makePayload());
      result.current.pushToast(makePayload());
      result.current.pushToast(makePayload());
      result.current.pushToast(makePayload());
    });

    const ids = result.current.toasts.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('U-T06 dismissToast(id) elimina ese toast y conserva el resto', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.pushToast(makePayload({ residentName: 'A' }));
      result.current.pushToast(makePayload({ residentName: 'B' }));
    });

    const idToRemove = result.current.toasts.find((t) => t.residentName === 'A')!.id;

    act(() => {
      result.current.dismissToast(idToRemove);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].residentName).toBe('B');
  });

  it('U-T07 dismissToast con id inexistente no modifica el array', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.pushToast(makePayload());
    });

    act(() => {
      result.current.dismissToast('id-que-no-existe');
    });

    expect(result.current.toasts).toHaveLength(1);
  });
});

// ─── Bloque 3 — ToastItem timer (fake timers) ─────────────────────────────────

describe('Toast L-01 — ToastItem timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('U-T08 (L01-03) auto-dismiss tras TOAST_DURATION_MS ms', () => {
    const onDismiss = vi.fn();
    render(<ToastItem toast={makeToast()} onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS);
    });

    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledWith('toast-test-1');
  });

  it('U-T09 (L01-04) click en × llama onDismiss de inmediato', () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(<ToastItem toast={makeToast()} onDismiss={onDismiss} />);

    fireEvent.click(getByRole('button', { name: /cerrar notificación/i }));

    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledWith('toast-test-1');
  });

  it('U-T10 pause en mouseenter: timer no dispara durante hover; retoma en mouseleave', () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(
      <ToastItem toast={makeToast({ severity: 'red' })} onDismiss={onDismiss} />,
    );
    const toastEl = getByRole('alert');

    // Pausar antes de que el timer venza
    fireEvent.mouseEnter(toastEl);
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS + 1_000);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    // Reanudar: el timer reinicia y debe disparar tras TOAST_DURATION_MS
    fireEvent.mouseLeave(toastEl);
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS);
    });
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

// ─── Bloque 4 — ARIA por severidad ────────────────────────────────────────────

describe('Toast L-01 — ARIA por severidad', () => {
  it('U-T11 severity="red" → role="alert" + aria-live="assertive"', () => {
    const { container } = render(
      <ToastItem toast={makeToast({ severity: 'red' })} onDismiss={vi.fn()} />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('alert');
    expect(el.getAttribute('aria-live')).toBe('assertive');
  });

  it('U-T12 severity="yellow" → role="status" + aria-live="polite"', () => {
    const { container } = render(
      <ToastItem toast={makeToast({ severity: 'yellow' })} onDismiss={vi.fn()} />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
  });
});
