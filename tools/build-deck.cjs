/**
 * build-deck.js — Deck de pitch a inversionistas, CareSignal (.pptx nativo 16:9)
 * Contenido derivado del dossier ejecutivo. Estructura sandwich: láminas
 * oscuras para apertura/cierre, claras para contenido.
 */
const pptxgen = require('pptxgenjs');

// ---------- Paleta: identidad CareSignal (azul institucional + ámbar de señal) ----------
const DEEP    = '072D45';
const DEEP_2  = '0A3D5C';
const PAPER   = 'FFFFFF';
const SOFT    = 'B8D4E4';
const SOFT_2  = '7FADC7';
const LINE    = '17506F';
const AMBER   = 'E8B84B';
const AMBER_D = '8A5A00';

const INK     = '0D1B26';
const INK_2   = '40566A';
const INK_3   = '74899A';
const WASH    = 'E8F1F7';
const RULE    = 'DAE4EB';
const CARD    = 'F4F8FA';
const GOOD    = '1E6B3C';
const GOOD_BG = 'E7F4EC';
const RISK_BG = 'FDF3DD';

const F = 'Calibri';
const W = 13.3, H = 7.5, M = 0.85;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'CareSignal';
pres.title = 'CareSignal — Pitch a inversionistas';

// ---------- Helpers ----------
let n = 0;

function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: DEEP };
  s.addShape(pres.ShapeType.ellipse, {
    x: W - 6.2, y: -3.1, w: 10.4, h: 7.4,
    fill: { color: DEEP_2 }, line: { type: 'none' },
  });
  return s;
}

function lightSlide(kicker, title) {
  n += 1;
  const s = pres.addSlide();
  s.background = { color: PAPER };
  // Motivo repetido: punto ámbar + eyebrow
  s.addShape(pres.ShapeType.ellipse, {
    x: M, y: 0.63, w: 0.11, h: 0.11,
    fill: { color: AMBER }, line: { type: 'none' },
  });
  s.addText(kicker.toUpperCase(), {
    x: M + 0.23, y: 0.52, w: 7, h: 0.33,
    fontFace: F, fontSize: 11, bold: true, color: INK_3,
    charSpacing: 2.5, margin: 0, valign: 'middle',
  });
  s.addText(title, {
    x: M, y: 0.95, w: 11.2, h: 0.85,
    fontFace: F, fontSize: 34, bold: true, color: INK,
    margin: 0, valign: 'top',
  });
  // Número de lámina
  s.addText(String(n).padStart(2, '0'), {
    x: W - M - 0.6, y: 0.52, w: 0.6, h: 0.33,
    fontFace: F, fontSize: 11, color: INK_3,
    align: 'right', margin: 0, valign: 'middle',
  });
  return s;
}

function foot(s, txt, dark) {
  s.addText(txt, {
    x: M, y: H - 0.72, w: 11.6, h: 0.34,
    fontFace: F, fontSize: 9.5, color: dark ? SOFT_2 : INK_3,
    margin: 0, valign: 'middle',
  });
}

// Tarjeta con número grande
function statCard(s, x, y, w, h, value, label, opts = {}) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: opts.fill || CARD },
    line: { color: opts.border || RULE, width: 0.75 },
  });
  s.addText(value, {
    x: x + 0.22, y: y + 0.16, w: w - 0.44, h: 0.6,
    fontFace: F, fontSize: opts.vSize || 30, bold: true,
    color: opts.vColor || INK, margin: 0, valign: 'top',
  });
  s.addText(label, {
    x: x + 0.22, y: y + 0.78, w: w - 0.44, h: h - 0.92,
    fontFace: F, fontSize: 11.5, color: INK_2,
    margin: 0, valign: 'top', lineSpacing: 15,
  });
}

// Fila icono-circulo + texto
function iconRow(s, x, y, w, num, head, body) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y: y + 0.04, w: 0.42, h: 0.42,
    fill: { color: WASH }, line: { type: 'none' },
  });
  s.addText(num, {
    x, y: y + 0.04, w: 0.42, h: 0.42,
    fontFace: F, fontSize: 13, bold: true, color: DEEP_2,
    align: 'center', valign: 'middle', margin: 0,
  });
  s.addText(head, {
    x: x + 0.62, y, w: w - 0.62, h: 0.32,
    fontFace: F, fontSize: 15.5, bold: true, color: INK,
    margin: 0, valign: 'middle',
  });
  s.addText(body, {
    x: x + 0.62, y: y + 0.33, w: w - 0.62, h: 0.62,
    fontFace: F, fontSize: 12.5, color: INK_2,
    margin: 0, valign: 'top', lineSpacing: 16,
  });
}

// Lámina marcada como pendiente de completar
function todoBand(s, texto) {
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: H - 1.5, w: W - M * 2, h: 0.62, rectRadius: 0.06,
    fill: { color: RISK_BG }, line: { color: 'D9B566', width: 0.75 },
  });
  s.addText(texto, {
    x: M + 0.25, y: H - 1.5, w: W - M * 2 - 0.5, h: 0.62,
    fontFace: F, fontSize: 11.5, bold: true, color: AMBER_D,
    margin: 0, valign: 'middle',
  });
}

