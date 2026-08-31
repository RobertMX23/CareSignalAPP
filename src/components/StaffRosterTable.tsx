import type { StaffMember } from '../domain/types';
import type { Role, Shift, StaffAvailability } from '../domain/taxonomy';
import { SHIFTS } from '../domain/taxonomy';

const ROLE_LABEL: Record<Role, string> = {
  caregiver:  'Cuidador/a',
  supervisor: 'Supervisor/a',
  manager:    'Gerente',
  demo_admin: 'Admin demo',
};

const SHIFT_LABEL: Record<Shift, string> = {
  morning:   'Mañana',
  afternoon: 'Tarde',
  night:     'Noche',
  on_call:   'Guardia',
};

const AVAILABILITY_LABEL: Record<StaffAvailability, string> = {
  available: 'Activo/a',
  busy:      'Ocupado/a',
  off_shift: 'Fuera de turno',
};

const AVAILABILITY_CLASS: Record<StaffAvailability, string> = {
  available: 'availability-badge availability-badge--available',
  busy:      'availability-badge availability-badge--busy',
  off_shift: 'availability-badge availability-badge--off-shift',
};

const ROLE_ORDER: Role[] = ['supervisor', 'caregiver', 'manager', 'demo_admin'];

interface Props {
  staffMembers: StaffMember[];
}

export const StaffRosterTable = ({ staffMembers }: Props): JSX.Element => {
  const shiftsWithStaff = SHIFTS.filter((shift) => staffMembers.some((s) => s.shift === shift));

  return (
    <div className="roster-grid">
      {shiftsWithStaff.map((shift) => {
        const group = staffMembers
          .filter((s) => s.shift === shift)
          .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

        const active   = group.filter((s) => s.availability === 'available').length;
        const busy     = group.filter((s) => s.availability === 'busy').length;
        const offShift = group.filter((s) => s.availability === 'off_shift').length;

        return (
          <div key={shift} className="roster-card">
            <div className="roster-card__header">
              <span className="roster-card__shift">{SHIFT_LABEL[shift]}</span>
              <span className="roster-card__summary">
                <span className="roster-summary--available">{active} activos</span>
                {busy > 0 && <span className="roster-summary--busy"> · {busy} ocupados</span>}
                {offShift > 0 && <span className="roster-summary--off"> · {offShift} fuera</span>}
              </span>
            </div>
            <table className="data-table roster-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {group.map((staff) => (
                  <tr key={staff.id}>
                    <td>{staff.displayName}</td>
                    <td>
                      <span className={`badge badge--role-${staff.role}`}>
                        {ROLE_LABEL[staff.role]}
                      </span>
                    </td>
                    <td>
                      <span className={AVAILABILITY_CLASS[staff.availability]}>
                        {AVAILABILITY_LABEL[staff.availability]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};
