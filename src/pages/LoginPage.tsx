/**
 * LoginPage.tsx — Pantalla de inicio de sesión con Google SSO.
 *
 * Solo visible cuando user === null (AuthProvider). No hay formulario
 * de email/password — solo Google SSO según contrato de producción.
 */

import { useAuth } from '../contexts/AuthContext';

export const LoginPage = (): JSX.Element => {
  const { signIn, loading, error } = useAuth();

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D1B36',
        padding: '1.5rem',
        gap: '0',
      }}
    >
      {/* Logotipo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#4A8FD4', '#D64C4C', '#D4922A', '#3B9E60'].map((c, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />
          ))}
        </div>
        <span style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.02em' }}>
          CareSignal
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '2rem 2.25rem',
          width: '100%',
          maxWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0D1B36', fontFamily: 'system-ui, sans-serif' }}>
            Iniciar sesión
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#4B5A75', fontFamily: 'system-ui, sans-serif' }}>
            Usa tu cuenta de Google de la residencia.
          </p>
        </div>

        <button
          onClick={signIn}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            border: '1px solid #D0D6E8',
            background: loading ? '#F5F6FA' : '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#0D1B36',
            fontFamily: 'system-ui, sans-serif',
            transition: 'background 0.15s',
          }}
        >
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Verificando…' : 'Continuar con Google'}
        </button>

        {error && (
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#C53030', background: '#FEF2F2', padding: '0.6rem 0.75rem', borderRadius: 6, fontFamily: 'system-ui, sans-serif' }}>
            {error}
          </p>
        )}

        <p style={{ margin: 0, fontSize: '0.72rem', color: '#8898B8', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          Solo se aceptan cuentas @residencia.com autorizadas.
        </p>
      </div>

      {/* Disclaimer */}
      <p style={{ marginTop: '2rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', fontFamily: 'system-ui, sans-serif', maxWidth: 340 }}>
        MVP operacional · no dispositivo médico · datos ficticios
      </p>
    </div>
  );
};