// ============================================================
// 1 · APERTURA
// ============================================================
{
  const s = darkSlide();
  s.addShape(pres.ShapeType.ellipse, { x: M, y: 0.74, w: 0.13, h: 0.13, fill: { color: AMBER }, line: { type: 'none' } });
  s.addText('CARESIGNAL', {
    x: M + 0.26, y: 0.62, w: 4, h: 0.38,
    fontFace: F, fontSize: 13, bold: true, color: SOFT, charSpacing: 3, margin: 0, valign: 'middle',
  });
  s.addText([
    { text: 'Su residencia ya está obligada', options: { breakLine: true } },
    { text: 'a documentar el cuidado que da.', options: { breakLine: true } },
  ], {
    x: M, y: 1.9, w: 10.6, h: 1.95,
    fontFace: F, fontSize: 47, bold: true, color: PAPER, lineSpacing: 54, margin: 0, valign: 'top',
  });
  s.addText('Hoy no puede.', {
    x: M, y: 3.82, w: 8, h: 0.95,
    fontFace: F, fontSize: 47, bold: true, color: AMBER, margin: 0, valign: 'top',
  });
  s.addShape(pres.ShapeType.rect, { x: M, y: 5.02, w: 0.045, h: 0.86, fill: { color: AMBER }, line: { type: 'none' } });
  s.addText([
    { text: 'No porque su gente no trabaje. Porque ' },
    { text: 'verificar que alguien está bien no deja rastro', options: { bold: true, color: PAPER } },
    { text: ', y el turno se releva cada ocho horas llevándose la memoria.' },
  ], {
    x: M + 0.28, y: 5.0, w: 9.1, h: 0.9,
    fontFace: F, fontSize: 15.5, color: SOFT, lineSpacing: 23, margin: 0, valign: 'top',
  });
  s.addShape(pres.ShapeType.rect, { x: M, y: 6.35, w: W - M * 2, h: 0.012, fill: { color: LINE }, line: { type: 'none' } });
  s.addText('NOM-031-SSA3-2012 · Expediente administrativo por cada usuario · vigente desde 2012', {
    x: M, y: 6.62, w: 8, h: 0.34,
    fontFace: F, fontSize: 11, color: SOFT_2, margin: 0, valign: 'middle',
  });
  s.addText('No es un dispositivo médico', {
    x: W - M - 4, y: 6.62, w: 4, h: 0.34,
    fontFace: F, fontSize: 9.5, color: SOFT_2, align: 'right', margin: 0, valign: 'middle',
  });
  s.addNotes('Apertura. No leas la lámina. Pregunta: "cuando una familia le reclame que nadie revisó a su mamá el martes, ¿con qué le responde hoy?" Deja la pausa.');
}

// ============================================================
// 2 · EL PROBLEMA
// ============================================================
{
  const s = lightSlide('El problema', 'El cuidado es invisible, y debe probarse');
  s.addText([
    { text: 'Verificar que alguien está bien no deja rastro físico. ' , options: { bold: true, color: INK } },
    { text: 'Si no se captura en el instante, deja de existir.' },
  ], {
    x: M, y: 2.05, w: 7.1, h: 1.0,
    fontFace: F, fontSize: 20, color: INK_2, lineSpacing: 28, margin: 0, valign: 'top',
  });

  iconRow(s, M, 3.35, 7.1, '1', 'Sin evidencia', 'Ante un reclamo, una auditoría o el dueño, no hay registro horario de quién verificó a quién ni con qué resultado.');
  iconRow(s, M, 4.5, 7.1, '2', 'Sin visibilidad', 'Durante el turno nadie sabe qué ronda está pendiente ni quién es responsable de un aviso.');
  iconRow(s, M, 5.65, 7.1, '3', 'Carga administrativa', 'Cada reporte se reconstruye a mano juntando papeles y mensajes.');

  // Columna derecha: la cadena causal
  s.addShape(pres.ShapeType.roundRect, {
    x: 8.35, y: 2.05, w: 4.1, h: 4.2, rectRadius: 0.08,
    fill: { color: CARD }, line: { color: RULE, width: 0.75 },
  });
  s.addText('LA CADENA', {
    x: 8.62, y: 2.28, w: 3.6, h: 0.3,
    fontFace: F, fontSize: 10, bold: true, color: INK_3, charSpacing: 2, margin: 0, valign: 'middle',
  });
  const chain = [
    ['Síntoma', 'No puedo demostrar qué se hizo.'],
    ['Causa', 'El registro depende de que alguien lo anote después.'],
    ['Causa', 'El turno se releva cada 8 horas.'],
    ['Raíz', 'El acto de cuidar no genera evidencia por sí mismo.'],
  ];
  let cy = 2.68;
  chain.forEach(([lv, tx], i) => {
    const isRoot = i === chain.length - 1;
    s.addText(lv.toUpperCase(), {
      x: 8.62, y: cy, w: 3.6, h: 0.24,
      fontFace: F, fontSize: 9, bold: true,
      color: isRoot ? AMBER_D : INK_3, charSpacing: 1.5, margin: 0, valign: 'middle',
    });
    s.addText(tx, {
      x: 8.62, y: cy + 0.24, w: 3.6, h: 0.58,
      fontFace: F, fontSize: 12, bold: isRoot, color: isRoot ? INK : INK_2,
      margin: 0, valign: 'top', lineSpacing: 15,
    });
    cy += 0.88;
  });
  foot(s, 'Fuente: análisis de causa raíz, dossier ejecutivo §2');
  s.addNotes('El punto: atacar los síntomas con más formatos o más supervisión no toca la raíz. La captura sigue dependiendo de la memoria humana.');
}

