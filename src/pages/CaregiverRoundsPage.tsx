/**
 * CaregiverRoundsPage.tsx — Rondas del usuario ficticio activo.
 *
 * Solo lectura en Chunk 4 (sin botones de acción todavía; "Iniciar ronda",
 * "Completar ronda", etc. llegan en el Chunk 5). El orden y las acciones completas
 * del flujo del cuidador se implementan allí.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { getResidentById, listRounds } from '../data/repository';

const ROUND_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  due: 'Próxima a vencer',
  in_progress: 'En curso',
  completed: 'Completada',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
};

export const CaregiverRoundsPage = (): JSX.Element => {
  const { activeStaff, refreshToken } = useDemoSession();

  const myRounds = useMemo(
    () => listRounds().filter((round) => round.assignedStaffId === activeStaff.id),
    [activeStaff.id, refreshToken],
  );

  return (
    <section>
      <h1>Mis rondas</h1>
      <p>
        Usuario activo: <strong>{activeStaff.displayName}</strong> ({activeStaff.shift})
      </p>

      {activeStaff.role !== 'caregiver' && (
        <p className="hint">
          El usuario activo no es un cuidador; esta vista muestra únicamente rondas asignadas
          directamente a este usuario.
        </p>
      )}

      {myRounds.length === 0 ? (
        <p>No hay rondas asignadas a este usuario.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Hora programada</th>
              <th>Residente</th>
              <th>Habitación</th>
              <th>Tipo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {myRounds.map((round) => {
              const resident = getResidentById(round.residentId);
              return (
                <tr key={round.id}>
                  <td>{new Date(round.scheduledAt).toLocaleTimeString('es-ES', { timeStyle: 'short' })}</td>
                  <td>
                    <Link to={`/residentes/${round.residentId}`}>{resident?.displayName ?? round.residentId}</Link>
                  </td>
                  <td>{resident?.room ?? '—'}</td>
                  <td>{round.type}</td>
                  <td>{ROUND_STATUS_LABELS[round.status] ?? round.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};
