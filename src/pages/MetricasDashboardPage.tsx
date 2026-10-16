import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { listAlerts, listResidents, listRounds } from '../data/repository';
import { getCurrentTime } from '../data/demoClock';
import type { Alert, Round } from '../domain/types';

// ── utilidades ────────────────────────────────────────────────────────────────

function minutesBetween(from: string, to: string): number {
  return Math.max(0, (new Date(to).getTime() - new Date(from).getTime()) / 60_000);
}

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

// ── cálculo de métricas ───────────────────────────────────────────────────────

interface Metrics {
  pctCompletedOnTime: number;
  pctOverdue: number;
  avgResolutionMinutes: number;
  alertCounts: { open: number; escalated: number; resolved: number; closed: number };
  top3Residents: { name: string; count: number }[];
  roundsByHour: { hour: string; completadas: number; vencidas: number }[];
  alertBySeverity: { name: string; value: number; color: string }[];
}

function computeMetrics(rounds: Round[], alerts: Alert[], residentMap: Map<string, string>): Metrics {
  const totalRounds = rounds.length;

  const completedOnTime = rounds.filter(
    (r) => r.status === 'completed' && r.completedAt != null && r.completedAt <= r.dueAt,
  ).length;

  const overdueCount = rounds.filter((r) => r.status === 'overdue').length;

  const resolvedAlerts = alerts.filter((a) => a.resolvedAt != null);
  const avgResolutionMinutes =
    resolvedAlerts.length === 0
      ? 0
      : Math.round(
          resolvedAlerts.reduce((acc, a) => acc + minutesBetween(a.createdAt, a.resolvedAt!), 0) /
            resolvedAlerts.length,
        );

  const alertCounts = {
    open:     alerts.filter((a) => a.status === 'open' || a.status === 'acknowledged' || a.status === 'assigned').length,
    escalated: alerts.filter((a) => a.status === 'escalated' || a.status === 'in_verification').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
    closed:   alerts.filter((a) => a.status === 'closed').length,
  };

  const activeAlerts = alerts.filter(
    (a) => ['open', 'acknowledged', 'assigned', 'escalated', 'in_verification'].includes(a.status),
  );
  const countByResident = new Map<string, number>();
  for (const a of activeAlerts) {
    countByResident.set(a.residentId, (countByResident.get(a.residentId) ?? 0) + 1);
  }
  const top3Residents = [...countByResident.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => ({ name: residentMap.get(id) ?? id, count }));

  // Rondas por hora del día (usando scheduledAt)
  const hourBuckets: Record<number, { completadas: number; vencidas: number }> = {};
  for (const r of rounds) {
    const h = new Date(r.scheduledAt).getHours();
    if (!hourBuckets[h]) hourBuckets[h] = { completadas: 0, vencidas: 0 };
    if (r.status === 'completed') hourBuckets[h].completadas++;
    if (r.status === 'overdue') hourBuckets[h].vencidas++;
  }
  const roundsByHour = Object.entries(hourBuckets)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([h, v]) => ({ hour: `${h.padStart(2, '0')}h`, ...v }));

  // Alertas por severidad (totales)
  const yellowCount = alerts.filter((a) => a.severity === 'yellow').length;
  const redCount    = alerts.filter((a) => a.severity === 'red').length;
  const alertBySeverity = [
    { name: 'Amarilla', value: yellowCount, color: '#d29922' },
    { name: 'Roja',     value: redCount,    color: '#f85149' },
  ].filter((d) => d.value > 0);

  return {
    pctCompletedOnTime: pct(completedOnTime, totalRounds),
    pctOverdue:         pct(overdueCount, totalRounds),
    avgResolutionMinutes,
    alertCounts,
    top3Residents,
    roundsByHour,
    alertBySeverity,
  };
}

// ── sub-componentes ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: 'green' | 'red' | 'yellow' | 'neutral';
}

const KpiCard = ({ label, value, sub, accent = 'neutral' }: KpiCardProps): JSX.Element => (
  <div className={`kpi-card kpi-card--${accent}`}>
    <span className="kpi-card__value">{value}</span>
    <span className="kpi-card__label">{label}</span>
    {sub && <span className="kpi-card__sub">{sub}</span>}
  </div>
);

// ── página principal ──────────────────────────────────────────────────────────