// ============================================================
// 3 · POR QUÉ AHORA
// ============================================================
{
  const s = lightSlide('Por qué ahora', 'Demanda estructural, no coyuntural');
  statCard(s, M, 2.1, 3.55, 1.75, '17.1 M', 'personas de 60 años o más en México', { vColor: DEEP_2 });
  statCard(s, M + 3.85, 2.1, 3.55, 1.75, '12.8%', 'de la población nacional, hoy');
  statCard(s, M + 7.7, 2.1, 3.55, 1.75, '27.7%', 'proyección hacia 2050', { fill: WASH, border: SOFT_2, vColor: DEEP_2 });

  s.addText('La proporción de población mayor se duplica en 25 años', {
    x: M, y: 4.28, w: 8, h: 0.35,
    fontFace: F, fontSize: 14, bold: true, color: INK, margin: 0, valign: 'middle',
  });

  // Gráfica nativa: una serie, dos puntos
  s.addChart(pres.ChartType.bar, [{
    name: 'Proporción de 60+',
    labels: ['2025', '2050'],
    values: [12.8, 27.7],
  }], {
    x: M, y: 4.7, w: 7.2, h: 1.55,
    barDir: 'bar',
    chartColors: [DEEP_2],
    showValue: true,
    dataLabelPosition: 'outEnd',
    dataLabelFormatCode: '0.0"%"',
    dataLabelColor: INK,
    dataLabelFontSize: 12,
    dataLabelFontFace: F,
    showLegend: false,
    catAxisLabelColor: INK_2,
    catAxisLabelFontSize: 11,
    catAxisLabelFontFace: F,
    valAxisHidden: true,
    valGridLine: { style: 'none' },
    catGridLine: { style: 'none' },
    barGapWidthPct: 60,
    valAxisMaxVal: 34,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.6, y: 4.7, w: 3.85, h: 1.55, rectRadius: 0.06,
    fill: { color: CARD }, line: { color: RULE, width: 0.75 },
  });
  s.addText([
    { text: 'Hacia 2030 se superan los 20 millones. ', options: { bold: true, color: INK } },
    { text: 'El envejecimiento no se revierte: cada año hay más residentes por cuidador disponible.' },
  ], {
    x: 8.85, y: 4.9, w: 3.35, h: 1.2,
    fontFace: F, fontSize: 12, color: INK_2, margin: 0, valign: 'top', lineSpacing: 16,
  });
  foot(s, 'Fuente: CONAPO, 2025 y proyecciones');
  s.addNotes('Este es el viento de cola. No hay que crear la demanda: llega sola y no se revierte.');
}

// ============================================================
// 4 · EL GANCHO REGULATORIO
// ============================================================
{
  const s = lightSlide('El gancho', 'La obligación de documentar ya existe');
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 2.05, w: 7.3, h: 2.5, rectRadius: 0.08,
    fill: { color: WASH }, line: { color: SOFT_2, width: 0.75 },
  });
  s.addText('NOM-031-SSA3-2012', {
    x: M + 0.3, y: 2.28, w: 4, h: 0.35,
    fontFace: 'Consolas', fontSize: 13, bold: true, color: DEEP_2, margin: 0, valign: 'middle',
  });
  s.addText('Vigente desde noviembre de 2012 · confirmada sin cambios en 2021', {
    x: M + 0.3, y: 2.63, w: 6.7, h: 0.3,
    fontFace: F, fontSize: 11, color: INK_3, margin: 0, valign: 'middle',
  });
  s.addText([
    { text: 'Obliga a todo establecimiento a llevar ' },
    { text: 'expediente administrativo por cada usuario', options: { bold: true, color: INK } },
    { text: ', además de manuales, programa de trabajo y registro ante el DIF.' },
  ], {
    x: M + 0.3, y: 3.05, w: 6.7, h: 1.2,
    fontFace: F, fontSize: 14.5, color: INK_2, margin: 0, valign: 'top', lineSpacing: 20,
  });

  statCard(s, 8.55, 2.05, 3.9, 1.15, '2012', 'año de publicación en el DOF', { vSize: 24, vColor: DEEP_2 });
  statCard(s, 8.55, 3.4, 3.9, 1.15, '1997', 'antecedente normativo previo', { vSize: 24 });

  // El matiz honesto
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 4.85, w: W - M * 2, h: 1.45, rectRadius: 0.08,
    fill: { color: RISK_BG }, line: { color: 'D9B566', width: 0.75 },
  });
  s.addText('EL MATIZ QUE NO OCULTAMOS', {
    x: M + 0.3, y: 5.02, w: 6, h: 0.28,
    fontFace: F, fontSize: 10, bold: true, color: AMBER_D, charSpacing: 1.5, margin: 0, valign: 'middle',
  });
  s.addText([
    { text: 'La norma casi no se fiscaliza: la CNDH supervisó 58 de ~1,500 centros durante la pandemia. ', options: { bold: true, color: INK } },
    { text: 'Por eso no vendemos miedo al inspector, sino respaldo ante el reclamo de una familia — que sí ocurre. Y la clausura, aunque rara, existe: un asilo cerrado en San Luis Potosí en mayo de 2025.' },
  ], {
    x: M + 0.3, y: 5.32, w: 11.0, h: 0.85,
    fontFace: F, fontSize: 12, color: INK_2, margin: 0, valign: 'top', lineSpacing: 16,
  });
  foot(s, 'Fuentes: DOF · CNDH, Informe ISP-12/2020 · prensa nacional, 2025');
  s.addNotes('Decir el matiz tú primero convierte una objeción en credibilidad. Si lo ocultas y el inversionista lo descubre, pierdes la sala.');
}

