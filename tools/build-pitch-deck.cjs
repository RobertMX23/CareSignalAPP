'use strict';
const PptxGenJS = require('pptxgenjs');
const path = require('path');

// ── PALETA GLOBAL ─────────────────────────────────────────────────────────────
const C = {
  fondo:       '0A0A0A',
  azul:        '2563EB',
  azulClaro:   '3B82F6',
  rojo:        'DC2626',
  blanco:      'F8FAFC',
  gris:        '94A3B8',
  grisOscuro:  '1E293B',
  grisMedio:   '334155',
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function base(prs) {
  const slide = prs.addSlide();
  // fondo negro
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: C.fondo },
    line: { color: C.fondo },
  });
  return slide;
}

function linea(slide, x, y, w) {
  slide.addShape('line', {
    x, y, w, h: 0,
    line: { color: C.azul, width: 1.5 },
  });
}

function badge(slide, texto, x, y) {
  slide.addText(texto, {
    x, y, w: 3.2, h: 0.32,
    fontSize: 9,
    bold: true,
    color: C.blanco,
    align: 'center',
    fill: { color: C.azul },
    shape: prs => prs.ShapeType.roundRect,
  });
}

// ── SLIDE 1 — PORTADA ─────────────────────────────────────────────────────────
function slidePortada(prs) {
  const s = base(prs);

  // Barra lateral izquierda azul
  s.addShape(prs.ShapeType.rect, {
    x: 0, y: 0, w: 0.12, h: '100%',
    fill: { color: C.azul },
    line: { color: C.azul },
  });

  // Nombre del producto
  s.addText('CareSignal', {
    x: 0.4, y: 1.1, w: 9, h: 1.0,
    fontSize: 54,
    bold: true,
    color: C.blanco,
    fontFace: 'Arial',
  });

  // Tagline
  s.addText('Trazabilidad operativa para residencias de adultos mayores', {
    x: 0.4, y: 2.1, w: 8.5, h: 0.5,
    fontSize: 20,
    color: C.azulClaro,
    fontFace: 'Arial',
  });

  // Línea separadora
  linea(s, 0.4, 2.75, 8.8);

  // Subtítulo / contexto
  s.addText('Pitch · 4 minutos · WomenCISO 4 / MenCISO 1', {
    x: 0.4, y: 2.95, w: 7, h: 0.35,
    fontSize: 13,
    color: C.gris,
    fontFace: 'Arial',
  });

  // Fecha
  s.addText('Agosto 2026', {
    x: 0.4, y: 3.4, w: 4, h: 0.3,
    fontSize: 12,
    color: C.gris,
    fontFace: 'Arial',
  });

  // Disclaimers (esquina inferior derecha)
  s.addText('MVP operacional · No dispositivo médico · Datos ficticios', {
    x: 2.5, y: 6.85, w: 7.1, h: 0.28,
    fontSize: 9,
    color: C.gris,
    align: 'right',
    fontFace: 'Arial',
  });

  // Versión
  s.addText('v0.1.0-workshop', {
    x: 0.4, y: 6.85, w: 3, h: 0.28,
    fontSize: 9,
    color: C.gris,
    fontFace: 'Arial',
  });
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const prs = new PptxGenJS();
  prs.layout = 'LAYOUT_WIDE'; // 16:9

  // Fuente y tema por defecto
  prs.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial' };

  // Slides
  slidePortada(prs);

  const out = path.join(__dirname, '..', 'business', 'CareSignal_Pitch_Deck.pptx');
  await prs.writeFile({ fileName: out });
  console.log('✅ Deck generado:', out);
}

main().catch(e => { console.error('❌', e); process.exit(1); });
