/**
 * ErrorBoundary.tsx — Contención de errores de renderizado en dos niveles (B-05).
 *
 *   level="app"   → rodea toda la aplicación (`main.tsx`). Si algo falla fuera de una página
 *                   (proveedores, cabecera), muestra una pantalla completa. No depende de
 *                   ningún contexto ni del router: puede dibujarse aun cuando ellos fallen.
 *   level="page"  → rodea solo el contenido de la página (`AppLayout`). La navegación y la
 *                   cabecera siguen funcionando; cambiar de ruta (`resetKey`) limpia el error.
 *
 * El detalle técnico (mensaje, pila) va a la consola; la persona ve solo un identificador.
 * Los avisos del contrato ("MVP operacional, no dispositivo médico", "Datos ficticios")
 * permanecen visibles en ambos fallbacks.
 */

import { Component, createRef, type ErrorInfo, type ReactNode } from 'react';
import { resetDemo } from '../data/resetDemo';
import { reportError } from '../lib/errorReporting';

interface Props {
  level: 'app' | 'page';
  children: ReactNode;
  /** Cuando cambia, el error se descarta (p. ej. la ruta actual). */
  resetKey?: string;
}

interface State {
  error: Error | null;
  reportId: string | null;
}

const NOTICE = 'MVP operacional, no dispositivo médico · datos ficticios';

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, reportId: null };
  private readonly headingRef = createRef<HTMLHeadingElement>();

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const report = reportError(error, 'react-boundary', { componentStack: info.componentStack ?? undefined });
    this.setState({ reportId: report.id });
  }

  componentDidUpdate(prev: Props, prevState: State): void {
    if (this.state.error !== null && prev.resetKey !== this.props.resetKey) {
      this.reset();
      return;
    }
    if (prevState.error === null && this.state.error !== null) this.headingRef.current?.focus();
  }

  private reset = (): void => {
    this.setState({ error: null, reportId: null });
  };

  private resetDemoAndReload = (): void => {
    try {
      resetDemo();
    } catch {
      // Si el almacenamiento no responde, recargar igualmente.
    }
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.error === null) return this.props.children;

    const id = this.state.reportId;
    const isApp = this.props.level === 'app';

    const heading = (
      <h1 ref={this.headingRef} tabIndex={-1} style={{ margin: 0, fontSize: '1.15rem' }}>
        {isApp ? 'Algo salió mal' : 'Esta pantalla tuvo un problema'}
      </h1>
    );

    const body = (
      <>
        {heading}
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          {isApp
            ? 'La aplicación encontró un error inesperado. Puedes reintentar o restablecer la demo.'
            : 'El resto de la aplicación sigue funcionando. Puedes reintentar o ir a otra sección.'}{' '}
          Los datos son ficticios y no se envían a ningún servidor.
        </p>
        {id !== null && (
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Código del error: <code>{id}</code>
          </p>
        )}
        <div className="row-actions">
          <button type="button" className="button" onClick={this.reset}>
            Reintentar
          </button>
          <button type="button" className="button button--secondary" onClick={this.resetDemoAndReload}>
            Restablecer demo y recargar
          </button>
        </div>
      </>
    );

    if (!isApp) {
      return (
        <section role="alert" aria-live="assertive" className="error-fallback">
          {body}
          <p style={{ margin: 0, fontSize: '0.75rem' }}>{NOTICE}</p>
        </section>
      );
    }

    return (
      <main
        role="alert"
        aria-live="assertive"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '1.5rem',
          background: '#0D1B36',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <section
          className="error-fallback"
          style={{ background: '#fff', borderRadius: 12, padding: '2rem', maxWidth: 440, width: '100%', color: '#231a0f' }}
        >
          {body}
        </section>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>{NOTICE}</p>
      </main>
    );
  }
}
