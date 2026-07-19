/**
 * AppLayout.tsx — Cascarón visual y navegación global (contrato Chunk 4).
 *
 * Elementos globales exigidos por el contrato: encabezado con nombre CareSignal,
 * selector de usuario ficticio, indicador de rol, hora simulada, navegación
 * responsive, botón para restablecer demo, indicador "Datos ficticios" y el aviso
 * "MVP operacional, no dispositivo médico". Ningún dato se lee de `localStorage`
 * aquí directamente: todo pasa por `demoClock`/`repository`/`resetDemo`.
 */

import { useState, type ChangeEvent } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useDemoSession } from './DemoSessionContext';
import { getCurrentTime } from '../data/demoClock';
import { resetDemo } from '../data/resetDemo';

const ROLE_LABELS: Record<string, string> = {
  caregiver: 'Cuidador/a',
  supervisor: 'Supervisor/a',
  demo_admin: 'Administrador/a de demo',
};

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/mis-rondas', label: 'Mis rondas' },
  { to: '/residentes', label: 'Residentes' },
  { to: '/alertas', label: 'Alertas' },
  { to: '/control-demo', label: 'Control de demo' },
];

export const AppLayout = (): JSX.Element => {
  const { staffMembers, activeStaffId, activeStaff, setActiveStaffId, refreshDemoData } = useDemoSession();
  const [navOpen, setNavOpen] = useState(false);

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
            <span className="session-field__label">Usuario ficticio</span>
            <select value={activeStaffId} onChange={handleUserChange}>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.displayName}
                </option>
              ))}
            </select>
          </label>

          <span className="session-field">
            <span className="session-field__label">Rol</span>
            <span className="role-indicator">{ROLE_LABELS[activeStaff.role] ?? activeStaff.role}</span>
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
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link')}
            onClick={() => setNavOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};
