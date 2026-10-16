#!/usr/bin/env node
/**
 * lighthouse-report.mjs — Informe público de Lighthouse (B-03).
 *
 * Toma los reportes JSON que genera `lhci autorun` (carpeta `lighthouse-report/`), elige la
 * corrida representativa (mediana de rendimiento) y escribe, listos para publicarse junto
 * con el sitio:
 *   <out>/index.html            página estática (sin scripts: cumple la CSP del sitio)
 *   <out>/lighthouse.json       puntajes y métricas
 *   <out>/lighthouse-badge.json esquema "endpoint" de shields.io para el README
 *
 * Uso:  node scripts/lighthouse-report.mjs lighthouse-report dist/informes
 * Variables opcionales (las pone GitHub Actions): GITHUB_SHA, GITHUB_RUN_ID, GITHUB_REPOSITORY.
 *
 * Las funciones puras se exportan para probarlas (`tests/lighthouse-report.test.ts`).
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CATEGORIES = [
  { key: 'performance', label: 'Rendimiento', short: 'perf' },
  { key: 'accessibility', label: 'Accesibilidad', short: 'a11y' },
  { key: 'best-practices', label: 'Buenas prácticas', short: 'bp' },
  { key: 'seo', label: 'SEO', short: 'seo' },
];

const METRICS = [
  { id: 'first-contentful-paint', label: 'First Contentful Paint', unit: 's' },
  { id: 'largest-contentful-paint', label: 'Largest Contentful Paint', unit: 's' },
  { id: 'total-blocking-time', label: 'Total Blocking Time', unit: 'ms' },
  { id: 'cumulative-layout-shift', label: 'Cumulative Layout Shift', unit: '' },
  { id: 'speed-index', label: 'Speed Index', unit: 's' },
];

const toPercent = (score) => (typeof score === 'number' ? Math.round(score * 100) : null);

/** Corrida representativa: la de la mediana de rendimiento (en empate, la primera). */
export const pickRepresentative = (lhrs) => {
  if (lhrs.length === 0) throw new Error('No hay reportes de Lighthouse.');
  const sorted = [...lhrs].sort(
    (a, b) => (a.categories?.performance?.score ?? 0) - (b.categories?.performance?.score ?? 0),
  );
  return sorted[Math.floor((sorted.length - 1) / 2)];
};

const formatMetric = (audit, unit) => {
  const value = audit?.numericValue;
  if (typeof value !== 'number') return '—';
  if (unit === 's') return `${(value / 1000).toFixed(1)} s`;
  if (unit === 'ms') return `${Math.round(value)} ms`;
  return value.toFixed(3).replace(/\.?0+$/, '') || '0';
};

export const summarize = (lhrs, meta = {}) => {
  const lhr = pickRepresentative(lhrs);
  const scores = {};
  for (const { key } of CATEGORIES) scores[key] = toPercent(lhr.categories?.[key]?.score);

  const allScores = CATEGORIES.map(({ key }) => ({
    key,
    values: lhrs.map((r) => toPercent(r.categories?.[key]?.score)).filter((v) => v !== null),
  }));
  const range = Object.fromEntries(
    allScores.map(({ key, values }) => [key, values.length > 0 ? [Math.min(...values), Math.max(...values)] : null]),
  );

  return {
    scores,
    range,
    metrics: METRICS.map(({ id, label, unit }) => ({ id, label, value: formatMetric(lhr.audits?.[id], unit) })),
    runs: lhrs.length,
    lighthouseVersion: lhr.lighthouseVersion ?? 'desconocida',
    formFactor: lhr.configSettings?.formFactor ?? 'desconocido',
    throttling: lhr.configSettings?.throttlingMethod ?? 'desconocido',
    measuredAt: lhr.fetchTime ?? null,
    auditedPage: 'Pantalla de entrada del modo invitado (build de producción servido en un servidor estático)',
    commit: meta.commit ?? null,
    runUrl: meta.runUrl ?? null,
  };
};

const colorFor = (min) => (min >= 90 ? 'brightgreen' : min >= 75 ? 'yellowgreen' : min >= 50 ? 'orange' : 'red');

/** Esquema "endpoint" de shields.io. */
export const badgeJson = (summary) => {
  const values = CATEGORIES.map(({ key, short }) => ({ short, value: summary.scores[key] })).filter((c) => c.value !== null);
  const min = values.length > 0 ? Math.min(...values.map((c) => c.value)) : 0;
  return {
    schemaVersion: 1,
    label: 'Lighthouse',
    message: values.map((c) => `${c.short} ${c.value}`).join(' · '),
    color: colorFor(min),
  };
};

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const scoreClass = (value) => (value === null ? 'na' : value >= 90 ? 'good' : value >= 50 ? 'mid' : 'bad');