// ============================================================
// 5 · LA SOLUCIÓN
// ============================================================
{
  const s = lightSlide('La solución', 'Convertir cada ronda en evidencia');
  const items = [
    ['Registrar', 'El cuidador cierra una ronda en tres toques desde el móvil.'],
    ['Detectar', 'El vencimiento genera la alerta solo, y la escala según el retraso.'],
    ['Escalar', 'Toda alerta tiene dueño explícito; cada reasignación queda registrada.'],
    ['Verificar', 'No se puede cerrar sin resolver, ni resolver sin resultado.'],
    ['Comprobar', 'Bitácora inalterable con actor, fecha y hora en cada acción.'],
  ];
  // Paso de 0.88: con 5 filas la última termina en 6.52", por debajo del pie (6.78")
  let y = 2.05;
  items.forEach(([h, b], i) => {
    iconRow(s, M, y, 6.6, String(i + 1), h, b);
    y += 0.88;
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.15, y: 2.1, w: 4.3, h: 2.15, rectRadius: 0.08,
    fill: { color: GOOD_BG }, line: { color: '86BB9C', width: 0.75 },
  });
  s.addText('LO QUE SÍ ES', {
    x: 8.42, y: 2.3, w: 3.8, h: 0.28,
    fontFace: F, fontSize: 10, bold: true, color: GOOD, charSpacing: 1.5, margin: 0, valign: 'middle',
  });
  s.addText('Aplicación web y móvil. Sin sensores, sin hardware, sin instalación. El personal la usa en minutos.', {
    x: 8.42, y: 2.62, w: 3.8, h: 1.4,
    fontFace: F, fontSize: 12.5, color: INK_2, margin: 0, valign: 'top', lineSpacing: 17,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.15, y: 4.45, w: 4.3, h: 2.15, rectRadius: 0.08,
    fill: { color: CARD }, line: { color: RULE, width: 0.75 },
  });
  s.addText('LO QUE NO ES', {
    x: 8.42, y: 4.65, w: 3.8, h: 0.28,
    fontFace: F, fontSize: 10, bold: true, color: INK_3, charSpacing: 1.5, margin: 0, valign: 'middle',
  });
  s.addText('No es dispositivo médico. No mide signos vitales, no detecta caídas, no diagnostica y no sustituye al personal.', {
    x: 8.42, y: 4.97, w: 3.8, h: 1.4,
    fontFace: F, fontSize: 12.5, color: INK_2, margin: 0, valign: 'top', lineSpacing: 17,
  });
  foot(s, 'Las restricciones están escritas en el producto, no solo en el discurso comercial');
  s.addNotes('La columna "lo que no es" gana credibilidad con clientes escaldados por proveedores que prometen de más.');
}

