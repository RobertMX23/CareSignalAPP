/**
 * ResolveAlertModal.tsx — Diálogo "Registrar resultado y resolver" (contrato Chunk 6).
 *
 * El dominio exige el resultado de verificación como parte de la misma transición
 * `in_verification → resolved` (regla 8), así que esta pantalla cubre a la vez
 * "registrar resultado" y "resolver". Resultados operacionales únicamente, sin
 * categorías clínicas (contrato).
 */

import { useState } from 'react';
import { useAutoFocusModal } from '../../components/useAutoFocusModal';
import type { VerificationOutcome } from '../../domain/taxonomy';

const OUTCOME_OPTIONS: { value: VerificationOutcome; label: string }[] = [
  { value: 'resident_confirmed_ok', label: 'Residente confirmado sin novedades' },
  { value: 'assistance_provided', label: 'Se brindó asistencia' },
  { value: 'caregiver_support_required', label: 'Requirió apoyo del cuidador' },
  { value: 'supervisor_follow_up_required', label: 'Requiere seguimiento del supervisor' },
  { value: 'false_alert', label: 'Alerta falsa' },
  { value: 'other_operational_result', label: 'Otro resultado operacional' },
];

interface ResolveAlertModalProps {
  residentName: string;
  onCancel: () => void;
  onConfirm: (outcome: VerificationOutcome) => void;
}

export const ResolveAlertModal = ({ residentName, onCancel, onConfirm }: ResolveAlertModalProps): JSX.Element => {
  const [outcome, setOutcome] = useState<VerificationOutcome | undefined>(undefined);
  const { containerRef, handleKeyDown } = useAutoFocusModal<HTMLDivElement>(onCancel);

  return (
    <div className="modal-overlay" role="presentation" onKeyDown={handleKeyDown}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="resolve-alert-title" ref={containerRef}>
        <h2 id="resolve-alert-title">Registrar resultado — {residentName}</h2>

        <fieldset className="modal-fieldset">
          <legend>Resultado de verificación (obligatorio)</legend>
          {OUTCOME_OPTIONS.map((option) => (
            <label key={option.value} className="modal-radio">
              <input
                type="radio"
                name="verification-outcome"
                value={option.value}
                checked={outcome === option.value}
                onChange={() => setOutcome(option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <div className="modal-actions">
          <button type="button" className="button button--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="button"
            disabled={outcome === undefined}
            onClick={() => outcome !== undefined && onConfirm(outcome)}
          >
            Registrar y resolver
          </button>
        </div>
      </div>
    </div>
  );
};
