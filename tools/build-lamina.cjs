/**
 * build-lamina.js — Lámina de apertura CareSignal (.pptx nativo, 16:9)
 * Editable en PowerPoint; no es una imagen incrustada.
 */
const pptxgen = require('pptxgenjs');

// Paleta: azul profundo institucional + ámbar de señal.
const DEEP     = '072D45';
const DEEP_2   = '0A3D5C';
const PAPER    = 'FFFFFF';
const SOFT     = 'B8D4E4';
const SOFT_2   = '7FADC7';
const LINE     = '17506F';
const AMBER    = 'E8B84B';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';            // 13.3" × 7.5"
pres.author = 'CareSignal';
pres.title  = 'CareSignal — Lámina de apertura';

const W = 13.3;
const H = 7.5;
const M = 0.85;                          // margen lateral

const slide = pres.addSlide();
slide.background = { color: DEEP };

// Halo suave arriba a la derecha (profundidad sin degradado, que pptxgenjs no soporta)
slide.addShape(pres.ShapeType.ellipse, {
  x: W - 6.2, y: -3.1, w: 10.4, h: 7.4,
  fill: { color: DEEP_2 },
  line: { type: 'none' },
});

// ---------- Marca ----------
slide.addShape(pres.ShapeType.ellipse, {
  x: M, y: 0.74, w: 0.13, h: 0.13,
  fill: { color: AMBER },
  line: { type: 'none' },
});
slide.addText('CARESIGNAL', {
  x: M + 0.26, y: 0.62, w: 4, h: 0.38,
  fontFace: 'Calibri', fontSize: 13, bold: true, color: SOFT,
  charSpacing: 3, margin: 0, valign: 'middle',
});

// ---------- Afirmación principal ----------
slide.addText(
  [
    { text: 'Su residencia ya está obligada', options: { breakLine: true } },
    { text: 'a documentar el cuidado que da.', options: { breakLine: true } },
  ],
  {
    x: M, y: 1.9, w: 10.6, h: 1.95,
    fontFace: 'Calibri', fontSize: 47, bold: true, color: PAPER,
    lineSpacing: 54, margin: 0, valign: 'top',
  }
);

slide.addText('Hoy no puede.', {
  x: M, y: 3.82, w: 8, h: 0.95,
  fontFace: 'Calibri', fontSize: 47, bold: true, color: AMBER,
  margin: 0, valign: 'top',
});

// ---------- Explicación ----------
slide.addShape(pres.ShapeType.rect, {
  x: M, y: 5.02, w: 0.045, h: 0.86,
  fill: { color: AMBER },
  line: { type: 'none' },
});
slide.addText(
  [
    { text: 'No porque su gente no trabaje. Porque ' },
    { text: 'verificar que alguien está bien no deja rastro', options: { bold: true, color: PAPER } },
    { text: ', y el turno se releva cada ocho horas llevándose la memoria.' },
  ],
  {
    x: M + 0.28, y: 5.0, w: 9.1, h: 0.9,
    fontFace: 'Calibri', fontSize: 15.5, color: SOFT,
    lineSpacing: 23, margin: 0, valign: 'top',
  }
);

// ---------- Separador del pie ----------
slide.addShape(pres.ShapeType.rect, {
  x: M, y: 6.35, w: W - M * 2, h: 0.012,
  fill: { color: LINE },
  line: { type: 'none' },
});

// ---------- Pie: norma ----------
slide.addShape(pres.ShapeType.roundRect, {
  x: M, y: 6.62, w: 1.92, h: 0.34,
  rectRadius: 0.05,
  fill: { color: DEEP },
  line: { color: '7A6234', width: 0.75 },
});
slide.addText('NOM-031-SSA3-2012', {
  x: M, y: 6.62, w: 1.92, h: 0.34,
  fontFace: 'Consolas', fontSize: 10, bold: true, color: AMBER,
  align: 'center', valign: 'middle', margin: 0,
});
slide.addText('Expediente administrativo por cada usuario · vigente desde 2012', {
  x: M + 2.08, y: 6.62, w: 5.6, h: 0.34,
  fontFace: 'Calibri', fontSize: 11, color: SOFT_2,
  margin: 0, valign: 'middle',
});

// ---------- Pie: aviso ----------
slide.addText(
  [
    { text: 'CareSignal apoya la operación del cuidado.', options: { breakLine: true } },
    { text: 'No es un dispositivo médico.' },
  ],
  {
    x: W - M - 4.2, y: 6.56, w: 4.2, h: 0.46,
    fontFace: 'Calibri', fontSize: 9.5, color: SOFT_2,
    align: 'right', lineSpacing: 13, margin: 0, valign: 'middle',
  }
);

// ---------- Notas del orador ----------
slide.addNotes(
  'Apertura. Deja la lámina en pantalla y no la leas en voz alta.\n\n' +
  'Guion sugerido: "Antes de mostrarle nada, quiero plantearle algo. Desde 2012 la NOM-031 le exige expediente administrativo por cada residente. Mi pregunta no es si lo sabe. Es: cuando una familia le reclame que nadie revisó a su mamá el martes, ¿con qué le responde hoy?"\n\n' +
  'Deja la pausa. Que conteste él o ella.\n\n' +
  'No apoyes la venta en el miedo al inspector: la fiscalización es escasa (la CNDH supervisó 58 de ~1,500 centros durante la pandemia) y una dirección con años de operación lo sabe. La norma legitima; el reclamo de la familia es el que duele.'
);

const path = require('path');
const fs = require('fs');
const OUT_DIR = path.join(__dirname, '..', 'business');
fs.mkdirSync(OUT_DIR, { recursive: true });
pres.writeFile({ fileName: path.join(OUT_DIR, 'CareSignal_Lamina_Apertura.pptx') })
  .then((f) => console.log('OK — ' + path.relative(process.cwd(), f)));
