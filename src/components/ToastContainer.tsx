import { useCallback, useEffect, useRef } from 'react';
import { listResidents } from '../data/repository';
import { TOAST_DURATION_MS, useToast, type Toast } from './ToastContext';

interface AlertNotificationDetail {
  type: 'created' | 'escalated';
  severity: 'yellow' | 'red';
  residentId: string;
}

const SEVERITY_ICON: Record<'yellow' | 'red', string> = {
  yellow: '🟡',
  red:    '🔴',
};

const TYPE_LABEL: Record<'created' | 'escalated', string> = {
  created:   'Alerta generada',
  escalated: 'Alerta escalada a roja',
};

// WCAG 2.2 / WAI-ARIA APG: red alerts are urgent → role="alert" + assertive.
// Yellow alerts are informational → role="status" + polite.
const ARIA_BY_SEVERITY: Record<'yellow' | 'red', { role: string; ariaLive: 'polite' | 'assertive' }> = {
  yellow: { role: 'status', ariaLive: 'polite'    },
  red:    { role: 'alert',  ariaLive: 'assertive' },
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export const ToastItem = ({ toast, onDismiss }: ToastItemProps): JSX.Element => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback((): void => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
  }, [toast.id, onDismiss]);

  const stop = useCallback((): void => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Start timer on mount; cancel on unmount.
  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  // Resume only when focus leaves the entire toast element (not between children).
  const handleBlur = (e: React.FocusEvent): void => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) start();
  };

  const { role, ariaLive } = ARIA_BY_SEVERITY[toast.severity];

  return (
    <div
      className={`toast toast--${toast.severity}`}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      onMouseEnter={stop}
      onMouseLeave={start}
      onFocus={stop}
      onBlur={handleBlur}
    >
      <span className="toast__icon" aria-hidden="true">{SEVERITY_ICON[toast.severity]}</span>
      <div className="toast__body">
        <span className="toast__name">{toast.residentName}</span>
        <span className="toast__message">{TYPE_LABEL[toast.type]}</span>
      </div>
      <button
        type="button"
        className="toast__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
      >×</button>
    </div>
  );
};

export const ToastContainer = (): JSX.Element => {
  const { toasts, pushToast, dismissToast } = useToast();

  useEffect(() => {
    const handler = (e: Event): void => {
      const { type, severity, residentId } = (e as CustomEvent<AlertNotificationDetail>).detail;
      const resident = listResidents().find((r) => r.id === residentId);
      pushToast({
        severity,
        residentName: resident?.displayName ?? 'Residente',
        type,
      });
    };
    window.addEventListener('caresignal:alert', handler);
    return () => window.removeEventListener('caresignal:alert', handler);
  }, [pushToast]);

  if (toasts.length === 0) return <></>;

  return (
    <div className="toast-container" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};
