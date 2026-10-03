import { useEffect } from 'react';
import { listResidents } from '../data/repository';
import { useToast } from './ToastContext';

interface AlertNotificationDetail {
  type: 'created' | 'escalated';
  severity: 'yellow' | 'red';
  residentId: string;
}

const SEVERITY_ICON: Record<'yellow' | 'red', string> = {
  yellow: '🟡',
  red: '🔴',
};

const TYPE_LABEL: Record<'created' | 'escalated', string> = {
  created:   'Alerta generada',
  escalated: 'Alerta escalada a roja',
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
    <div className="toast-container" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.severity}`}>
          <span className="toast__icon" aria-hidden="true">{SEVERITY_ICON[toast.severity]}</span>
          <div className="toast__body">
            <span className="toast__name">{toast.residentName}</span>
            <span className="toast__message">{TYPE_LABEL[toast.type]}</span>
          </div>
          <button
            type="button"
            className="toast__close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
