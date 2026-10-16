/**
 * no-access.test.tsx — Pantalla de cuenta sin provisionar (B-06, cierre).
 *
 *   N-01  muestra el correo y el aviso del contrato; no ofrece ninguna ruta de la app
 *   N-02  "Cerrar sesión" llama a signOut
 *   N-03  en modo google solo dice "Cerrar sesión"; en hybrid ofrece explorar como invitado
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AccessContext, type AccessContextValue } from '../src/access/AccessContext';
import { AuthContext, type AuthContextValue } from '../src/contexts/AuthContext';
import type { AuthUser } from '../src/contexts/claims';
import { NoAccessPage } from '../src/pages/NoAccessPage';

const user: AuthUser = {
  uid: 'u1',
  email: 'persona@example.test',
  displayName: 'Persona',
  role: null,
  residenciaId: null,
  staffId: null,
  provisioned: false,
};

const renderPage = (mode: AccessContextValue['mode'], signOut = vi.fn(async () => undefined)) => {
  const auth: AuthContextValue = { user, loading: false, signIn: async () => undefined, signOut, error: null };
  const access: AccessContextValue = { mode, isGuest: false, enterAsGuest: null };
  render(
    <AuthContext.Provider value={auth}>
      <AccessContext.Provider value={access}>
        <NoAccessPage />
      </AccessContext.Provider>
    </AuthContext.Provider>,
  );
  return { signOut };
};

afterEach(() => cleanup());

describe('NoAccessPage', () => {
  it('N-01: muestra correo y aviso del contrato, sin enlaces a la app', () => {
    renderPage('google');
    expect(screen.getByText('persona@example.test')).toBeTruthy();
    expect(screen.getByText(/no dispositivo médico/i)).toBeTruthy();
    expect(screen.getByText(/datos ficticios/i)).toBeTruthy();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('N-02: Cerrar sesión llama a signOut', () => {
    const { signOut } = renderPage('google');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('N-03: el texto del botón depende del modo', () => {
    renderPage('google');
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeTruthy();
    cleanup();
    renderPage('hybrid');
    expect(screen.getByRole('button', { name: 'Cerrar sesión y explorar como invitado' })).toBeTruthy();
  });
});
