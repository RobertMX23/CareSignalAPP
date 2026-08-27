'use strict';
const PptxGenJS = require('pptxgenjs');
const path = require('path');

// ── PALETA PASTEL ─────────────────────────────────────────────────────────────
const C = {
  fondo:        'FAFAF8',  // blanco cálido
  tarjeta:      'F0EDE8',  // crema suave
  azul:         '5B8DB8',  // azul pizarra
  azulClaro:    'A8C4DC',  // azul muy claro
  azulOscuro:   '3A6B96',  // azul oscuro
  verde:        '7BA68A',  // verde salvia
  terracota:    'C4786A',  // alerta / énfasis
  grafito:      '2D3748',  // texto principal
  gris:         '718096',  // texto secundario
  grisSep:      'E2E8F0',  // separadores
  blanco:       'FFFFFF',
};

// ── TIPOGRAFÍA ────────────────────────────────────────────────────────────────
const T = {
  portadaTitulo:   { size: 48, bold: true,  color: C.grafito,  fontFace: 'Arial' },
  portadaTagline:  { size: 18, bold: false, color: C.azul,     fontFace: 'Arial' },
  slideTitulo:     { size: 28, bold: true,  color: C.grafito,  fontFace: 'Arial' },
  slideSubtitulo:  { size: 16, bold: true,  color: C.azul,     fontFace: 'Arial' },
  cuerpo:          { size: 14, bold: false, color: C.grafito,  fontFace: 'Arial' },
  datoGrande:      { size: 40, bold: true,  color: C.azul,     fontFace: 'Arial' },
  datoEnfasis:     { size: 40, bold: true,  color: C.terracota,fontFace: 'Arial' },
  etiqueta:        { size: 10, bold: false, color: C.gris,     fontFace: 'Arial' },
  nota:            { size:  9, bold: false, color: C.gris,     fontFace: 'Arial' },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function base(prs) {
  const s = prs.addSlide();
  s.addShape(prs.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: C.fondo },
    line: { color: C.fondo },
  });
  return s;
}

// Elementos decorativos de fondo — sistema de diseño ejecutivo
function decoFondo(s, prs, variante = 'A') {
  if (variante === 'A') {
    // Círculo grande difuminado — esquina inferior derecha
    s.addShape(prs.ShapeType.ellipse, {
      x: 7.2, y: 4.8, w: 4.2, h: 4.2,
      fill: { color: C.azulClaro, transparency: 82 },
      line: { color: C.azulClaro, transparency: 82 },
    });
    // Círculo mediano — esquina superior izquierda
    s.addShape(prs.ShapeType.ellipse, {
      x: -1.1, y: -1.2, w: 3.2, h: 3.2,
      fill: { color: C.terracota, transparency: 88 },
      line: { color: C.terracota, transparency: 88 },
    });
    // Rectángulo accent — borde derecho
    s.addShape(prs.ShapeType.rect, {
      x: 9.6, y: 1.8, w: 0.06, h: 2.4,
      fill: { color: C.azul, transparency: 55 },
      line: { color: C.azul, transparency: 55 },
    });
  }
  if (variante === 'B') {
    // Círculo grande — esquina superior derecha
    s.addShape(prs.ShapeType.ellipse, {
      x: 7.8, y: -1.5, w: 3.8, h: 3.8,
      fill: { color: C.verde, transparency: 84 },
      line: { color: C.verde, transparency: 84 },
    });
    // Círculo pequeño — inferior izquierda
    s.addShape(prs.ShapeType.ellipse, {
      x: -0.4, y: 5.8, w: 2.2, h: 2.2,
      fill: { color: C.azulClaro, transparency: 80 },
      line: { color: C.azulClaro, transparency: 80 },
    });
    // Línea diagonal decorativa
    s.addShape('line', {
      x: 0.3, y: 6.5, w: 2.5, h: 0,
      line: { color: C.grisSep, width: 1 },
      rotate: -18,
    });
  }
  if (variante === 'C') {
    // Banda lateral derecha tenue
    s.addShape(prs.ShapeType.rect, {
      x: 8.9, y: 0, w: 0.76, h: '100%',
      fill: { color: C.azulClaro, transparency: 88 },
      line: { color: C.azulClaro, transparency: 88 },
    });
    // Círculo inferior centro
    s.addShape(prs.ShapeType.ellipse, {
      x: 3.8, y: 5.6, w: 2.6, h: 2.6,
      fill: { color: C.terracota, transparency: 90 },
      line: { color: C.terracota, transparency: 90 },
    });
  }
  // Barra superior fina — todas las variantes
  s.addShape(prs.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: C.azul },
    line: { color: C.azul },
  });
  // Barra inferior fina — todas las variantes
  s.addShape(prs.ShapeType.rect, {
    x: 0, y: 7.14, w: '100%', h: 0.06,
    fill: { color: C.terracota },
    line: { color: C.terracota },
  });
}