// ============================================================
// 6 · TRACCIÓN DE PRODUCTO
// ============================================================
{
  const s = lightSlide('Tracción', 'El producto está construido y auditado');
  statCard(s, M, 2.1, 2.7, 1.7, '20/20', 'pruebas de aceptación aprobadas', { fill: GOOD_BG, border: '86BB9C', vColor: GOOD });
  statCard(s, M + 2.95, 2.1, 2.7, 1.7, '38/38', 'pruebas automatizadas en verde', { fill: GOOD_BG, border: '86BB9C', vColor: GOOD });
  statCard(s, M + 5.9, 2.1, 2.7, 1.7, '0', 'hallazgos críticos', { fill: GOOD_BG, border: '86BB9C', vColor: GOOD });
  statCard(s, M + 8.85, 2.1, 2.7, 1.7, '8/8', 'fases con aprobación formal', { vColor: DEEP_2 });

  s.addText('Alcance funcional entregado', {
    x: M, y: 4.15, w: 6, h: 0.35,
    fontFace: F, fontSize: 15, bold: true, color: INK, margin: 0, valign: 'middle',
  });
  const ent = [
    'Rondas con seis estados operativos y detección automática de vencimientos',
    'Ciclo completo de alerta: reconocer, asignar, escalar, verificar, resolver, cerrar',
    'Panel del supervisor con diez indicadores operativos',
    'Bitácora auditable append-only con actor, fecha y hora',
  ];
  s.addText(ent.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < ent.length - 1 } })), {
    x: M, y: 4.55, w: 7.2, h: 1.6,
    fontFace: F, fontSize: 12.5, color: INK_2, paraSpaceAfter: 6, margin: 0, valign: 'top',
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.55, y: 4.15, w: 3.9, h: 2.0, rectRadius: 0.08,
    fill: { color: RISK_BG }, line: { color: 'D9B566', width: 0.75 },
  });
  s.addText('TRACCIÓN DE MERCADO', {
    x: 8.8, y: 4.35, w: 3.4, h: 0.28,
    fontFace: F, fontSize: 10, bold: true, color: AMBER_D, charSpacing: 1.5, margin: 0, valign: 'middle',
  });
  s.addText('Aún no hay clientes ni pilotos en operación. Lo que existe es producto verificado, listo para el primer piloto.', {
    x: 8.8, y: 4.67, w: 3.4, h: 1.3,
    fontFace: F, fontSize: 12, color: INK_2, margin: 0, valign: 'top', lineSpacing: 16,
  });
  foot(s, 'Fuente: auditoría de calidad, dossier ejecutivo §8');
  s.addNotes('Distingue tracción de PRODUCTO de tracción de MERCADO. Un fondo pregunta por la segunda. Decirlo tú evita que suene a que lo escondías.');
}

// ============================================================
// 7 · MERCADO
// ============================================================
{
  const s = lightSlide('Mercado', 'Un sector que se está formalizando');
  statCard(s, M, 2.1, 2.7, 1.7, '1,297', 'residencias registradas', { vColor: DEEP_2 });
  statCard(s, M + 2.95, 2.1, 2.7, 1.7, '+18%', 'crecimiento de registros en un año');
  statCard(s, M + 5.9, 2.1, 2.7, 1.7, '85%', 'del sector es privado');
  statCard(s, M + 8.85, 2.1, 2.7, 1.7, '64%', 'concentrado en 9 estados');

  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 4.15, w: 7.2, h: 2.0, rectRadius: 0.08,
    fill: { color: RISK_BG }, line: { color: 'D9B566', width: 0.75 },
  });
  s.addText('EL DATO INCÓMODO, DICHO DE FRENTE', {
    x: M + 0.28, y: 4.35, w: 6.6, h: 0.28,
    fontFace: F, fontSize: 10, bold: true, color: AMBER_D, charSpacing: 1.5, margin: 0, valign: 'middle',
  });
  s.addText([
    { text: '~1,300 clientes formales en todo México. ', options: { bold: true, color: INK, fontSize: 15 } },
    { text: 'No es un mercado de volumen: obliga a ticket alto por cliente o a expansión geográfica. A cambio, la concentración en nueve estados hace viable una estrategia comercial presencial y enfocada.' },
  ], {
    x: M + 0.28, y: 4.68, w: 6.6, h: 1.3,
    fontFace: F, fontSize: 12.5, color: INK_2, margin: 0, valign: 'top', lineSpacing: 17,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.35, y: 4.15, w: 4.1, h: 2.0, rectRadius: 0.08,
    fill: { color: CARD }, line: { color: RULE, width: 0.75 },
  });
  s.addText('DÓNDE EMPEZAR', {
    x: 8.6, y: 4.35, w: 3.6, h: 0.28,
    fontFace: F, fontSize: 10, bold: true, color: INK_3, charSpacing: 1.5, margin: 0, valign: 'middle',
  });
  s.addText([
    { text: 'Jalisco 152 · CDMX 109 · Nuevo León 105', options: { bold: true, color: INK, breakLine: true } },
    { text: 'Cerca de 370 establecimientos en tres entidades: un equipo comercial pequeño los cubre.' },
  ], {
    x: 8.6, y: 4.68, w: 3.6, h: 1.3,
    fontFace: F, fontSize: 12.5, color: INK_2, margin: 0, valign: 'top', lineSpacing: 17,
  });
  foot(s, 'Fuente: DENUE 2024–2025 · el INEGI reporta ~1,500 centros con otra metodología; hay informalidad no cuantificada');
  s.addNotes('Si te preguntan por el tamaño: "entre 1,300 y 1,500 según la fuente, más informalidad no cuantificada". Nunca des una cifra que no puedas defender.');
}

