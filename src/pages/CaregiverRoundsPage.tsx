/**
 * CaregiverRoundsPage.tsx — Flujo operacional del cuidador (contrato Chunk 5).
 *
 * Muestra las rondas relevantes para el usuario ficticio activo: las asignadas
 * directamente a él, las que tienen una alerta activa ya asignada a él, y las que
 * tienen una alerta activa abierta (sin asignar) que cualquier cuidador puede aceptar.
 * Ordenadas: rojas, amarillas, en progreso, próximas, completadas (contrato §Chunk 5).
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { CompleteRoundModal } from '../features/rounds/CompleteRoundModal';
import { RequestSupportModal } from '../features/rounds/RequestSupportModal';
import {
  acceptAlert,
  completeRound,
  requestSupport,
  startRound,
  type RoundCompletionOutcome,
} from '../features/rounds/roundOperations';
import { bucketLabel, classifyRoundPriority, compareByPriority, describeDelay } from '../features/rounds/roundPriority';
import { getCurrentTime } from '../data/demoClock';
import { getResidentById, listAlerts, listRounds } from '../data/repository';
import { isAlertActive } from '../domain/rules';
import type { Alert, Round } from '../domain/types';
import type { AlertSeverity } from '../domain/taxonomy';

const ROUND_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  due: 'Próxima a vencer',
  in_progress: 'En curso',
  completed: 'Completada',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
};

type ModalState = { kind: 'complete'; round: Round } | { kind: 'support'; round: Round } | undefined;

export const CaregiverRoundsPage = (): JSX.Element => {
  const { activeStaff, refreshToken, refreshDemoData } = useDemoSession();
  const [modal, setModal] = useState<ModalState>(undefined);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | undefined>(undefined);

  const currentTime = getCurrentTime();

  const rows = useMemo(() => {
    const rounds = listRounds();
    const alerts = listAlerts();

    const isRelevant = (round: Round): boolean => {
      if (round.assignedStaffId === activeStaff.id) return true;
      return alerts.some(
        (a) => a.roundId === round.id && isAlertActive(a.status) && (a.assignedStaffId === activeStaff.id || a.status === 'open'),
      );
    };

    return rounds
      .filter(isRelevant)
      .map((round) => {
        const roundAlerts = alerts.filter((a) => a.roundId === round.id);
        const openAlert = roundAlerts.find((a) => a.status === 'open');
        const bucket = classifyRoundPriority(round, roundAlerts);
        return { round, roundAlerts, openAlert, bucket };
      })
      .sort(compareByPriority);
    // refreshToken fuerza releer el repositorio tras una acción o un restablecimiento.
  }, [activeStaff.id, refreshToken]);

  const clearMessage = (): void => setMessage(undefined);

  const handleStart = (round: Round): void => {
    const result = startRound(round, activeStaff.id, getCurrentTime());
    if (result.ok) {
      setMessage({ kind: 'success', text: `Ronda ${round.id} iniciada.` });
      refreshDemoData();
    } else {
      setMessage({ kind: 'error', text: result.message });
    }
  };

  const handleCompleteConfirm = (round: Round, outcome: RoundCompletionOutcome, note: string | undefined): void => {
    const result = completeRound(round, activeStaff.id, getCurrentTime(), outcome, note);
    setModal(undefined);
    if (result.ok) {
      setMessage({ kind: 'success', text: `Ronda ${round.id} completada.` });
      refreshDemoData();
    } else {
      setMessage({ kind: 'error', text: result.message });
    }
  };

  const handleSupportConfirm = (round: Round, severity: AlertSeverity): void => {
    const result = requestSupport(round, severity, activeStaff.id, getCurrentTime());
    setModal(undefined);
    if (result.ok) {
      setMessage({ kind: 'success', text: `Se creó la alerta ${result.value.id} para esta ronda.` });
      refreshDemoData();
    } else {
      setMessage({ kind: 'error', text: result.message });
    }
  };

  const handleAcceptAlert = (alert: Alert): void => {
    const result = acceptAlert(alert, activeStaff.id, getCurrentTime());
    if (result.ok) {
      setMessage({ kind: 'success', text: `Aceptaste la alerta ${alert.id}.` });
      refreshDemoData();
    } else {
      setMessage({ kind: 'error', text: result.message });
    }
  };

  return (
    <section>
      <h1>Mis rondas</h1>
      <p>
        Usuario activo: <strong>{activeStaff.displayName}</strong> ({activeStaff.shift})
      </p>

      {activeStaff.role !== 'caregiver' && (
        <p className="hint">
          El usuario activo no es un cuidador; esta vista muestra igualmente sus rondas y
          alertas asignadas o disponibles, a modo de referencia.
        </p>
      )}

      {message !== undefined && (
        <p className={message.kind === 'success' ? 'inline-banner inline-banner--success' : 'inline-banner inline-banner--error'}>
          {message.text}{' '}
          <button type="button" className="link-button" onClick={clearMessage}>
            Cerrar
          </button>
        </p>
      )}

      {rows.length === 0 ? (
        <p>No hay rondas ni alertas relevantes para este usuario en este momento.</p>
      ) : (
        <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Hora programada</th>
              <th>Habitación</th>
              <th>Residente</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Retraso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ round, roundAlerts, bucket, openAlert }) => {
              const resident = getResidentById(round.residentId);
              const delay = describeDelay(round, currentTime);
              const hasActiveAlert = roundAlerts.some((a) => isAlertActive(a.status));
              const canRequestSupport =
                !hasActiveAlert &&
                (round.status === 'scheduled' || round.status === 'due' || round.status === 'in_progress' || round.status === 'overdue');

              return (
                <tr key={round.id}>
                  <td>{new Date(round.scheduledAt).toLocaleTimeString('es-ES', { timeStyle: 'short' })}</td>
                  <td>{resident?.room ?? '—'}</td>
                  <td>
                    <Link to={`/residentes/${round.residentId}`}>{resident?.displayName ?? round.residentId}</Link>
                  </td>
                  <td>{round.type}</td>
                  <td>{ROUND_STATUS_LABELS[round.status] ?? round.status}</td>
                  <td>{bucketLabel(bucket, round)}</td>
                  <td>{delay ?? '—'}</td>
                  <td>
                    <div className="row-actions">
                      {round.status === 'due' && (
                        <button type="button" className="button button--small" onClick={() => handleStart(round)}>
                          Iniciar ronda
                        </button>
                      )}
                      {round.status === 'in_progress' && (
                        <button
                          type="button"
                          className="button button--small"
                          onClick={() => setModal({ kind: 'complete', round })}
                        >
                          Completar ronda
                        </button>
                      )}
                      {canRequestSupport && (
                        <button
                          type="button"
                          className="button button--small button--secondary"
                          onClick={() => setModal({ kind: 'support', round })}
                        >
                          Solicitar apoyo
                        </button>
                      )}
                      {openAlert !== undefined && (
                        <button
                          type="button"
                          className="button button--small button--secondary"
                          onClick={() => handleAcceptAlert(openAlert)}
                        >
                          Aceptar alerta
                        </button>
                      )}
                      <Link className="button button--small button--secondary" to={`/residentes/${round.residentId}`}>
                        Abrir detalle
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}

      {modal?.kind === 'complete' && (
        <CompleteRoundModal
          residentName={getResidentById(modal.round.residentId)?.displayName ?? modal.round.residentId}
          onCancel={() => setModal(undefined)}
          onConfirm={(outcome, note) => handleCompleteConfirm(modal.round, outcome, note)}
        />
      )}
      {modal?.kind === 'support' && (
        <RequestSupportModal
          residentName={getResidentById(modal.round.residentId)?.displayName ?? modal.round.residentId}
          onCancel={() => setModal(undefined)}
          onConfirm={(severity) => handleSupportConfirm(modal.round, severity)}
        />
      )}
    </section>
  );
};