function titulo(s, texto, y = 0.35) {
  s.addText(texto, {
    x: 0.5, y, w: 9.16, h: 0.6,
    ...T.slideTitulo,
  });
}

function subtitulo(s, texto, y = 1.0) {
  s.addText(texto, {
    x: 0.5, y, w: 9.16, h: 0.4,
    ...T.slideSubtitulo,
  });
}

function lineaSep(s, y = 0.95) {
  s.addShape('line', {
    x: 0.5, y, w: 9.16, h: 0,
    line: { color: C.grisSep, width: 1 },
  });
}

function accentBar(s) {
  s.addShape(s.prs ? s.prs.ShapeType.rect : 'rect', {
    x: 0, y: 0, w: 0.08, h: '100%',
    fill: { color: C.azul },
    line: { color: C.azul },
  });
}

function notaPie(s, texto) {
  s.addText(texto, {
    x: 0.5, y: 6.9, w: 9.16, h: 0.25,
    ...T.nota,
    align: 'right',
  });
}

function tarjeta(s, x, y, w, h, color = C.tarjeta) {
  s.addShape('roundRect', {
    x, y, w, h,
    fill: { color },
    line: { color: C.grisSep, width: 0.5 },
    rectRadius: 0.08,
  });
}

function icono(s, emoji, x, y, size = 28) {
  s.addText(emoji, {
    x, y, w: 0.7, h: 0.7,
    fontSize: size,
    align: 'center',
  });
}

// ── SLIDE 1 — PORTADA ─────────────────────────────────────────────────────────
function slidePortada(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'A');

  // Ícono escudo (trazabilidad + seguridad)
  s.addText('🛡️', {
    x: 0.5, y: 0.9, w: 1.0, h: 1.0,
    fontSize: 48,
    align: 'center',
  });

  // Nombre del producto
  s.addText('CareSignal', {
    x: 1.6, y: 0.95, w: 7.8, h: 0.9,
    ...T.portadaTitulo,
  });

  // Tagline
  s.addText('Trazabilidad operativa para residencias de adultos mayores', {
    x: 1.6, y: 1.85, w: 7.8, h: 0.45,
    ...T.portadaTagline,
  });

  // Línea separadora
  s.addShape('line', {
    x: 0.5, y: 2.5, w: 9.16, h: 0,
    line: { color: C.grisSep, width: 1.2 },
  });

  // Tres pilares en tarjetas
  const pilares = [
    { icono: '⏱️', texto: 'Detección\nautomática de\nrondas atrasadas' },
    { icono: '📋', texto: 'Bitácora\nauditable\ne inmutable' },
    { icono: '🔔', texto: 'Alertas en\ntiempo real\nal supervisor' },
  ];
  pilares.forEach((p, i) => {
    const x = 0.5 + i * 3.1;
    tarjeta(s, x, 2.8, 2.85, 2.2);
    s.addText(p.icono, { x, y: 2.95, w: 2.85, h: 0.6, fontSize: 30, align: 'center' });
    s.addText(p.texto, {
      x, y: 3.6, w: 2.85, h: 1.1,
      fontSize: 13, color: C.grafito, align: 'center', fontFace: 'Arial',
    });
  });

  // Contexto del pitch
  s.addText('Pitch · 4 minutos  |  WomenCISO 4 / MenCISO 1  |  Agosto 2026', {
    x: 0.5, y: 5.35, w: 9.16, h: 0.35,
    fontSize: 12, color: C.gris, align: 'center', fontFace: 'Arial',
  });

  // Versión + disclaimers
  s.addText('v0.1.0-workshop  ·  MVP operacional  ·  No dispositivo médico  ·  Datos ficticios', {
    x: 0.5, y: 6.75, w: 9.16, h: 0.28,
    ...T.nota,
    align: 'center',
  });
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const prs = new PptxGenJS();
  prs.layout = 'LAYOUT_WIDE'; // 16:9 — 10 × 7.5 pulgadas

  // Slides activos en este chunk
  slidePortada(prs);

  const out = path.join(__dirname, '..', 'business', 'CareSignal_Pitch_Deck.pptx');
  await prs.writeFile({ fileName: out });
  console.log('✅ Deck generado:', out);
}

main().catch(e => { console.error('❌', e); process.exit(1); });
