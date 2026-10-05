import type { StaffMember } from '../domain/types';
import type { Role, Shift, StaffAvailability } from '../domain/taxonomy';
import { SHIFTS } from '../domain/taxonomy';
import { getCurrentTime } from '../data/demoClock';
import { ROLE_LABEL, SHIFT_LABEL } from '../features/labels';

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

// Etiquetas cortas para el badge dentro de la tabla (columna estrecha)
const ROLE_BADGE_LABEL: Record<Role, string> = {
  caregiver:  'Cuidador/a',
  supervisor: 'Supervisor/a',
  manager:    'Gerente',
  demo_admin: 'Admin demo',
};

const ROLE_ORDER: Role[] = ['supervisor', 'caregiver', 'manager', 'demo_admin'];
const AVAILABILITY_ORDER: Record<StaffAvailability, number> = { available: 0, busy: 1, off_shift: 2 };

function currentShift(): Shift {
  const hour = new Date(getCurrentTime()).getHours();
  if (hour >= 6 && hour < 14) return 'morning';
  if (hour >= 14 && hour < 22) return 'afternoon';
  return 'night';
}

function shiftOrder(shift: Shift, active: Shift): number {
  const order: Shift[] = [active, 'morning', 'afternoon', 'night', 'on_call'];
  const seen = new Set<Shift>();
  return order.filter((s) => { if (seen.has(s)) return false; seen.add(s); return true; }).indexOf(shift);
}

interface Props {
  staffMembers: StaffMember[];
}

export const StaffRosterTable = ({ staffMembers }: Props): JSX.Element => {
  const activeShift = currentShift();
  const shiftsWithStaff = SHIFTS
    .filter((shift) => staffMembers.some((s) => s.shift === shift))
    .sort((a, b) => shiftOrder(a, activeShift) - shiftOrder(b, activeShift));

  return (
    <div className="roster-grid">
      {shiftsWithStaff.map((shift) => {
        const group = staffMembers
          .filter((s) => s.shift === shift)
          .sort((a, b) => {
            const avail = AVAILABILITY_ORDER[a.availability] - AVAILABILITY_ORDER[b.availability];
            if (avail !== 0) return avail;
            return ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);
          });

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
            <div className="roster-table-wrapper">
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
                          {ROLE_BADGE_LABEL[staff.role]}
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
          </div>
        );
      })}
    </div>
  );
};
