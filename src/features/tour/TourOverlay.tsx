/**
 * TourOverlay.tsx — Resaltado y globo de cada paso del recorrido (L-05 / B-08).
 *
 * El oscurecido es una sombra enorme alrededor del elemento (sin capturar clics), así
 * que el elemento resaltado sigue siendo utilizable y los avisos "MVP operacional, no
 * dispositivo médico" y "Datos ficticios" siguen visibles (atenuados, nunca cubiertos:
 * el globo no sube de 72 px). Controles: Anterior, Siguiente, Saltar y Esc. El paso
 * actual se anuncia en una región `aria-live`.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTour } from './TourContext';

const SPOT_PAD = 6;
const CARD_GAP = 14;
const MIN_TOP = 72;
const EDGE = 12;
const NARROW_PX = 640;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), Math.max(min, max));

export const TourOverlay = (): JSX.Element | null => {
  const { steps, stepIndex, next, prev, close } = useTour();
  const { pathname } = useLocation();
  const step = steps[stepIndex];

  const cardRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardSize, setCardSize] = useState({ w: 360, h: 220 });
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  const locate = useCallback((): HTMLElement | null => {
    if (step?.target === undefined) return null;
    // Puede haber variantes responsive duplicadas: se toma la primera visible.
    const candidates = document.querySelectorAll<HTMLElement>(`[data-tour="${step.target}"]`);
    for (const el of candidates) {
      const box = el.getBoundingClientRect();
      if (box.width > 0 && box.height > 0) return el;
    }
    return null;
  }, [step]);

  // Busca el elemento una vez que la ruta del paso está montada (con reintentos).
  useEffect(() => {
    setRect(null);
    if (step === undefined || step.target === undefined || pathname !== step.route) return undefined;

    let cancelled = false;
    let tries = 0;
    let timer: number | undefined;

    const find = (): void => {
      if (cancelled) return;
      const el = locate();
      if (el !== null) {
        el.scrollIntoView({ block: 'center', behavior: 'auto' });
        setRect(el.getBoundingClientRect());
        return;
      }
      tries += 1;
      if (tries < 20) timer = window.setTimeout(find, 100);
    };
    find();

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [step, pathname, locate]);

  // Mantiene el resaltado al redimensionar o desplazar.
  useEffect(() => {
    const update = (): void => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      const el = locate();
      if (el !== null) setRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [locate]);

  // Esc cierra el recorrido.
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  // Mide el globo y le da el foco en cada paso.
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (el === null) return;
    setCardSize({ w: el.offsetWidth, h: el.offsetHeight });
    el.focus({ preventScroll: true });
  }, [step, rect]);

  if (step === undefined) return null;

  const narrow = viewport.w <= NARROW_PX;
  const isLast = stepIndex === steps.length - 1;
  const isFirst = stepIndex === 0;

  let cardStyle: React.CSSProperties;
  if (narrow) {
    cardStyle = { left: EDGE, right: EDGE, bottom: EDGE };
  } else if (rect !== null) {
    const left = clamp(rect.left, EDGE, viewport.w - cardSize.w - EDGE);
    const below = rect.bottom + SPOT_PAD + CARD_GAP;
    const fitsBelow = below + cardSize.h <= viewport.h - EDGE;
    const top = fitsBelow
      ? below
      : Math.max(MIN_TOP, Math.min(rect.top - SPOT_PAD - CARD_GAP - cardSize.h, viewport.h - cardSize.h - EDGE));
    cardStyle = { left, top };
  } else {
    cardStyle = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  }

  return (
    <>
      {rect !== null ? (
        <div
          className="tour-spotlight"
          aria-hidden="true"
          style={{
            top: rect.top - SPOT_PAD,
            left: rect.left - SPOT_PAD,
            width: rect.width + SPOT_PAD * 2,
            height: rect.height + SPOT_PAD * 2,
          }}
        />
      ) : (
        <div className="tour-dim" aria-hidden="true" />
      )}

      <div
        ref={cardRef}
        className={narrow ? 'tour-card tour-card--docked' : 'tour-card'}
        style={cardStyle}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        tabIndex={-1}
      >
        <p className="tour-card__step">
          Paso {stepIndex + 1} de {steps.length}
        </p>
        <h2 id="tour-title" className="tour-card__title">
          {step.title}
        </h2>
        <p className="tour-card__body">{step.body}</p>
        <div className="tour-card__actions">
          <button type="button" className="link-button" onClick={close}>
            Saltar recorrido
          </button>
          <span className="tour-card__nav">
            <button type="button" className="button button--small button--secondary" onClick={prev} disabled={isFirst}>
              Anterior
            </button>
            <button type="button" className="button button--small" onClick={next}>
              {isLast ? 'Finalizar' : 'Siguiente'}
            </button>
          </span>
        </div>
      </div>

      <p className="tour-sr" aria-live="polite">
        Paso {stepIndex + 1} de {steps.length}: {step.title}
      </p>
    </>
  );
};