/** Página estática autocontenida: sin <script>, solo <style> en línea. */
export const renderHtml = (summary) => {
  const cards = CATEGORIES.map(({ key, label }) => {
    const value = summary.scores[key];
    const r = summary.range[key];
    const rangeText = r && r[0] !== r[1] ? `rango en ${summary.runs} corridas: ${r[0]}–${r[1]}` : `${summary.runs} corridas`;
    return `<li class="card ${scoreClass(value)}"><span class="score">${value ?? '—'}</span><span class="name">${escapeHtml(label)}</span><span class="range">${escapeHtml(rangeText)}</span></li>`;
  }).join('\n      ');

  const rows = summary.metrics
    .map((m) => `<tr><th scope="row">${escapeHtml(m.label)}</th><td>${escapeHtml(m.value)}</td></tr>`)
    .join('\n        ');

  const when = summary.measuredAt ? escapeHtml(summary.measuredAt.replace('T', ' ').replace(/\.\d+Z$/, ' UTC')) : 'desconocida';
  const commit = summary.commit ? `<code>${escapeHtml(summary.commit.slice(0, 7))}</code>` : 'desconocido';
  const run = summary.runUrl ? ` · <a href="${escapeHtml(summary.runUrl)}">ejecución de CI</a>` : '';

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Informe Lighthouse — CareSignal</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #f7f4f0; color: #231a0f; }
    header { background: #0d1b36; color: #fff; padding: 1.25rem 1rem; }
    header h1 { margin: 0; font-size: 1.25rem; }
    header p { margin: 0.25rem 0 0; font-size: 0.85rem; opacity: 0.8; }
    main { max-width: 760px; margin: 0 auto; padding: 1rem; }
    ul.cards { list-style: none; padding: 0; margin: 1rem 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; }
    .card { background: #fff; border: 1px solid #ddd3c5; border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .score { font-size: 2.25rem; font-weight: 800; line-height: 1; }
    .good .score { color: #0b6b2e; } .mid .score { color: #8a5a00; } .bad .score { color: #a31515; } .na .score { color: #5a4a36; }
    .name { font-weight: 700; } .range { font-size: 0.75rem; color: #5a4a36; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #ddd3c5; border-radius: 8px; }
    th, td { text-align: left; padding: 0.55rem 0.75rem; border-bottom: 1px solid #ede6db; }
    h2 { font-size: 1.05rem; margin: 1.5rem 0 0.5rem; }
    .note { font-size: 0.85rem; line-height: 1.5; color: #4b3b28; }
    a { color: #0b4f9c; }
    footer { padding: 1rem; text-align: center; font-size: 0.75rem; color: #5a4a36; }
  </style>
</head>
<body>
  <header>
    <h1>Informe Lighthouse — CareSignal</h1>
    <p>Medición automática en CI · MVP operacional, no dispositivo médico · Datos ficticios</p>
  </header>
  <main>
    <section aria-labelledby="scores">
      <h2 id="scores">Puntajes (0–100)</h2>
      <ul class="cards">
      ${cards}
      </ul>
    </section>
    <section aria-labelledby="metrics">
      <h2 id="metrics">Métricas de la corrida representativa</h2>
      <table>
        <tbody>
        ${rows}
        </tbody>
      </table>
    </section>
    <section aria-labelledby="how">
      <h2 id="how">Cómo se midió</h2>
      <p class="note">
        Lighthouse ${escapeHtml(summary.lighthouseVersion)}, factor de forma <strong>${escapeHtml(summary.formFactor)}</strong>,
        limitación de red/CPU <strong>${escapeHtml(summary.throttling)}</strong>, ${summary.runs} corridas (se muestra la mediana de rendimiento).
        Página auditada: ${escapeHtml(summary.auditedPage)}. Medido el ${when}, commit ${commit}${run}.
      </p>
      <p class="note">
        Es una medición de laboratorio sobre una sola pantalla, no sobre usuarios reales ni sobre el resto de la aplicación.
        La categoría PWA ya no existe en Lighthouse 12 y no se informa.
      </p>
    </section>
  </main>
  <footer>Generado por <code>scripts/lighthouse-report.mjs</code> en cada despliegue de la demo.</footer>
</body>
</html>
`;
};

const readReports = (dir) =>
  readdirSync(dir)
    .filter((name) => name.endsWith('.report.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(dir, name), 'utf-8')));

const main = () => {
  const [reportDir, outDir] = process.argv.slice(2);
  if (!reportDir || !outDir) {
    console.error('Uso: node scripts/lighthouse-report.mjs <carpeta-de-reportes> <carpeta-de-salida>');
    process.exitCode = 1;
    return;
  }
  const repo = process.env.GITHUB_REPOSITORY;
  const runId = process.env.GITHUB_RUN_ID;
  const summary = summarize(readReports(reportDir), {
    commit: process.env.GITHUB_SHA,
    runUrl: repo && runId ? `https://github.com/${repo}/actions/runs/${runId}` : undefined,
  });

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), renderHtml(summary));
  writeFileSync(join(outDir, 'lighthouse.json'), `${JSON.stringify(summary, null, 2)}\n`);
  writeFileSync(join(outDir, 'lighthouse-badge.json'), `${JSON.stringify(badgeJson(summary))}\n`);
  console.log(`✔ Informe escrito en ${outDir}: ${badgeJson(summary).message}`);
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
