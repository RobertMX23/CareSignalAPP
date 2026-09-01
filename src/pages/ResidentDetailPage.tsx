/**
 * ResidentDetailPage.tsx — Lista de residentes y detalle de uno seleccionado.
 *
 * Sirve tanto la ruta `/residentes` (lista) como `/residentes/:residentId` (detalle),
 * para cubrir el ítem de navegación único "Residentes" exigido en Chunk 4 sin crear
 * una sexta página.
 */

import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { StatusBadge } from '../components/StatusBadge';
import { getResidentById, listAlerts, listResidents, listRounds, listStaffMembers } from '../data/repository';
import { completeRound, startRound } from '../features/rounds/roundOperations';
import { getCurrentTime } from '../data/demoClock';
import { deriveResidentStatus } from '../domain/rules';
import type { CareLevel, Round, RoundOutcome } from '../domain/types';
import { CompleteRoundModal } from '../features/rounds/CompleteRoundModal';
import { ALERT_STATUS_LABEL, ROUND_STATUS_LABEL, ROUND_TYPE_LABEL } from '../features/labels';

function assignedResidentIds(rounds: Round[], staffId: string): Set<string> {
  return new Set(rounds.filter((r) => r.assignedStaffId === staffId).map((r) => r.residentId));
}

const CARE_LEVEL_LABEL: Record<CareLevel, string> = {
  low: 'Cuidado bajo',
  medium: 'Cuidado medio',
  high: 'Cuidado alto',
};

const ResidentList = (): JSX.Element => {
  const { refreshToken, activeStaff } = useDemoSession();
  const { residents, rounds, alerts } = useMemo(
    () => ({ residents: listResidents(), rounds: listRounds(), alerts: listAlerts() }),
    [refreshToken],
  );

  const STATUS_PRIORITY: Record<string, number> = { red: 0, yellow: 1, green: 2 };

  const visibleResidents = useMemo(() => {
    const base =
      activeStaff.role !== 'caregiver'
        ? residents
        : residents.filter((r) => assignedResidentIds(rounds, activeStaff.id).has(r.id));
    return [...base].sort(
      (a, b) =>
        (STATUS_PRIORITY[deriveResidentStatus(a.id, rounds, alerts)] ?? 2) -
        (STATUS_PRIORITY[deriveResidentStatus(b.id, rounds, alerts)] ?? 2),
    );
  }, [residents, rounds, alerts, activeStaff]);

  return (
    <section>
      <h1>Residentes</h1>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Residente</th>
              <th>Habitación</th>
              <th>Frecuencia de monitoreo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {visibleResidents.map((resident) => {
              const rowStatus = deriveResidentStatus(resident.id, rounds, alerts);
              return (
              <tr key={resident.id} className={`row-${rowStatus}`}>
                <td>
                  <Link to={`/residentes/${resident.id}`}>{resident.displayName}</Link>
                </td>
                <td>{resident.room}</td>
                <td>{CARE_LEVEL_LABEL[resident.careLevel]}</td>
                <td>
                  <StatusBadge status={rowStatus} />
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const ResidentDetail = ({ residentId }: { residentId: string }): JSX.Element => {
  const { refreshToken, activeStaff, refreshDemoData } = useDemoSession();
  const [completeModal, setCompleteModal] = useState<Round | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const data = useMemo(
    () => ({
      resident: getResidentById(residentId),
      rounds: listRounds().filter((r) => r.residentId === residentId),
      alerts: listAlerts().filter((a) => a.residentId === residentId),
      staffMembers: listStaffMembers(),
    }),
    [residentId, refreshToken],
  );

  if (data.resident === undefined) {
    return (
      <section>
        <p>No se encontró el residente "{residentId}".</p>
        <Link to="/residentes">Volver a la lista de residentes</Link>
      </section>
    );
  }

  if (activeStaff.role === 'caregiver') {
    const ids = assignedResidentIds(data.rounds, activeStaff.id);
    if (!ids.has(residentId)) return <Navigate to="/residentes" replace />;
  }

  const status = deriveResidentStatus(residentId, data.rounds, data.alerts);
  const staffName = (id?: string): string => data.staffMembers.find((s) => s.id === id)?.displayName ?? '—';

  const isCaregiver = activeStaff.role === 'caregiver';

  const handleStart = (round: Round): void => {
    const result = startRound(round, activeStaff.id, getCurrentTime());
    if (result.ok) { setMessage('Ronda iniciada.'); refreshDemoData(); }
    else setMessage(result.message);
  };

  const handleCompleteConfirm = (round: Round, outcome: RoundOutcome, note: string | undefined): void => {
    const result = completeRound(round, activeStaff.id, getCurrentTime(), outcome, note);
    setCompleteModal(undefined);
    if (result.ok) { setMessage('Ronda completada.'); refreshDemoData(); }
    else setMessage(result.message);
  };

  return (
    <section>
      <p>
        <Link to="/residentes">← Volver a residentes</Link>
      </p>
      <h1>{data.resident.displayName}</h1>
      <p>
        Habitación {data.resident.room} · {CARE_LEVEL_LABEL[data.resident.careLevel]} · <StatusBadge status={status} />
      </p>

      <h2>Rondas</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Programada</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Cuidador asignado</th>
              {isCaregiver && <th>Acción</th>}
            </tr>
          </thead>
          <tbody>
            {data.rounds.map((round) => {
              const myRound = isCaregiver && round.assignedStaffId === activeStaff.id;
              return (
                <tr key={round.id}>
                  <td>{new Date(round.scheduledAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>{ROUND_TYPE_LABEL[round.type]}</td>
                  <td>{ROUND_STATUS_LABEL[round.status]}</td>
                  <td>{staffName(round.assignedStaffId)}</td>
                  {isCaregiver && (
                    <td>
                      {myRound && (round.status === 'scheduled' || round.status === 'due') && (
                        <button type="button" className="button button--small" onClick={() => handleStart(round)}>
                          Iniciar
                        </button>
                      )}
                      {myRound && round.status === 'in_progress' && (
                        <button type="button" className="button button--small" onClick={() => setCompleteModal(round)}>
                          Completar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2>Alertas</h2>
      {data.alerts.length === 0 ? (
        <p>Este residente no tiene alertas registradas.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alerta</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.alerts.map((alert) => {
                const severityLabel = alert.severity === 'red' ? 'Roja' : 'Amarilla';
                const dateLabel = new Date(alert.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
                return (
                <tr key={alert.id}>
                  <td>
                    <Link to={`/alertas/${alert.id}`}>Alerta {severityLabel} · {dateLabel}</Link>
                  </td>
                  <td>{ALERT_STATUS_LABEL[alert.status]}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {message && (
        <p style={{ marginTop: '1rem', color: 'var(--color-primary)' }}>{message}</p>
      )}

      {completeModal && (
        <CompleteRoundModal
          round={completeModal}
          onConfirm={(outcome, note) => handleCompleteConfirm(completeModal, outcome, note)}
          onCancel={() => setCompleteModal(undefined)}
        />
      )}
    </section>
  );
};

export const ResidentDetailPage = (): JSX.Element => {
  const { residentId } = useParams<{ residentId?: string }>();
  return residentId === undefined ? <ResidentList /> : <ResidentDetail residentId={residentId} />;
};
