/**
 * AlertDetailPage.tsx — Lista de alertas y detalle de una seleccionada.
 *
 * Sirve `/alertas` (lista) y `/alertas/:alertId` (detalle). Solo lectura en Chunk 4;
 * el ciclo de vida completo (asignar, escalar, verificar, resolver, cerrar) y el
 * incidente asociado se operan a partir del Chunk 6.
 */

import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { getResidentById, getStaffMemberById, listAlerts, listIncidents } from '../data/repository';

const SEVERITY_LABEL: Record<string, string> = { red: 'Roja', yellow: 'Amarilla' };

const AlertList = (): JSX.Element => {
  const { refreshToken } = useDemoSession();
  const alerts = useMemo(() => listAlerts(), [refreshToken]);

  return (
    <section>
      <h1>Alertas</h1>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Alerta</th>
              <th>Residente</th>
              <th>Severidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td>
                  <Link to={`/alertas/${alert.id}`}>{alert.id}</Link>
                </td>
                <td>{getResidentById(alert.residentId)?.displayName ?? alert.residentId}</td>
                <td>{SEVERITY_LABEL[alert.severity] ?? alert.severity}</td>
                <td>{alert.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const AlertDetail = ({ alertId }: { alertId: string }): JSX.Element => {
  const { refreshToken } = useDemoSession();
  const data = useMemo(
    () => ({
      alert: listAlerts().find((a) => a.id === alertId),
      incident: listIncidents().find((i) => i.alertId === alertId),
    }),
    [alertId, refreshToken],
  );

  if (data.alert === undefined) {
    return (
      <section>
        <p>No se encontró la alerta "{alertId}".</p>
        <Link to="/alertas">Volver a la lista de alertas</Link>
      </section>
    );
  }

  const resident = getResidentById(data.alert.residentId);
  const assignedStaff = getStaffMemberById(data.alert.assignedStaffId ?? '');

  return (
    <section>
      <p>
        <Link to="/alertas">← Volver a alertas</Link>
      </p>
      <h1>Alerta {data.alert.id}</h1>
      <dl className="detail-list">
        <dt>Residente</dt>
        <dd>
          {resident !== undefined ? <Link to={`/residentes/${resident.id}`}>{resident.displayName}</Link> : data.alert.residentId}
        </dd>
        <dt>Severidad</dt>
        <dd>{SEVERITY_LABEL[data.alert.severity] ?? data.alert.severity}</dd>
        <dt>Estado</dt>
        <dd>{data.alert.status}</dd>
        <dt>Asignada a</dt>
        <dd>{assignedStaff?.displayName ?? 'Sin asignar'}</dd>
        <dt>Creada</dt>
        <dd>{new Date(data.alert.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</dd>
        {data.alert.verificationOutcome !== undefined && (
          <>
            <dt>Resultado de verificación</dt>
            <dd>{data.alert.verificationOutcome}</dd>
          </>
        )}
      </dl>

      <h2>Incidente asociado</h2>
      {data.incident === undefined ? (
        <p>Esta alerta no tiene un incidente de verificación asociado todavía.</p>
      ) : (
        <dl className="detail-list">
          <dt>Incidente</dt>
          <dd>{data.incident.id}</dd>
          <dt>Estado</dt>
          <dd>{data.incident.status}</dd>
          {data.incident.outcome !== undefined && (
            <>
              <dt>Resultado</dt>
              <dd>{data.incident.outcome}</dd>
            </>
          )}
        </dl>
      )}
    </section>
  );
};

export const AlertDetailPage = (): JSX.Element => {
  const { alertId } = useParams<{ alertId?: string }>();
  return alertId === undefined ? <AlertList /> : <AlertDetail alertId={alertId} />;
};
