/**
 * lighthouse-report.test.ts — Generador del informe público de Lighthouse (B-03).
 *
 *   L-01  corrida representativa = mediana de rendimiento
 *   L-02  puntajes como enteros 0–100 y rango entre corridas
 *   L-03  insignia (shields endpoint): mensaje y color según el peor puntaje
 *   L-04  HTML sin <script>, con avisos del contrato y escapado de texto externo
 *   L-05  categorías ausentes no rompen el informe
 *   L-06  sin reportes → error claro
 *   L-07  métricas con formato legible (s, ms, CLS)
 */

import { describe, expect, it } from 'vitest';
import {
  badgeJson,
  pickRepresentative,
  renderHtml,
  summarize,
  type LhrLike,
} from '../scripts/lighthouse-report.mjs';

const lhr = (perf: number, a11y = 0.9, bp = 0.96, seo = 0.9): LhrLike => ({
  lighthouseVersion: '12.1.0',
  fetchTime: '2026-10-16T03:56:38.578Z',
  configSettings: { formFactor: 'mobile', throttlingMethod: 'simulate' },
  categories: {
    performance: { score: perf },
    accessibility: { score: a11y },
    'best-practices': { score: bp },
    seo: { score: seo },
  },
  audits: {
    'first-contentful-paint': { numericValue: 2400 },
    'largest-contentful-paint': { numericValue: 2660 },
    'total-blocking-time': { numericValue: 117.6 },
    'cumulative-layout-shift': { numericValue: 0 },
    'speed-index': { numericValue: 2400 },
  },
});

describe('informe de Lighthouse', () => {
  it('L-01: la representativa es la mediana de rendimiento', () => {
    const runs = [lhr(0.94), lhr(0.91), lhr(0.93)];
    expect(pickRepresentative(runs).categories?.performance?.score).toBe(0.93);
    expect(pickRepresentative([lhr(0.5)]).categories?.performance?.score).toBe(0.5);
  });

  it('L-02: puntajes enteros y rango entre corridas', () => {
    const s = summarize([lhr(0.94), lhr(0.91), lhr(0.93)]);
    expect(s.scores).toEqual({ performance: 93, accessibility: 90, 'best-practices': 96, seo: 90 });
    expect(s.range.performance).toEqual([91, 94]);
    expect(s.range.accessibility).toEqual([90, 90]);
    expect(s.runs).toBe(3);
  });

  it('L-03: insignia con mensaje y color por el peor puntaje', () => {
    const verde = badgeJson(summarize([lhr(0.97, 0.95, 0.96, 0.92)]));
    expect(verde.message).toBe('perf 97 · a11y 95 · bp 96 · seo 92');
    expect(verde.color).toBe('brightgreen');
    expect(verde.schemaVersion).toBe(1);
    expect(badgeJson(summarize([lhr(0.8)])).color).toBe('yellowgreen');
    expect(badgeJson(summarize([lhr(0.6)])).color).toBe('orange');
    expect(badgeJson(summarize([lhr(0.3)])).color).toBe('red');
  });

  it('L-04: HTML sin scripts, con avisos y texto escapado', () => {
    const s = summarize([lhr(0.93)], { commit: '<img src=x onerror=alert(1)>', runUrl: 'https://example.test/?a=1&b="2"' });
    const html = renderHtml(s);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
    expect(html).toContain('&amp;b=&quot;2&quot;');
    expect(html).toContain('<html lang="es">');
    expect(html).toContain('no dispositivo médico');
    expect(html).toContain('Datos ficticios');
    expect(html).toContain('PWA');
  });

  it('L-05: categorías ausentes no rompen', () => {
    const parcial: LhrLike = { lighthouseVersion: '12.1.0', categories: { performance: { score: 0.9 } }, audits: {} };
    const s = summarize([parcial]);
    expect(s.scores.accessibility).toBeNull();
    expect(s.metrics.every((m) => m.value === '—')).toBe(true);
    expect(() => renderHtml(s)).not.toThrow();
    expect(badgeJson(s).message).toBe('perf 90');
  });

  it('L-06: sin reportes → error claro', () => {
    expect(() => summarize([])).toThrow('No hay reportes de Lighthouse.');
  });

  it('L-07: métricas con formato legible', () => {
    const m = Object.fromEntries(summarize([lhr(0.93)]).metrics.map((x) => [x.id, x.value]));
    expect(m['first-contentful-paint']).toBe('2.4 s');
    expect(m['largest-contentful-paint']).toBe('2.7 s');
    expect(m['total-blocking-time']).toBe('118 ms');
    expect(m['cumulative-layout-shift']).toBe('0');
  });
});
