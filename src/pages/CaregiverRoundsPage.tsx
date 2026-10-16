/**
 * CaregiverRoundsPage.tsx — Flujo operacional del cuidador (contrato Chunk 5).
 *
 * Móvil: cards apiladas con color por prioridad y botones tap-friendly.
 * Desktop: tabla compacta (6 col) con fila coloreada por prioridad.
 */

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { CompleteRoundModal } from '../features/rounds/CompleteRoundModal';
import { RequestSupportModal } from '../features/rounds/RequestSupportModal';
import {
  acceptAlert,
  completeRound,
  requestSupport,
  startRound,
} from '../features/rounds/roundOperations';
import type { RoundOutcome } from '../domain/types';
import { bucketLabel, classifyRoundPriority, compareByPriority, describeDelay } from '../features/rounds/roundPriority';
import type { RoundPriorityBucket } from '../features/rounds/roundPriority';
import { getCurrentTime } from '../data/demoClock';
import { getResidentById, listAlerts, listRounds } from '../data/repository';
import { isAlertActive } from '../domain/rules';
import type { Alert, Round } from '../domain/types';
import type { AlertSeverity } from '../domain/taxonomy';
import { ROUND_TYPE_LABEL } from '../features/labels';

type StatusFilter = 'overdue' | 'in_progress' | 'pending' | 'completed';

const FILTER_LABEL: Record<StatusFilter, string> = {
  overdue:     'Vencidas',
  in_progress: 'En progreso',
  pending:     'Pendientes',
  completed:   'Completadas',
};

type ModalState = { kind: 'complete'; round: Round } | { kind: 'support'; round: Round } | undefined;

type RowData = {
  round: Round;
  roundAlerts: Alert[];
  openAlert: Alert | undefined;
  bucket: RoundPriorityBucket;
};

function bucketRowClass(bucket: RoundPriorityBucket): string {
  if (bucket === 'red')         return 'row-red';
  if (bucket === 'yellow')      return 'row-yellow';
  if (bucket === 'in_progress') return 'row-in-progress';
  return '';
}

function bucketCardClass(bucket: RoundPriorityBucket): string {
  if (bucket === 'red')         return 'round-card round-card--red';
  if (bucket === 'yellow')      return 'round-card round-card--yellow';
  if (bucket === 'in_progress') return 'round-card round-card--in-progress';
  if (bucket === 'done')        return 'round-card round-card--done';
  return 'round-card';
}