// ============================================================
// 8 · EXPANSIÓN B2C
// ============================================================
{
  const s = lightSlide('Expansión', 'El mismo motor, mil veces el universo');
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 2.1, w: 5.7, h: 2.3, rectRadius: 0.08,
    fill: { color: CARD }, line: { color: RULE, width: 0.75 },
  });
  s.addText('B2B · RESIDENCIAS', {
    x: M + 0.28, y: 2.3, w: 5.1, h: 0.28,
    fontFace: F, fontSize: 10, bold: true, color: INK_3, charSpacing: 1.5, margin: 0, valign: 'middle',
  });
  s.addText('~1,300', {
    x: M + 0.28, y: 2.62, w: 5.1, h: 0.62,
    fontFace: F, fontSize: 34, bold: true, color: INK, margin: 0, valign: 'top',
  });
  s.addText('establecimientos formales. Producto construido y verificado.', {
    x: M + 0.28, y: 3.3, w: 5.1, h: 0.9,
    fontFace: F, fontSize: 12.5, color: INK_2, margin: 0, valign: 'top', lineSpacing: 16,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 6.9, y: 2.1, w: 5.55, h: 2.3, rectRadius: 0.08,
    fill: { color: WASH }, line: { color: SOFT_2, width: 0.75 },
  });
  s.addText('B2C · FAMILIAS', {
    x: 7.18, y: 2.3, w: 5.0, h: 0.28,
    fontFace: F, fontSize: 10, bold: true, color: DEEP_2, charSpacing: 1.5, margin: 0, valign: 'middle',
  });
  s.addText('~2 M', {
    x: 7.18, y: 2.62, w: 5.0, h: 0.62,
    fontFace: F, fontSize: 34, bold: true, color: DEEP_2, margin: 0, valign: 'top',
  });
  s.addText('familias mexicanas con cuidado activo de adulto mayor. Freemium $199–$399 MXN/mes. Autoservicio — sin ciclo de venta.', {
    x: 7.18, y: 3.3, w: 5.0, h: 0.9,
    fontFace: F, fontSize: 12.5, color: INK_2, margin: 0, valign: 'top', lineSpacing: 16,
  });

  s.addText('🔄  El flywheel B2C → B2B', {
    x: M, y: 4.62, w: 8, h: 0.35,
    fontFace: F, fontSize: 15, bold: true, color: INK, margin: 0, valign: 'middle',
  });
  s.addText('Familia adopta CareSignal en casa → familiar ingresa a una residencia → familia recomienda la plataforma al director → residencia contrata (B2B). Cada usuario B2C se convierte en un vendedor involuntario del canal institucional.', {
    x: M, y: 5.0, w: 7.2, h: 1.2,
    fontFace: F, fontSize: 12.5, color: INK_2, margin: 0, valign: 'top', lineSpacing: 17,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.35, y: 4.9, w: 4.1, h: 1.3, rectRadius: 0.08,
    fill: { color: WASH }, line: { color: SOFT_2, width: 0.75 },
  });
  s.addText([
    { text: 'Fase paralela en curso. ', options: { bold: true, color: DEEP_2 } },
    { text: 'Freemium operativo. Notificaciones externas reservadas para v0.2.' },
  ], {
    x: 8.6, y: 5.08, w: 3.6, h: 0.95,
    fontFace: F, fontSize: 12, color: INK_2, margin: 0, valign: 'top', lineSpacing: 16,
  });
  foot(s, 'Fuentes: CONAPO 2025 · INEGI · ENASIC 2022');
  s.addNotes('B2C ya está en el modelo con freemium $0. La conversión a pago ($199–$399/mes) no requiere notificaciones externas — solo el flujo de rondas que ya existe en v0.1.0.');
}

// ============================================================
// 9 · MODELO DE NEGOCIO (parcial)
// ============================================================
{
  const s = lightSlide('Modelo de negocio', 'Freemium + SaaS B2B · por residencia / mes · margen bruto > 80%');
  const planes = [
    { nom: 'Demo Operacional', precio: '$0',     sub: 'sin tarjeta · sin límite',   det: 'Hasta 8 residentes\n1 usuario activo\nRondas básicas',              destacado: false, verde: true },
    { nom: 'Esencial',         precio: '$1,990', sub: 'MXN / mes',                  det: 'Hasta 30 residentes\n3 usuarios · alertas\nAuditoría completa',     destacado: false, verde: false },
    { nom: 'Profesional ⭐',   precio: '$3,990', sub: 'MXN / mes · sweet spot',     det: 'Hasta 80 residentes\n10 usuarios · dashboard\nSoporte prioritario', destacado: true,  verde: false },
    { nom: 'Institucional',    precio: '$8,490', sub: 'MXN / mes',                  det: 'Sin límite · multi-sede\nSLA + soporte dedicado\nOnboarding incluido',destacado: false, verde: false },
  ];
  planes.forEach((p, i) => {
    const x = M + i * 2.98;
    const fillColor = p.verde ? 'F0FAF4' : (p.destacado ? WASH : CARD);
    const lineColor = p.verde ? '86c9a0' : (p.destacado ? SOFT_2 : RULE);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 2.1, w: 2.72, h: 2.6, rectRadius: 0.08,
      fill: { color: fillColor },
      line: { color: lineColor, width: p.destacado ? 1.25 : 0.75 },
    });
    s.addText(p.nom, {
      x: x + 0.18, y: 2.3, w: 2.36, h: 0.38,
      fontFace: F, fontSize: 13, bold: true, color: p.verde ? '1a6b3c' : (p.destacado ? DEEP_2 : INK), margin: 0, valign: 'middle',
    });
    s.addText(p.precio, {
      x: x + 0.18, y: 2.7, w: 2.36, h: 0.48,
      fontFace: F, fontSize: 24, bold: true, color: p.verde ? '1a6b3c' : (p.destacado ? DEEP_2 : AMBER_D), margin: 0, valign: 'middle',
    });
    s.addText(p.sub, {
      x: x + 0.18, y: 3.18, w: 2.36, h: 0.28,
      fontFace: F, fontSize: 10, color: INK_3, margin: 0, valign: 'middle',
    });
    s.addText(p.det.split('\n').map((t, j, a) => ({ text: t, options: { bullet: true, breakLine: j < a.length - 1 } })), {
      x: x + 0.18, y: 3.5, w: 2.36, h: 1.05,
      fontFace: F, fontSize: 10.5, color: INK_2, paraSpaceAfter: 3, margin: 0, valign: 'top',
    });
  });
  s.addText('Freemium $0 elimina fricción de entrada y reduce CAC · Breakeven con 21 clientes Profesional · Flywheel B2C → leads B2B', {
    x: M, y: 4.88, w: 11.6, h: 0.35,
    fontFace: F, fontSize: 11.5, color: INK_2, margin: 0, valign: 'middle',
  });
  s.addNotes('Precios validados contra mercado: Profesional $3,990 MXN (~$235 USD) es 6× más barato que CipherRounds. Breakeven: 21 clientes con mix estándar cubren equipo de 2 personas.');
}

