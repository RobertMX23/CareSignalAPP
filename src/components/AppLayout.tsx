/**
 * AppLayout.tsx — Cascarón visual y navegación global (contrato Chunk 4).
 *
 * Elementos globales exigidos por el contrato: encabezado con nombre CareSignal,
 * selector de usuario ficticio, indicador de rol, hora simulada, navegación
 * responsive, botón para restablecer demo, indicador "Datos ficticios" y el aviso
 * "MVP operacional, no dispositivo médico". Ningún dato se lee de `localStorage`
 * aquí directamente: todo pasa por `demoClock`/`repository`/`resetDemo`.
 */

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useDemoSession } from './DemoSessionContext';
import type { Role, Shift } from '../domain/taxonomy';
import { getCurrentTime } from '../data/demoClock';
import { resetDemo } from '../data/resetDemo';
import { listAlerts, listResidents, listRounds, listStaffMembers } from '../data/repository';
import { deriveResidentStatus, isAlertActive } from '../domain/rules';

const ROLE_LABELS: Record<string, string> = {
  caregiver:  'Cuidador/a',
  supervisor: 'Supervisor/a',
  manager:    'Gerente',
  demo_admin: 'Administrador/a de demo',
};

const SHIFT_LABELS: Record<Shift, string> = {
  morning:   'Mañana',
  afternoon: 'Tarde',
  night:     'Noche',
  on_call:   'Guardia',
};

const NAV_ITEMS: { to: string; label: string; roles: Role[] }[] = [
  { to: '/dashboard',    label: 'Dashboard',       roles: ['supervisor', 'manager', 'demo_admin'] },
  { to: '/mis-rondas',   label: 'Mis rondas',      roles: ['caregiver', 'demo_admin'] },
  { to: '/residentes',   label: 'Residentes',      roles: ['supervisor', 'manager', 'demo_admin'] },
  { to: '/alertas',      label: 'Alertas',         roles: ['supervisor', 'manager', 'demo_admin'] },
  { to: '/manager',      label: 'Vista ejecutiva', roles: ['manager', 'demo_admin'] },
  { to: '/bitacora',    label: 'Bitácora',        roles: ['manager', 'demo_admin'] },
  { to: '/personal',    label: 'Personal',        roles: ['supervisor', 'manager', 'demo_admin'] },
  { to: '/control-demo', label: 'Control de demo', roles: ['demo_admin'] },
];

export const AppLayout = (): JSX.Element => {
  const { staffMembers, activeStaffId, activeStaff, setActiveStaffId, refreshDemoData } = useDemoSession();
  const [navOpen, setNavOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
  const [filterShift, setFilterShift] = useState<Shift | 'all'>('all');

  const _residents = listResidents();
  const _rounds = listRounds();
  const _alerts = listAlerts();
  const _staff = listStaffMembers();
  const urgentCount      = _residents.filter((r) => deriveResidentStatus(r.id, _rounds, _alerts) === 'red').length;
  const activeAlertsCount = _alerts.filter((a) => isAlertActive(a.status)).length;
  const availableStaff   = _staff.filter((s) => s.availability === 'available').length;

  const NAV_BADGES: Record<string, number> = {
    '/residentes': urgentCount,
    '/alertas':    activeAlertsCount,
    '/personal':   availableStaff,
  };

  const availableRoles = useMemo(
    () => Array.from(new Set(staffMembers.map((s) => s.role))) as Role[],
    [staffMembers],
  );
  const availableShifts = useMemo(
    () => Array.from(new Set(staffMembers.map((s) => s.shift))) as Shift[],
    [staffMembers],
  );

  const filteredStaff = useMemo(
    () =>
      staffMembers.filter(
        (s) =>
          (filterRole === 'all' || s.role === filterRole) &&
          (filterShift === 'all' || s.shift === filterShift),
      ),
    [staffMembers, filterRole, filterShift],
  );

  useEffect(() => {
    if (filteredStaff.length === 0) return;
    const isActiveInFilter = filteredStaff.some((s) => s.id === activeStaffId);
    if (!isActiveInFilter) {
      setActiveStaffId(filteredStaff[0].id);
    }
  }, [filteredStaff, activeStaffId, setActiveStaffId]);

  const currentTime = getCurrentTime();
  const formattedTime = new Date(currentTime).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handleUserChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setActiveStaffId(event.target.value);
  };

  const handleResetDemo = (): void => {
    const confirmed = window.confirm(
      'Esto restablece todos los datos ficticios y el reloj simulado a su estado inicial. ¿Continuar?',
    );
    if (!confirmed) return;
    resetDemo();
    refreshDemoData();
  };

  return (
    <div className="app-shell">
      <p className="banner banner--notice">MVP operacional, no dispositivo médico</p>

      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__title">CareSignal</span>
          <span className="badge badge--fictional">Datos ficticios</span>
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={navOpen}
          aria-controls="app-nav"
          onClick={() => setNavOpen((open) => !open)}
        >
          Menú
        </button>

        <div className="app-header__session">
          <label className="session-field">
            <span className="session-field__label">Filtrar por rol</span>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as Role | 'all')}>
              <option value="all">Todos los roles</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
              ))}
            </select>
          </label>

          <label className="session-field">
            <span className="session-field__label">Filtrar por turno</span>
            <select value={filterShift} onChange={(e) => setFilterShift(e.target.value as Shift | 'all')}>
              <option value="all">Todos los turnos</option>
              {availableShifts.map((s) => (
                <option key={s} value={s}>{SHIFT_LABELS[s] ?? s}</option>
              ))}
            </select>
          </label>

          <span className="session-field__separator" aria-hidden="true" />

          <label className="session-field">
            <span className="session-field__label">Usuario ficticio</span>
            <select value={activeStaffId} onChange={handleUserChange}>
              {filteredStaff.length === 0 ? (
                <option value={activeStaffId}>{activeStaff.displayName}</option>
              ) : (
                filteredStaff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.displayName}
                  </option>
                ))
              )}
            </select>
          </label>

          <span className="session-field">
            <span className="session-field__label">Rol</span>
            <span className={`badge badge--role-${activeStaff.role}`}>{ROLE_LABELS[activeStaff.role] ?? activeStaff.role}</span>
          </span>

          <span className="session-field">
            <span className="session-field__label">Hora simulada</span>
            <span className="clock-indicator">{formattedTime}</span>
          </span>

          <button type="button" className="button button--secondary" onClick={handleResetDemo}>
            Restablecer demo
          </button>
        </div>
      </header>

      <nav id="app-nav" className={navOpen ? 'app-nav app-nav--open' : 'app-nav'}>
        {NAV_ITEMS.filter((item) => item.roles.includes(activeStaff.role)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link')}
            onClick={() => setNavOpen(false)}
          >
            {item.label}
            {(NAV_BADGES[item.to] ?? 0) > 0 && (
              <span className={`nav-urgent-badge${item.to === '/personal' ? ' nav-urgent-badge--green' : ''}`}>
                {NAV_BADGES[item.to]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};