export const MetricasDashboardPage = (): JSX.Element => {
  const rounds    = listRounds();
  const alerts    = listAlerts();
  const residents = listResidents();
  const now       = getCurrentTime();

  const residentMap = useMemo(
    () => new Map(residents.map((r) => [r.id, r.displayName])),
    [residents],
  );

  const m = useMemo(
    () => computeMetrics(rounds, alerts, residentMap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rounds.length, alerts.length, residentMap, now],
  );

  const formattedNow = new Date(now).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="page-content metricas-page">
      <div className="page-header">
        <h1 className="page-title">Métricas del turno</h1>
        <span className="metricas-timestamp">Actualizado: {formattedNow}</span>
      </div>

      {/* ── KPIs ── */}
      <section aria-label="Indicadores clave" data-tour="metrics-kpis">
        <div className="kpi-grid">
          <KpiCard
            label="Rondas completadas a tiempo"
            value={`${m.pctCompletedOnTime}%`}
            sub={`${rounds.filter((r) => r.status === 'completed').length} de ${rounds.length}`}
            accent={m.pctCompletedOnTime >= 70 ? 'green' : 'yellow'}
          />
          <KpiCard
            label="Rondas vencidas"
            value={`${m.pctOverdue}%`}
            sub={`${rounds.filter((r) => r.status === 'overdue').length} rondas`}
            accent={m.pctOverdue === 0 ? 'green' : m.pctOverdue < 20 ? 'yellow' : 'red'}
          />
          <KpiCard
            label="Tiempo promedio de resolución"
            value={m.avgResolutionMinutes === 0 ? '—' : `${m.avgResolutionMinutes} min`}
            sub="alertas resueltas"
            accent="neutral"
          />
          <KpiCard
            label="Alertas activas"
            value={String(m.alertCounts.open + m.alertCounts.escalated)}
            sub={`${m.alertCounts.escalated} en escalada`}
            accent={m.alertCounts.escalated > 0 ? 'red' : m.alertCounts.open > 0 ? 'yellow' : 'green'}
          />
          <KpiCard
            label="Alertas resueltas / cerradas"
            value={`${m.alertCounts.resolved + m.alertCounts.closed}`}
            sub={`${m.alertCounts.closed} cerradas`}
            accent="green"
          />
        </div>
      </section>

      {/* ── Top 3 residentes ── */}
      {m.top3Residents.length > 0 && (
        <section aria-label="Residentes con más alertas activas" className="metricas-section">
          <h2 className="section-title">Top residentes con alertas activas</h2>
          <ol className="top-residents-list">
            {m.top3Residents.map((r, i) => (
              <li key={r.name} className="top-residents-list__item">
                <span className="top-residents-list__rank" aria-hidden="true">{i + 1}</span>
                <span className="top-residents-list__name">{r.name}</span>
                <span className={`badge badge--alert-count ${r.count >= 2 ? 'badge--alert-count-red' : 'badge--alert-count-yellow'}`}>
                  {r.count} {r.count === 1 ? 'alerta' : 'alertas'}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Gráfica 1: Rondas por hora ── */}
      <section aria-label="Rondas por hora del turno" className="metricas-section">
        <h2 className="section-title">Rondas por hora</h2>
        {m.roundsByHour.length === 0 ? (
          <p className="metricas-empty">Sin datos de rondas para graficar.</p>
        ) : (
          <div className="chart-container" role="img" aria-label="Gráfica de barras: rondas completadas y vencidas por hora">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={m.roundsByHour} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #30363d)" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="completadas" name="Completadas" fill="#3fb950" radius={[3, 3, 0, 0]} />
                <Bar dataKey="vencidas"    name="Vencidas"    fill="#f85149" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-legend" aria-hidden="true">
              <span className="chart-legend__item chart-legend__item--green">Completadas</span>
              <span className="chart-legend__item chart-legend__item--red">Vencidas</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Gráfica 2: Alertas por severidad ── */}
      <section aria-label="Distribución de alertas por severidad" className="metricas-section">
        <h2 className="section-title">Alertas por severidad</h2>
        {m.alertBySeverity.length === 0 ? (
          <p className="metricas-empty">Sin alertas registradas.</p>
        ) : (
          <div className="chart-container chart-container--pie" role="img" aria-label="Gráfica de donut: alertas por severidad">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={m.alertBySeverity}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {m.alertBySeverity.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
};