// ============================================================
// 10 · RIESGOS
// ============================================================
{
  const s = lightSlide('Riesgos', 'Lo que todavía no resolvemos');
  const riesgos = [
    ['La alerta no sale de la pantalla', 'Sin SMS, WhatsApp ni push. Si nadie tiene la app abierta, el aviso espera. Es el primer desarrollo de la siguiente versión.'],
    ['Sin servidor central', 'Los datos viven en el navegador: no hay sincronización entre dispositivos ni entre sedes.'],
    ['La captura es declarativa', 'No hay QR ni NFC en la puerta: se registra lo que el cuidador declara, no su presencia verificada.'],
    ['Mercado formal estrecho', 'Cerca de 1,300 clientes potenciales obliga a ticket alto o a salir de México antes de lo previsto.'],
  ];
  let y = 2.1;
  riesgos.forEach(([h, b], i) => {
    const x = i % 2 === 0 ? M : M + 5.95;
    if (i === 2) y = 4.2;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 5.65, h: 1.85, rectRadius: 0.08,
      fill: { color: CARD }, line: { color: RULE, width: 0.75 },
    });
    s.addText(h, {
      x: x + 0.28, y: y + 0.22, w: 5.1, h: 0.35,
      fontFace: F, fontSize: 15, bold: true, color: INK, margin: 0, valign: 'middle',
    });
    s.addText(b, {
      x: x + 0.28, y: y + 0.6, w: 5.1, h: 1.05,
      fontFace: F, fontSize: 12.5, color: INK_2, margin: 0, valign: 'top', lineSpacing: 16,
    });
  });
  foot(s, 'Declarar los límites por adelantado es parte de la propuesta: el cliente objetivo ya fue decepcionado por proveedores que prometieron de más');
  s.addNotes('Nunca dejes que el inversionista descubra estos cuatro puntos solo. Dichos por ti, son criterio; descubiertos por él, son omisión.');
}

// ============================================================
// 11 · EQUIPO (pendiente)
// ============================================================
{
  const s = lightSlide('Equipo', 'Quién ejecuta');
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 2.1, w: W - M * 2, h: 2.9, rectRadius: 0.08,
    fill: { color: CARD }, line: { color: RULE, width: 0.75 },
  });
  s.addText('Esta lámina no puede escribirse desde el análisis', {
    x: M + 0.4, y: 2.5, w: 10.5, h: 0.45,
    fontFace: F, fontSize: 19, bold: true, color: INK, margin: 0, valign: 'middle',
  });
  const faltan = [
    'Fundador y responsables: nombre, rol y por qué esta persona resuelve este problema',
    'Experiencia previa relevante en salud, cuidado, operaciones o software',
    'Quién construyó el producto y quién lo va a vender',
    'Asesores, aliados o instituciones que respaldan el proyecto',
  ];
  s.addText(faltan.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < faltan.length - 1 } })), {
    x: M + 0.4, y: 3.1, w: 10.5, h: 1.6,
    fontFace: F, fontSize: 13, color: INK_2, paraSpaceAfter: 8, margin: 0, valign: 'top',
  });
  todoBand(s, 'PENDIENTE — El equipo suele ser lo segundo que mira un fondo, después del problema. Sin esta lámina el deck queda incompleto.');
  s.addNotes('No inventé nombres ni trayectorias. Complétala tú.');
}

