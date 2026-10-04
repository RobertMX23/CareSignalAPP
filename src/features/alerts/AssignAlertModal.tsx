/**
 * AssignAlertModal.tsx — Diálogo "Asignar" / "Reasignar" (contrato Chunk 6).
 */

import { useState } from 'react';
import { useAutoFocusModal } from '../../components/useAutoFocusModal';
import type { ID, StaffMember } from '../../domain/types';
import { ROLE_LABEL } from '../../features/labels';

interface AssignAlertModalProps {
  title: string;
  staffMembers: readonly StaffMember[];
  currentStaffId: ID | undefined;
  onCancel: () => void;
  onConfirm: (staffId: ID) => void;
}

export const AssignAlertModal = ({ title, staffMembers, currentStaffId, onCancel, onConfirm }: AssignAlertModalProps): JSX.Element => {
  const firstOther = staffMembers.find((s) => s.id !== currentStaffId);
  const [staffId, setStaffId] = useState<ID | undefined>(firstOther?.id ?? staffMembers[0]?.id);
  const { containerRef, handleKeyDown } = useAutoFocusModal<HTMLDivElement>(onCancel);

  return (
    <div className="modal-overlay" role="presentation" onKeyDown={handleKeyDown}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="assign-alert-title" ref={containerRef}>
        <h2 id="assign-alert-title">{title}</h2>

        <label className="modal-field">
          <span>Responsable</span>
          <select value={staffId} onChange={(event) => setStaffId(event.target.value)}>
            {staffMembers.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.displayName} ({ROLE_LABEL[staff.role]})
              </option>
            ))}
          </select>
        </label>

        <div className="modal-actions">
          <button type="button" className="button button--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="button" disabled={staffId === undefined} onClick={() => staffId !== undefined && onConfirm(staffId)}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
