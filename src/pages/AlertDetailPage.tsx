/**
 * AlertDetailPage.tsx — Lista de alertas (con filtros) y flujo completo del supervisor
 * sobre una alerta seleccionada (contrato Chunk 6).
 *
 * Sirve `/alertas` (lista) y `/alertas/:alertId` (detalle). Todas las escrituras pasan
 * por `features/alerts/alertOperations.ts` (dominio + repositorio); esta página solo
 * orquesta la interacción.
 */

import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { AssignAlertModal } from '../features/alerts/AssignAlertModal';
import { ResolveAlertModal } from '../features/alerts/ResolveAlertModal';
import { getAlertTimeline, getAssignmentHistory } from '../features/alerts/alertQueries';
import {
  acknowledgeAlert,
  assignAlert,
  closeAlert,
  escalateAlert,
  reassignAlert,
  resolveAlert,
  startVerification,
} from '../features/alerts/alertOperations';
import { describeDelay } from '../features/rounds/roundPriority';
import { getCurrentTime } from '../data/demoClock';
import {
  getResidentById,
  getRoundById,
  getStaffMemberById,
  listAlerts,
  listAuditEvents,
  listIncidents,
  listResidents,
  listStaffMembers,
} from '../data/repository';
import type { Alert, ID } from '../domain/types';
import type { AlertStatus, VerificationOutcome } from '../domain/taxonomy';
import { ALERT_SEVERITY_LABEL, ALERT_STATUS_LABEL, INCIDENT_STATUS_LABEL, ROUND_TYPE_LABEL, VERIFICATION_OUTCOME_LABEL } from '../features/labels';

const SEVERITY_LABEL = ALERT_SEVERITY_LABEL;
const STATUS_LABEL = ALERT_STATUS_LABEL;

interface AlertFilters {
  severity: 'all' | 'yellow' | 'red';
  status: 'all' | AlertStatus;
  staffId: 'all' | ID;
  residentId: 'all' | ID;
  shift: 'all' | string;
  assignment: 'all' | 'assigned' | 'unassigned';
}

const DEFAULT_FILTERS: AlertFilters = {
  severity: 'all',
  status: 'all',
  staffId: 'all',
  residentId: 'all',
  shift: 'all',
  assignment: 'all',
};

