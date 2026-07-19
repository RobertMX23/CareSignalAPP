/**
 * RequestSupportModal.tsx — Diálogo "Solicitar apoyo" (contrato Chunk 5).
 *
 * Pide la severidad de la alerta a crear; el resto (registrar al cuidador, generar
 * AuditEvent, evitar duplicados) lo resuelve `roundOperations.requestSupport`.
 */

import { useState } from 'react';
import { useAutoFocusModal } from '../../components/useAutoFocusModal';
import type { AlertSeverity } from '../../domain/taxonomy';

interface RequestSupportModalProps {
  residentName: string;
  onCancel: () => void;
  onConfirm: (severity: AlertSeverity) => void;
}

export const RequestSupportModal = ({ residentName, onCancel, onConfirm }: RequestSupportModalProps): JSX.Element => {
  const [severity, setSeverity] = useState<AlertSeverity>('yellow');
  const { containerRef, handleKeyDown } = useAutoFocusModal<HTMLDivElement>(onCancel);

  return (
    <div className="modal-overlay" role="presentation" onKeyDown={handleKeyDown}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="request-support-title" ref={containerRef}>
        <h2 id="request-support-title">Solicitar apoyo — {residentName}</h2>

        <fieldset className="modal-fieldset">
          <legend>Severidad</legend>
          <label className="modal-radio">
            <input
              type="radio"
              name="support-severity"
              value="yellow"
              checked={severity === 'yellow'}
              onChange={() => setSeverity('yellow')}
            />
            Amarilla — atención requerida
          </label>
          <label className="modal-radio">
            <input
              type="radio"
              name="support-severity"
              value="red"
              checked={severity === 'red'}
              onChange={() => setSeverity('red')}
            />
            Roja — urgente
          </label>
        </fieldset>

        <div className="modal-actions">
          <button type="button" className="button button--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="button" onClick={() => onConfirm(severity)}>
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  );
};