export const CaregiverRoundsPage = (): JSX.Element => {
  const { activeStaff, refreshToken, refreshDemoData } = useDemoSession();
  const [modal, setModal] = useState<ModalState>(undefined);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilter = searchParams.get('filter') as StatusFilter | null;

  const currentTime = getCurrentTime();

  const rows = useMemo((): RowData[] => {
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
        const openAlert   = roundAlerts.find((a) => a.status === 'open');
        const bucket      = classifyRoundPriority(round, roundAlerts);
        return { round, roundAlerts, openAlert, bucket };
      })
      .sort(compareByPriority);
  }, [activeStaff.id, refreshToken]);

  const displayRows = useMemo((): RowData[] => {
    if (!activeFilter) return rows;
    // When navigating from a dashboard KPI card, show only directly-assigned rounds
    // so the count in the banner matches the number shown on the card.
    const base = rows.filter(({ round }) => round.assignedStaffId === activeStaff.id);
    return base.filter(({ round }) => {
      switch (activeFilter) {
        case 'overdue':     return round.status === 'overdue';
        case 'in_progress': return round.status === 'in_progress';
        case 'pending':     return round.status === 'scheduled' || round.status === 'due';
        case 'completed':   return round.status === 'completed';
        default:            return true;
      }
    });
  }, [rows, activeFilter, activeStaff.id]);

  const handleStart = (round: Round): void => {
    const result = startRound(round, activeStaff.id, getCurrentTime());
    if (result.ok) { setMessage({ kind: 'success', text: 'Ronda iniciada.' }); refreshDemoData(); }
    else setMessage({ kind: 'error', text: result.message });
  };

  const handleCompleteConfirm = (round: Round, outcome: RoundOutcome, note: string | undefined): void => {
    const result = completeRound(round, activeStaff.id, getCurrentTime(), outcome, note);
    setModal(undefined);
    if (result.ok) { setMessage({ kind: 'success', text: 'Ronda completada.' }); refreshDemoData(); }
    else setMessage({ kind: 'error', text: result.message });
  };

  const handleSupportConfirm = (round: Round, severity: AlertSeverity): void => {
    const result = requestSupport(round, severity, activeStaff.id, getCurrentTime());
    setModal(undefined);
    if (result.ok) { setMessage({ kind: 'success', text: `Alerta creada: ${result.value.id}` }); refreshDemoData(); }
    else setMessage({ kind: 'error', text: result.message });
  };

  const handleAcceptAlert = (alert: Alert): void => {
    const result = acceptAlert(alert, activeStaff.id, getCurrentTime());
    if (result.ok) { setMessage({ kind: 'success', text: `Alerta ${alert.id} aceptada.` }); refreshDemoData(); }
    else setMessage({ kind: 'error', text: result.message });
  };

  const renderActions = (row: RowData): JSX.Element => {
    const { round, roundAlerts, openAlert } = row;
    const hasActiveAlert = roundAlerts.some((a) => isAlertActive(a.status));
    const canRequestSupport =
      !hasActiveAlert &&
      (round.status === 'scheduled' || round.status === 'due' ||
       round.status === 'in_progress' || round.status === 'overdue');
    return (
      <div className="row-actions">
        {round.status === 'due' && (
          <button type="button" className="button button--small" data-tour="round-start" onClick={() => handleStart(round)}>
            Iniciar
          </button>
        )}
        {round.status === 'in_progress' && (
          <button type="button" className="button button--small" data-tour="round-complete" onClick={() => setModal({ kind: 'complete', round })}>
            Completar
          </button>
        )}
        {canRequestSupport && (
          <button type="button" className="button button--small button--secondary" data-tour="round-support" onClick={() => setModal({ kind: 'support', round })}>
            Apoyo
          </button>
        )}
        {openAlert !== undefined && (
          <button type="button" className="button button--small button--secondary" onClick={() => handleAcceptAlert(openAlert)}>
            Aceptar alerta
          </button>
        )}
        <Link className="button button--small button--secondary" to={`/residentes/${round.residentId}`}>
          Detalle
        </Link>
      </div>
    );
  };

  return (
    <section>
      <h1>Mis rondas</h1>

      {message !== undefined && (
        <p className={message.kind === 'success' ? 'inline-banner inline-banner--success' : 'inline-banner inline-banner--error'}>
          {message.text}{' '}
          <button type="button" className="link-button" onClick={() => setMessage(undefined)}>Cerrar</button>
        </p>
      )}

      {activeFilter !== null && (
        <p className="filter-active-banner">
          Mostrando: <strong>{FILTER_LABEL[activeFilter]}</strong>{' '}
          ({displayRows.length} {displayRows.length === 1 ? 'ronda' : 'rondas'}){' '}
          <button
            type="button"
            className="link-button"
            onClick={() => setSearchParams({})}
          >
            × Ver todas
          </button>
        </p>
      )}

      {displayRows.length === 0 ? (
        <p>
          {activeFilter !== null
            ? `No hay rondas en estado "${FILTER_LABEL[activeFilter]}" en este momento.`
            : 'No hay rondas ni alertas relevantes para este usuario en este momento.'}
        </p>
      ) : (
        <>
          {/* ── Móvil: cards ── */}
          <div className="rounds-cards-view">
            {displayRows.map(({ round, bucket, openAlert, roundAlerts }) => {
              const resident = getResidentById(round.residentId);
              const delay    = describeDelay(round, currentTime);
              const time     = new Date(round.scheduledAt).toLocaleTimeString('es-ES', { timeStyle: 'short' });
              return (
                <div key={round.id} className={bucketCardClass(bucket)}>
                  <div className="round-card__header">
                    <span className="round-card__priority">{bucketLabel(bucket, round)}</span>
                    <span className="round-card__room">Hab. {resident?.room ?? '—'}</span>
                  </div>
                  <div className="round-card__main">
                    <span className="round-card__resident">
                      <Link to={`/residentes/${round.residentId}`}>{resident?.displayName ?? round.residentId}</Link>
                    </span>
                    <span className="round-card__type">{ROUND_TYPE_LABEL[round.type]}</span>
                  </div>
                  <div className="round-card__meta">
                    {time}{delay !== undefined ? ` · ${delay}` : ''}
                  </div>
                  {renderActions({ round, roundAlerts, openAlert, bucket })}
                </div>
              );
            })}
          </div>

          {/* ── Desktop: tabla ── */}
          <div className="rounds-table-view table-scroll">
            <table className="data-table" data-tour="rounds-list">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Habitación</th>
                  <th>Residente</th>
                  <th>Tipo</th>
                  <th>Prioridad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map(({ round, roundAlerts, openAlert, bucket }) => {
                  const resident = getResidentById(round.residentId);
                  const delay    = describeDelay(round, currentTime);
                  const time     = new Date(round.scheduledAt).toLocaleTimeString('es-ES', { timeStyle: 'short' });
                  return (
                    <tr key={round.id} className={bucketRowClass(bucket)}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {time}{delay !== undefined ? <><br /><small>{delay}</small></> : null}
                      </td>
                      <td>{resident?.room ?? '—'}</td>
                      <td>
                        <Link to={`/residentes/${round.residentId}`}>{resident?.displayName ?? round.residentId}</Link>
                      </td>
                      <td>{ROUND_TYPE_LABEL[round.type]}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{bucketLabel(bucket, round)}</td>
                      <td>{renderActions({ round, roundAlerts, openAlert, bucket })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
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