const AlertList = (): JSX.Element => {
  const { refreshToken } = useDemoSession();
  const [filters, setFilters] = useState<AlertFilters>(DEFAULT_FILTERS);

  const { alerts, residents, staffMembers, shifts } = useMemo(() => {
    const staffMembers = listStaffMembers();
    return {
      alerts: listAlerts(),
      residents: listResidents(),
      staffMembers,
      shifts: Array.from(new Set(staffMembers.map((s) => s.shift))),
    };
  }, [refreshToken]);

  const filteredAlerts = alerts.filter((alert) => {
    if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
    if (filters.status !== 'all' && alert.status !== filters.status) return false;
    if (filters.residentId !== 'all' && alert.residentId !== filters.residentId) return false;
    if (filters.staffId !== 'all' && alert.assignedStaffId !== filters.staffId) return false;
    if (filters.assignment === 'assigned' && alert.assignedStaffId === undefined) return false;
    if (filters.assignment === 'unassigned' && alert.assignedStaffId !== undefined) return false;
    if (filters.shift !== 'all') {
      const staff = alert.assignedStaffId !== undefined ? getStaffMemberById(alert.assignedStaffId) : undefined;
      if (staff?.shift !== filters.shift) return false;
    }
    return true;
  });

  const updateFilter = <K extends keyof AlertFilters>(key: K, value: AlertFilters[K]): void =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <section>
      <h1>Alertas</h1>

      <div className="filter-bar">
        <label className="filter-field">
          <span className="filter-field__label">Severidad</span>
          <select value={filters.severity} onChange={(e) => updateFilter('severity', e.target.value as AlertFilters['severity'])}>
            <option value="all">Todas</option>
            <option value="yellow">Amarilla</option>
            <option value="red">Roja</option>
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">Estado</span>
          <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value as AlertFilters['status'])}>
            <option value="all">Todos</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">Responsable</span>
          <select value={filters.staffId} onChange={(e) => updateFilter('staffId', e.target.value as AlertFilters['staffId'])}>
            <option value="all">Todos</option>
            {staffMembers.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">Residente</span>
          <select value={filters.residentId} onChange={(e) => updateFilter('residentId', e.target.value as AlertFilters['residentId'])}>
            <option value="all">Todos</option>
            {residents.map((resident) => (
              <option key={resident.id} value={resident.id}>
                {resident.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">Turno</span>
          <select value={filters.shift} onChange={(e) => updateFilter('shift', e.target.value)}>
            <option value="all">Todos</option>
            {shifts.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">Asignación</span>
          <select value={filters.assignment} onChange={(e) => updateFilter('assignment', e.target.value as AlertFilters['assignment'])}>
            <option value="all">Todas</option>
            <option value="assigned">Asignadas</option>
            <option value="unassigned">Sin asignar</option>
          </select>
        </label>
      </div>

      {filteredAlerts.length === 0 ? (
        <p>Ninguna alerta coincide con los filtros seleccionados.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alerta</th>
                <th>Residente</th>
                <th>Severidad</th>
                <th>Estado</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <Link to={`/alertas/${alert.id}`}>{alert.id}</Link>
                  </td>
                  <td>{getResidentById(alert.residentId)?.displayName ?? alert.residentId}</td>
                  <td>{SEVERITY_LABEL[alert.severity] ?? alert.severity}</td>
                  <td>{STATUS_LABEL[alert.status]}</td>
                  <td>
                    {alert.assignedStaffId === undefined ? (
                      <span className="badge badge--unassigned">Sin asignar</span>
                    ) : (
                      getStaffMemberById(alert.assignedStaffId)?.displayName ?? alert.assignedStaffId
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

type ModalState = { kind: 'assign' | 'reassign' } | { kind: 'resolve' } | undefined;

const AlertDetail = ({ alertId }: { alertId: string }): JSX.Element => {
  const { activeStaff, refreshToken, refreshDemoData } = useDemoSession();
  const [modal, setModal] = useState<ModalState>(undefined);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | undefined>(undefined);

  const data = useMemo(() => {
    const alert = listAlerts().find((a) => a.id === alertId);
    const incident = listIncidents().find((i) => i.alertId === alertId);
    const round = alert !== undefined ? getRoundById(alert.roundId) : undefined;
    const auditEvents = listAuditEvents();
    return {
      alert,
      incident,
      round,
      staffMembers: listStaffMembers(),
      assignmentHistory: alert !== undefined ? getAssignmentHistory(alert.id, auditEvents) : [],
      timeline: alert !== undefined ? getAlertTimeline(alert.id, incident?.id, auditEvents) : [],
    };
  }, [alertId, refreshToken]);

  if (data.alert === undefined) {
    return (
      <section>
        <p>No se encontró la alerta "{alertId}".</p>
        <Link to="/alertas">Volver a la lista de alertas</Link>
      </section>
    );
  }
  const alert: Alert = data.alert;

  const canClose   = activeStaff.role === 'manager'    || activeStaff.role === 'demo_admin';
  const canManage  = activeStaff.role === 'supervisor'  || canClose;

  const resident = getResidentById(alert.residentId);
  const assignedStaff = alert.assignedStaffId !== undefined ? getStaffMemberById(alert.assignedStaffId) : undefined;
  const delay = data.round !== undefined ? describeDelay(data.round, getCurrentTime()) : undefined;

  const runAction = (action: () => { ok: boolean; message?: string }, successText: string): void => {
    const result = action();
    if (result.ok) {
      setMessage({ kind: 'success', text: successText });
      refreshDemoData();
    } else {
      setMessage({ kind: 'error', text: result.message ?? 'No se pudo completar la acción.' });
    }
  };

  const handleAcknowledge = (): void =>
    runAction(() => acknowledgeAlert(alert, activeStaff.id, getCurrentTime()), 'Alerta reconocida.');

  const handleEscalate = (): void => runAction(() => escalateAlert(alert, activeStaff.id, getCurrentTime()), 'Alerta escalada.');

  const handleStartVerification = (): void =>
    runAction(() => startVerification(alert, activeStaff.id, getCurrentTime()), 'Verificación iniciada.');

  const handleClose = (): void => {
    if (!canClose) return;
    runAction(() => closeAlert(alert, activeStaff.id, getCurrentTime()), 'Alerta cerrada.');
  };

  const handleAssignConfirm = (staffId: ID): void => {
    const isReassign = modal?.kind === 'reassign';
    setModal(undefined);
    runAction(
      () => (isReassign ? reassignAlert(alert, staffId, activeStaff.id, getCurrentTime()) : assignAlert(alert, staffId, activeStaff.id, getCurrentTime())),
      isReassign ? 'Alerta reasignada.' : 'Alerta asignada.',
    );
  };

  const handleResolveConfirm = (outcome: VerificationOutcome): void => {
    setModal(undefined);
    runAction(() => resolveAlert(alert, outcome, activeStaff.id, getCurrentTime()), 'Resultado registrado; alerta resuelta.');
  };

  return (
    <section>
      <p>
        <Link to="/alertas">← Volver a alertas</Link>
      </p>
      <h1>Alerta {alert.id}</h1>

      {message !== undefined && (
        <p className={message.kind === 'success' ? 'inline-banner inline-banner--success' : 'inline-banner inline-banner--error'}>
          {message.text}{' '}
          <button type="button" className="link-button" onClick={() => setMessage(undefined)}>
            Cerrar
          </button>
        </p>
      )}

      <dl className="detail-list">
        <dt>Residente</dt>
        <dd>{resident !== undefined ? <Link to={`/residentes/${resident.id}`}>{resident.displayName}</Link> : alert.residentId}</dd>
        <dt>Habitación</dt>
        <dd>{resident?.room ?? '—'}</dd>
        <dt>Ronda de origen</dt>
        <dd>{data.round !== undefined ? `${ROUND_TYPE_LABEL[data.round.type]} (${data.round.id})` : alert.roundId}</dd>
        <dt>Hora programada</dt>
        <dd>{data.round !== undefined ? new Date(data.round.scheduledAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</dd>
        <dt>Tiempo de retraso</dt>
        <dd>{delay ?? '—'}</dd>
        <dt>Severidad</dt>
        <dd>{SEVERITY_LABEL[alert.severity] ?? alert.severity}</dd>
        <dt>Estado</dt>
        <dd>{STATUS_LABEL[alert.status]}</dd>
        <dt>Responsable actual</dt>
        <dd>
          {assignedStaff !== undefined ? assignedStaff.displayName : <span className="badge badge--unassigned">Sin asignar</span>}
        </dd>
        {alert.verificationOutcome !== undefined && (
          <>
            <dt>Resultado de verificación</dt>
            <dd>{VERIFICATION_OUTCOME_LABEL[alert.verificationOutcome as VerificationOutcome] ?? alert.verificationOutcome}</dd>
          </>
        )}
      </dl>

      <h2>Acciones</h2>
      <div className="row-actions">
        {canManage && alert.status === 'open' && (
          <button type="button" className="button" onClick={handleAcknowledge}>
            Reconocer
          </button>
        )}
        {canManage && (alert.status === 'open' || alert.status === 'acknowledged') && (
          <button type="button" className="button" onClick={() => setModal({ kind: 'assign' })}>
            Asignar
          </button>
        )}
        {canManage && (alert.status === 'assigned' || alert.status === 'escalated') && (
          <button type="button" className="button button--secondary" onClick={() => setModal({ kind: 'reassign' })}>
            Reasignar
          </button>
        )}
        {canManage && alert.status === 'assigned' && (
          <button type="button" className="button button--secondary" onClick={handleEscalate}>
            Escalar
          </button>
        )}
        {canManage && (alert.status === 'assigned' || alert.status === 'escalated') && (
          <button type="button" className="button" onClick={handleStartVerification}>
            Iniciar verificación
          </button>
        )}
        {canManage && alert.status === 'in_verification' && (
          <button type="button" className="button" onClick={() => setModal({ kind: 'resolve' })}>
            Registrar resultado y resolver
          </button>
        )}
        {canClose && alert.status === 'resolved' && (
          <button type="button" className="button" onClick={handleClose}>
            Cerrar
          </button>
        )}
        {!canManage && !alert.status.startsWith('close') && (
          <p className="hint">Sin acciones disponibles para este rol.</p>
        )}
        {alert.status === 'closed' && <p className="hint">Esta alerta está cerrada; no admite más acciones.</p>}
      </div>

      <h2>Incidente asociado</h2>
      {data.incident === undefined ? (
        <p>Esta alerta no tiene un incidente de verificación asociado todavía.</p>
      ) : (
        <dl className="detail-list">
          <dt>Incidente</dt>
          <dd>{data.incident.id}</dd>
          <dt>Estado</dt>
          <dd>{INCIDENT_STATUS_LABEL[data.incident.status]}</dd>
          {data.incident.outcome !== undefined && (
            <>
              <dt>Resultado</dt>
              <dd>{VERIFICATION_OUTCOME_LABEL[data.incident.outcome as VerificationOutcome] ?? data.incident.outcome}</dd>
            </>
          )}
        </dl>
      )}

      <h2>Historial de asignaciones</h2>
      {data.assignmentHistory.length === 0 ? (
        <p>Sin asignaciones registradas todavía.</p>
      ) : (
        <ul className="timeline">
          {data.assignmentHistory.map((entry, index) => (
            <li key={`${entry.timestamp}-${index}`}>
              <span className="timeline-time">
                {new Date(entry.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              {entry.action} a <strong>{getStaffMemberById(entry.staffId)?.displayName ?? entry.staffId}</strong> por{' '}
              {getStaffMemberById(entry.actorId)?.displayName ?? entry.actorId}
            </li>
          ))}
        </ul>
      )}

      <h2>Línea de tiempo auditable</h2>
      <ul className="timeline">
        {data.timeline.map((entry, index) => (
          <li key={`${entry.timestamp}-${index}`}>
            <span className="timeline-time">
              {new Date(entry.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
            [{entry.entityType}] {entry.action}
            {entry.previousState !== undefined && entry.nextState !== undefined ? ` (${entry.previousState} → ${entry.nextState})` : ''} —{' '}
            {getStaffMemberById(entry.actorId)?.displayName ?? entry.actorId}
          </li>
        ))}
      </ul>

      {(modal?.kind === 'assign' || modal?.kind === 'reassign') && (
        <AssignAlertModal
          title={modal.kind === 'assign' ? 'Asignar alerta' : 'Reasignar alerta'}
          staffMembers={data.staffMembers}
          currentStaffId={alert.assignedStaffId}
          onCancel={() => setModal(undefined)}
          onConfirm={handleAssignConfirm}
        />
      )}
      {modal?.kind === 'resolve' && (
        <ResolveAlertModal
          residentName={resident?.displayName ?? alert.residentId}
          onCancel={() => setModal(undefined)}
          onConfirm={handleResolveConfirm}
        />
      )}
    </section>
  );
};

export const AlertDetailPage = (): JSX.Element => {
  const { alertId } = useParams<{ alertId?: string }>();
  return alertId === undefined ? <AlertList /> : <AlertDetail alertId={alertId} />;
};
