/**
 * CompleteRoundModal.tsx — Diálogo "Completar ronda" (contrato Chunk 5).
 *
 * Pide confirmación, nota corta opcional y un resultado operacional obligatorio (sin
 * categorías clínicas). Overlay propio en vez de `window.confirm`/`prompt` para poder
 * incluir el selector de resultado y para no bloquear la página con un diálogo nativo.
 */

import { useState } from 'react';
import { useAutoFocusModal } from '../../components/useAutoFocusModal';
import type { RoundCompletionOutcome } from './roundOperations';

const OUTCOME_OPTIONS: { value: RoundCompletionOutcome; label: string }[] = [
  { value: 'completed_without_issue', label: 'Completada sin novedades' },
  { value: 'assistance_requested', label: 'Se solicitó asistencia adicional' },
  { value: 'supervisor_verification_required', label: 'Requiere verificación del supervisor' },
];

interface CompleteRoundModalProps {
  residentName: string;
  onCancel: () => void;
  onConfirm: (outcome: RoundCompletionOutcome, note: string | undefined) => void;
}

export const CompleteRoundModal = ({ residentName, onCancel, onConfirm }: CompleteRoundModalProps): JSX.Element => {
  const [outcome, setOutcome] = useState<RoundCompletionOutcome | undefined>(undefined);
  const [note, setNote] = useState('');
  const { containerRef, handleKeyDown } = useAutoFocusModal<HTMLDivElement>(onCancel);

  return (
    <div className="modal-overlay" role="presentation" onKeyDown={handleKeyDown}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="complete-round-title" ref={containerRef}>
        <h2 id="complete-round-title">Completar ronda — {residentName}</h2>

        <fieldset className="modal-fieldset">
          <legend>Resultado operacional (obligatorio)</legend>
          {OUTCOME_OPTIONS.map((option) => (
            <label key={option.value} className="modal-radio">
              <input
                type="radio"
                name="completion-outcome"
                value={option.value}
                checked={outcome === option.value}
                onChange={() => setOutcome(option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <label className="modal-field">
          <span>Nota corta (opcional)</span>
          <input
            type="text"
            maxLength={200}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ej.: residente tranquilo, sin novedades"
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="button button--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="button"
            disabled={outcome === undefined}
            onClick={() => outcome !== undefined && onConfirm(outcome, note)}
          >
            Confirmar finalización
          </button>
        </div>
      </div>
    </div>
  );
};
