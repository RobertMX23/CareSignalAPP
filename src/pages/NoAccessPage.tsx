/**
 * NoAccessPage.tsx — Cuenta autenticada pero sin provisionar (B-06, cierre).
 *
 * Aparece cuando el token de Google no trae `role`, `residenciaId` y `staffId` válidos.
 * Antes esas cuentas entraban como `demo_admin`; ahora no ven ninguna pantalla de la app.
 * La autorización real sigue en Firestore Rules y en el backend; esto evita además que la
 * interfaz las trate como usuarios con permisos.
 */

import { useAccess } from '../access/AccessContext';
import { useAuth } from '../contexts/AuthContext';

export const NoAccessPage = (): JSX.Element => {
  const { user, signOut } = useAuth();
  const { mode } = useAccess();
  const canExploreAsGuest = mode !== 'google';

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D1B36',
        padding: '1.5rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <section
        aria-labelledby="no-access-title"
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '2rem 2.25rem',
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <h1 id="no-access-title" style={{ margin: 0, fontSize: '1.15rem', color: '#0D1B36' }}>
          Tu cuenta aún no tiene acceso
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#4B5A75', lineHeight: 1.5 }}>
          {user !== null && user.email !== '' ? (
            <>
              La cuenta <strong>{user.email}</strong> inició sesión correctamente, pero todavía no está
              asociada a una residencia ni a un rol.
            </>
          ) : (
            <>Tu cuenta inició sesión correctamente, pero todavía no está asociada a una residencia ni a un rol.</>
          )}{' '}
          Pide a la persona administradora que la autorice y vuelve a iniciar sesión.
        </p>

        <button
          type="button"
          className="button"
          onClick={() => {
            void signOut();
          }}
        >
          {canExploreAsGuest ? 'Cerrar sesión y explorar como invitado' : 'Cerrar sesión'}
        </button>
      </section>

      <p
        style={{
          marginTop: '2rem',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.55)',
          textAlign: 'center',
          maxWidth: 340,
        }}
      >
        MVP operacional · no dispositivo médico · datos ficticios
      </p>
    </main>
  );
};