// ============================================================
// 12 · EL ASK (pendiente)
// ============================================================
{
  const s = lightSlide('La petición', 'Qué pedimos y para qué');
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 2.1, w: 5.65, h: 2.9, rectRadius: 0.08,
    fill: { color: WASH }, line: { color: SOFT_2, width: 0.75 },
  });
  s.addText('LO QUE SÍ ESTÁ DEFINIDO', {
    x: M + 0.28, y: 2.32, w: 5.1, h: 0.28,
    fontFace: F, fontSize: 10, bold: true, color: DEEP_2, charSpacing: 1.5, margin: 0, valign: 'middle',
  });
  const definido = [
    'Piloto de 30 días con métricas acordadas de antemano',
    'Tres entidades objetivo: Jalisco, CDMX y Nuevo León',
    'Siguiente desarrollo: notificaciones externas',
    'Validación B2C por entrevistas, no por código',
  ];
  s.addText(definido.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < definido.length - 1 } })), {
    x: M + 0.28, y: 2.68, w: 5.1, h: 2.1,
    fontFace: F, fontSize: 12.5, color: INK_2, paraSpaceAfter: 7, margin: 0, valign: 'top',
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 6.9, y: 2.1, w: 5.55, h: 2.9, rectRadius: 0.08,
    fill: { color: CARD }, line: { color: RULE, width: 0.75 },
  });
  s.addText('LO QUE FALTA DEFINIR', {
    x: 7.18, y: 2.32, w: 5.0, h: 0.28,
    fontFace: F, fontSize: 10, bold: true, color: AMBER_D, charSpacing: 1.5, margin: 0, valign: 'middle',
  });
  const pendiente = [
    'Monto que se levanta y a cambio de qué',
    'Horizonte que financia esa cantidad',
    'Reparto del uso de fondos: producto, comercial, operación',
    'Hitos que se comprometen con ese dinero',
  ];
  s.addText(pendiente.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < pendiente.length - 1 } })), {
    x: 7.18, y: 2.68, w: 5.0, h: 2.1,
    fontFace: F, fontSize: 12.5, color: INK_2, paraSpaceAfter: 7, margin: 0, valign: 'top',
  });
  todoBand(s, 'PENDIENTE — Sin monto, destino y horizonte no hay petición; hay una conversación informativa. Es la lámina que justifica la reunión.');
  s.addNotes('Define el ask antes de agendar con un fondo. Sin número concreto, la reunión no tiene cierre posible.');
}

// ============================================================
// 13 · CIERRE
// ============================================================
{
  const s = darkSlide();
  s.addShape(pres.ShapeType.ellipse, { x: M, y: 0.74, w: 0.13, h: 0.13, fill: { color: AMBER }, line: { type: 'none' } });
  s.addText('CARESIGNAL', {
    x: M + 0.26, y: 0.62, w: 4, h: 0.38,
    fontFace: F, fontSize: 13, bold: true, color: SOFT, charSpacing: 3, margin: 0, valign: 'middle',
  });
  s.addText([
    { text: 'Producto construido.', options: { breakLine: true, color: PAPER } },
    { text: 'Obligación normativa vigente.', options: { breakLine: true, color: PAPER } },
    { text: 'Falta el primer piloto.', options: { color: AMBER } },
  ], {
    x: M, y: 2.2, w: 10.5, h: 2.6,
    fontFace: F, fontSize: 40, bold: true, lineSpacing: 52, margin: 0, valign: 'top',
  });
  s.addShape(pres.ShapeType.rect, { x: M, y: 5.15, w: 0.045, h: 0.8, fill: { color: AMBER }, line: { type: 'none' } });
  s.addText('Treinta días, tres métricas acordadas de antemano. Si no se mueven, no hay venta.', {
    x: M + 0.28, y: 5.13, w: 9.0, h: 0.85,
    fontFace: F, fontSize: 15.5, color: SOFT, margin: 0, valign: 'top', lineSpacing: 22,
  });
  s.addShape(pres.ShapeType.rect, { x: M, y: 6.35, w: W - M * 2, h: 0.012, fill: { color: LINE }, line: { type: 'none' } });
  s.addText('Roberto García  ·  robertogarciaits@gmail.com  ·  linkedin.com/in/robertogarciaits  ·  844 588 1313', {
    x: M, y: 6.62, w: 7, h: 0.34,
    fontFace: F, fontSize: 11.5, color: SOFT_2, margin: 0, valign: 'middle',
  });
  s.addText('CareSignal apoya la operación del cuidado. No es un dispositivo médico.', {
    x: W - M - 5.5, y: 6.62, w: 5.5, h: 0.34,
    fontFace: F, fontSize: 9.5, color: SOFT_2, align: 'right', margin: 0, valign: 'middle',
  });
  s.addNotes('Cierra con la petición concreta que hayas definido en la lámina 12.');
}

const path = require('path');
const fs = require('fs');
const OUT_DIR = path.join(__dirname, '..', 'business');
fs.mkdirSync(OUT_DIR, { recursive: true });
pres.writeFile({ fileName: path.join(OUT_DIR, 'CareSignal_Pitch_Inversionistas.pptx') })
  .then((f) => console.log('OK — ' + path.relative(process.cwd(), f)));
