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

// ── SLIDE 2 — ESCALA GLOBAL ───────────────────────────────────────────────────
function slideEscalaGlobal(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'B');

  s.addText('El problema ya llegó para cientos de millones', {
    x: 0.5, y: 0.25, w: 9.16, h: 0.55,
    ...T.slideTitulo,
  });
  s.addText('Personas mayores de 65 años en el mundo · 2023–2050', {
    x: 0.5, y: 0.8, w: 9.16, h: 0.35,
    ...T.slideSubtitulo,
  });
  s.addShape('line', { x: 0.5, y: 1.2, w: 9.16, h: 0, line: { color: C.grisSep, width: 1 } });

  // Infografía de regiones — posiciones simulando mapa occidental→oriental
  const regiones = [
    { emoji: '🌎', lugar: 'México',          dato: '17.1 M',  sub: '60+ años · CONAPO 2025',  x: 0.4,  y: 1.5,  colorDato: C.azulOscuro },
    { emoji: '🌎', lugar: 'América Latina',  dato: '65 M',    sub: '65+ años · CEPAL 2024',    x: 2.45, y: 1.5,  colorDato: C.azul },
    { emoji: '🌎', lugar: 'EE. UU.',         dato: '57 M',    sub: '65+ años · Census 2023',   x: 4.5,  y: 1.5,  colorDato: C.azul },
    { emoji: '🌏', lugar: 'Japón',           dato: '36 M',    sub: '65+ años · Stat. JP 2023', x: 6.55, y: 1.5,  colorDato: C.azul },
    { emoji: '🌍', lugar: 'Global',          dato: '770 M',   sub: 'UN WPP 2022 (se estima)',  x: 0.4,  y: 3.85, colorDato: C.terracota },
    { emoji: '📈', lugar: 'Global 2050',     dato: '1,600 M', sub: 'Proyección ONU (se estima)', x: 3.2, y: 3.85, colorDato: C.terracota },
  ];

  regiones.forEach((r) => {
    tarjeta(s, r.x, r.y, 1.9, 2.0);
    s.addText(r.emoji,  { x: r.x, y: r.y + 0.08, w: 1.9, h: 0.5, fontSize: 22, align: 'center' });
    s.addText(r.lugar,  { x: r.x, y: r.y + 0.55, w: 1.9, h: 0.3, fontSize: 11, bold: true, color: C.grafito, align: 'center', fontFace: 'Arial' });
    s.addText(r.dato,   { x: r.x, y: r.y + 0.85, w: 1.9, h: 0.5, fontSize: 22, bold: true, color: r.colorDato, align: 'center', fontFace: 'Arial' });
    s.addText(r.sub,    { x: r.x, y: r.y + 1.38, w: 1.9, h: 0.45, fontSize: 8.5, color: C.gris, align: 'center', fontFace: 'Arial' });
  });

  // Separador entre filas
  s.addShape('line', { x: 0.4, y: 3.7, w: 9.2, h: 0, line: { color: C.grisSep, width: 0.75 } });

  // Mensaje de impacto
  s.addText('Para 2050 habrá casi el doble de la población actual de China viviendo esta realidad.', {
    x: 5.3, y: 3.85, w: 4.3, h: 1.3,
    fontSize: 14, color: C.grafito, fontFace: 'Arial', italic: true,
    valign: 'middle',
  });

  s.addText('Fuentes: CONAPO · CEPAL · US Census Bureau · Statistics Japan · UN WPP 2022  ·  Cifras internacionales "se estima"', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22,
    ...T.nota, align: 'left',
  });
}

// ── SLIDE 3 — MOMENTO DE CONFIANZA ────────────────────────────────────────────
function slideMomentoConfianza(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'A');

  // Ícono central grande
  s.addText('🤝', { x: 4.0, y: 0.7, w: 1.9, h: 1.3, fontSize: 60, align: 'center' });

  s.addText('El momento de confianza', {
    x: 0.5, y: 2.0, w: 9.16, h: 0.6,
    ...T.slideTitulo, align: 'center',
  });

  s.addShape('line', { x: 3.0, y: 2.7, w: 3.8, h: 0, line: { color: C.azul, width: 2 } });

  s.addText(
    'Cuando llevas a ese familiar, a ese ser querido, a una residencia,\nle estás confiando lo más valioso que tienes —\nsu tiempo, su dignidad, su seguridad.',
    {
      x: 0.8, y: 2.95, w: 8.2, h: 1.6,
      fontSize: 20, color: C.grafito, align: 'center', fontFace: 'Arial',
      lineSpacingMultiple: 1.4,
    }
  );

  // Tres palabras clave destacadas
  const palabras = ['Tiempo', 'Dignidad', 'Seguridad'];
  palabras.forEach((p, i) => {
    const x = 1.4 + i * 2.7;
    tarjeta(s, x, 4.85, 2.2, 0.75, C.tarjeta);
    s.addText(p, { x, y: 4.85, w: 2.2, h: 0.75, fontSize: 16, bold: true, color: C.azul, align: 'center', fontFace: 'Arial', valign: 'middle' });
  });

  s.addText('MVP operacional · No dispositivo médico · Datos ficticios', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22, ...T.nota, align: 'center',
  });
}

// ── SLIDE 4 — FALLO OPERATIVO ──────────────────────────────────────────────────
function slideFalloOperativo(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'B');

  s.addText('⚠️  Fallo operativo', {
    x: 0.5, y: 0.25, w: 9.16, h: 0.55,
    ...T.slideTitulo,
  });
  s.addText('Cuando el cuidado ocurre — o no ocurre — y nadie lo sabe', {
    x: 0.5, y: 0.8, w: 9.16, h: 0.35,
    ...T.slideSubtitulo,
  });
  s.addShape('line', { x: 0.5, y: 1.2, w: 9.16, h: 0, line: { color: C.grisSep, width: 1 } });

  // Diagrama de flujo: 4 cajas + flechas
  const pasos = [
    { emoji: '📅', label: 'Ronda\nprogramada', color: C.azulClaro },
    { emoji: '🚶', label: '¿Cuidador\nfue a verlo?', color: C.tarjeta },
    { emoji: '❓', label: 'Sin registro\nni evidencia', color: 'FDE68A' },
    { emoji: '😰', label: 'Nadie lo sabe\nhasta que es tarde', color: 'FECACA' },
  ];

  pasos.forEach((p, i) => {
    const x = 0.4 + i * 2.32;
    s.addShape('roundRect', {
      x, y: 1.45, w: 2.0, h: 1.9,
      fill: { color: p.color },
      line: { color: C.grisSep, width: 0.5 },
      rectRadius: 0.1,
    });
    s.addText(p.emoji, { x, y: 1.55, w: 2.0, h: 0.6, fontSize: 26, align: 'center' });
    s.addText(p.label, { x, y: 2.2, w: 2.0, h: 0.9, fontSize: 12, bold: false, color: C.grafito, align: 'center', fontFace: 'Arial' });

    // Flecha entre cajas
    if (i < 3) {
      s.addText('→', { x: x + 2.0, y: 1.9, w: 0.32, h: 0.5, fontSize: 20, color: C.gris, align: 'center', fontFace: 'Arial' });
    }
  });

  // Dato ilustrativo
  tarjeta(s, 0.5, 3.65, 9.16, 1.05, C.tarjeta);
  s.addText('📊', { x: 0.6, y: 3.72, w: 0.8, h: 0.8, fontSize: 28, align: 'center' });
  s.addText(
    'Como ejemplo: en una residencia con 50 adultos mayores se realizan cerca de 450 rondas por semana.\nCada una es una oportunidad de que el cuidado ocurra — o de que no ocurra y nadie lo detecte.',
    { x: 1.5, y: 3.72, w: 7.9, h: 0.9, fontSize: 13, color: C.grafito, fontFace: 'Arial', valign: 'middle' }
  );

  s.addText('MVP operacional · No dispositivo médico · Datos ficticios', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22, ...T.nota, align: 'center',
  });
}

// ── SLIDE 5 — FALLO ADMINISTRATIVO ────────────────────────────────────────────
function slideFalloAdministrativo(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'C');

  s.addText('🗂️  Fallo administrativo', {
    x: 0.5, y: 0.25, w: 9.16, h: 0.55,
    ...T.slideTitulo,
  });
  s.addText('Sin registro confiable, no hay defensa posible', {
    x: 0.5, y: 0.8, w: 9.16, h: 0.35,
    ...T.slideSubtitulo,
  });
  s.addShape('line', { x: 0.5, y: 1.2, w: 9.16, h: 0, line: { color: C.grisSep, width: 1 } });

  // Tres golpes narrativos
  const golpes = [
    { emoji: '👨‍👩‍👧', actor: 'La familia llama',      consecuencia: 'y no hay respuesta.',     color: C.tarjeta },
    { emoji: '🏛️',   actor: 'La inspección llega', consecuencia: 'y no hay evidencia.',    color: 'EDE9FE' },
    { emoji: '⚖️',   actor: 'El abogado pregunta', consecuencia: 'y no hay defensa.',      color: 'FECACA' },
  ];

  golpes.forEach((g, i) => {
    const y = 1.45 + i * 1.45;
    s.addShape('roundRect', {
      x: 0.5, y, w: 9.16, h: 1.25,
      fill: { color: g.color },
      line: { color: C.grisSep, width: 0.5 },
      rectRadius: 0.1,
    });
    s.addText(g.emoji,        { x: 0.65, y: y + 0.28, w: 0.9, h: 0.7, fontSize: 28, align: 'center' });
    s.addText(g.actor,        { x: 1.65, y: y + 0.2,  w: 3.5, h: 0.45, fontSize: 15, bold: true,  color: C.grafito,  fontFace: 'Arial' });
    s.addText(g.consecuencia, { x: 1.65, y: y + 0.65, w: 7.5, h: 0.4,  fontSize: 14, bold: false, color: C.terracota, fontFace: 'Arial', italic: true });
  });

  s.addText(
    'Sin registro auditable, el director no puede demostrar que el cuidado ocurrió — en ningún escenario.',
    { x: 0.5, y: 6.5, w: 9.16, h: 0.38, fontSize: 12, color: C.gris, fontFace: 'Arial', italic: true, align: 'center' }
  );
  s.addText('MVP operacional · No dispositivo médico · Datos ficticios', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22, ...T.nota, align: 'center',
  });
}

// ── SLIDE 6 — MARCO LEGAL + MULTA ─────────────────────────────────────────────
function slideMarcoLegal(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'A');

  s.addText('⚖️  Marco legal — exposición permanente', {
    x: 0.5, y: 0.25, w: 9.16, h: 0.55,
    ...T.slideTitulo,
  });
  s.addText('La regulación ya exige los registros — sin fecha ni aviso previo', {
    x: 0.5, y: 0.8, w: 9.16, h: 0.35,
    ...T.slideSubtitulo,
  });
  s.addShape('line', { x: 0.5, y: 1.2, w: 9.16, h: 0, line: { color: C.grisSep, width: 1 } });

  // Tabla legal
  const filas = [
    { icono: '📜', norma: 'NOM-031-SSA3-2012',   desc: 'Exige expediente administrativo permanente por residente, reglamento interno y bitácoras de operación.', color: C.tarjeta },
    { icono: '🔍', norma: 'CNDH ISP-12/2020',    desc: 'Muestreo en residencias documentó abandono, falta de personal y deficiencias operativas — sin sistemas de gestión.', color: 'EDE9FE' },
    { icono: '⚖️', norma: 'Ley General de Salud', desc: 'Art. 419: multas por incumplimiento pueden superar $234,000 MXN — y cualquier inspección, queja o demanda puede llegar sin aviso.', color: 'FECACA' },
  ];

  filas.forEach((f, i) => {
    const y = 1.38 + i * 1.45;
    s.addShape('roundRect', {
      x: 0.5, y, w: 9.16, h: 1.28,
      fill: { color: f.color },
      line: { color: C.grisSep, width: 0.5 },
      rectRadius: 0.1,
    });
    s.addText(f.icono, { x: 0.65, y: y + 0.28, w: 0.8, h: 0.7, fontSize: 26, align: 'center' });
    s.addText(f.norma, { x: 1.55, y: y + 0.15, w: 7.9, h: 0.38, fontSize: 13, bold: true, color: C.grafito, fontFace: 'Arial' });
    s.addText(f.desc,  { x: 1.55, y: y + 0.55, w: 7.9, h: 0.65, fontSize: 12, color: C.grafito, fontFace: 'Arial' });
  });

  s.addText('Fuentes: DOF · CNDH · Ley General de Salud Art. 419', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22, ...T.nota, align: 'left',
  });
}

// ── SLIDE 7 — SOLUCIÓN ────────────────────────────────────────────────────────
function slideSolucion(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'C');

  s.addText('✅  CareSignal — la solución', {
    x: 0.5, y: 0.25, w: 9.16, h: 0.55,
    ...T.slideTitulo,
  });
  s.addText('Un sistema diseñado para resolver los dos fallos', {
    x: 0.5, y: 0.8, w: 9.16, h: 0.35,
    ...T.slideSubtitulo,
  });
  s.addShape('line', { x: 0.5, y: 1.2, w: 9.16, h: 0, line: { color: C.grisSep, width: 1 } });

  // Columna izquierda — fallo operativo
  tarjeta(s, 0.5, 1.38, 4.35, 3.8, 'EFF6FF');
  s.addText('⚠️  Fallo operativo', {
    x: 0.65, y: 1.5, w: 4.05, h: 0.42,
    fontSize: 14, bold: true, color: C.terracota, fontFace: 'Arial',
  });
  s.addShape('line', { x: 0.65, y: 1.95, w: 4.05, h: 0, line: { color: C.grisSep, width: 0.75 } });
  s.addText('Ronda no ocurre y nadie lo detecta', {
    x: 0.65, y: 2.05, w: 4.05, h: 0.38,
    fontSize: 12, color: C.gris, italic: true, fontFace: 'Arial',
  });
  s.addText('⏱️', { x: 0.7, y: 2.55, w: 0.6, h: 0.5, fontSize: 22, align: 'center' });
  s.addText('Detecta automáticamente\ncuando una ronda no ocurre', {
    x: 1.35, y: 2.55, w: 3.35, h: 0.65, fontSize: 13, color: C.grafito, fontFace: 'Arial',
  });
  s.addText('🔔', { x: 0.7, y: 3.3, w: 0.6, h: 0.5, fontSize: 22, align: 'center' });
  s.addText('Alerta al supervisor\nen tiempo real', {
    x: 1.35, y: 3.3, w: 3.35, h: 0.65, fontSize: 13, color: C.grafito, fontFace: 'Arial',
  });
  s.addText('👤', { x: 0.7, y: 4.05, w: 0.6, h: 0.5, fontSize: 22, align: 'center' });
  s.addText('Asignación, escalación\ny seguimiento del cuidador', {
    x: 1.35, y: 4.05, w: 3.35, h: 0.65, fontSize: 13, color: C.grafito, fontFace: 'Arial',
  });

  // Columna derecha — fallo administrativo
  tarjeta(s, 5.3, 1.38, 4.35, 3.8, 'F0FDF4');
  s.addText('🗂️  Fallo administrativo', {
    x: 5.45, y: 1.5, w: 4.05, h: 0.42,
    fontSize: 14, bold: true, color: C.verde, fontFace: 'Arial',
  });
  s.addShape('line', { x: 5.45, y: 1.95, w: 4.05, h: 0, line: { color: C.grisSep, width: 0.75 } });
  s.addText('Sin registro confiable ni evidencia auditable', {
    x: 5.45, y: 2.05, w: 4.05, h: 0.38,
    fontSize: 12, color: C.gris, italic: true, fontFace: 'Arial',
  });
  s.addText('📋', { x: 5.5, y: 2.55, w: 0.6, h: 0.5, fontSize: 22, align: 'center' });
  s.addText('Bitácora inmutable:\nquién, cuándo, qué resultado', {
    x: 6.15, y: 2.55, w: 3.35, h: 0.65, fontSize: 13, color: C.grafito, fontFace: 'Arial',
  });
  s.addText('📄', { x: 5.5, y: 3.3, w: 0.6, h: 0.5, fontSize: 22, align: 'center' });
  s.addText('Sin papel, sin transcripción,\nsin trabajo extra', {
    x: 6.15, y: 3.3, w: 3.35, h: 0.65, fontSize: 13, color: C.grafito, fontFace: 'Arial',
  });
  s.addText('🛡️', { x: 5.5, y: 4.05, w: 0.6, h: 0.5, fontSize: 22, align: 'center' });
  s.addText('Evidencia lista ante cualquier\ninspección, queja o demanda', {
    x: 6.15, y: 4.05, w: 3.35, h: 0.65, fontSize: 13, color: C.grafito, fontFace: 'Arial',
  });

  // Flecha central entre columnas
  s.addText('→', {
    x: 4.85, y: 2.9, w: 0.45, h: 0.5,
    fontSize: 24, bold: true, color: C.azul, align: 'center', fontFace: 'Arial',
  });

  // Remate
  tarjeta(s, 0.5, 5.42, 9.16, 0.75, C.tarjeta);
  s.addText(
    'El director tiene evidencia lista ante cualquier inspección, queja o demanda — en todo momento.',
    { x: 0.7, y: 5.5, w: 8.76, h: 0.55, fontSize: 13, bold: true, color: C.grafito, align: 'center', fontFace: 'Arial', valign: 'middle' }
  );

  s.addText('MVP operacional · No dispositivo médico · Datos ficticios', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22, ...T.nota, align: 'center',
  });
}

// ── SLIDE 8 — MERCADO ─────────────────────────────────────────────────────────
function slideMercado(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'B');

  s.addText('📊  Tamaño de mercado', {
    x: 0.5, y: 0.25, w: 9.16, h: 0.55,
    ...T.slideTitulo,
  });
  s.addText('México · SaaS B2B · por residencia / mes', {
    x: 0.5, y: 0.8, w: 9.16, h: 0.35,
    ...T.slideSubtitulo,
  });
  s.addShape('line', { x: 0.5, y: 1.2, w: 9.16, h: 0, line: { color: C.grisSep, width: 1 } });

  // TAM / SAM / SOM — círculos concéntricos simulados con 3 rectángulos redondeados
  const niveles = [
    { label: 'TAM', sub: 'Mercado total cuidados\ngeriátricos MX + LatAm', valor: '> USD 25,000 M', color: C.azulClaro, x: 0.5,  y: 1.38, w: 9.16, h: 1.5  },
    { label: 'SAM', sub: '~1,100–1,300 residencias\nprivadas formales en MX', valor: 'DENUE 2025 · +18 % anual', color: 'D1E8F5',  x: 0.95, y: 2.65, w: 8.26, h: 1.45 },
    { label: 'SOM', sub: 'Objetivo 3–5 años:\n50–200 residencias piloto', valor: '$175K – $700K MXN/mes', color: C.tarjeta,  x: 1.4,  y: 3.88, w: 7.36, h: 1.45 },
  ];

  niveles.forEach((n) => {
    s.addShape('roundRect', {
      x: n.x, y: n.y, w: n.w, h: n.h,
      fill: { color: n.color },
      line: { color: C.grisSep, width: 0.5 },
      rectRadius: 0.1,
    });
    s.addText(n.label, { x: n.x + 0.18, y: n.y + 0.12, w: 1.0, h: 0.42, fontSize: 15, bold: true, color: C.azulOscuro, fontFace: 'Arial' });
    s.addText(n.sub,   { x: n.x + 1.25, y: n.y + 0.08, w: 4.5, h: 0.75, fontSize: 11, color: C.grafito, fontFace: 'Arial' });
    s.addText(n.valor, { x: n.x + 5.8,  y: n.y + 0.25, w: 3.0, h: 0.42, fontSize: 13, bold: true, color: C.azulOscuro, fontFace: 'Arial', align: 'right' });
  });

  // Crecimiento del sector
  tarjeta(s, 0.5, 5.52, 9.16, 0.65, C.tarjeta);
  s.addText('📈  El registro del sector creció +18 % en un año (DENUE 2024→2025) — mercado en expansión activa.', {
    x: 0.7, y: 5.6, w: 8.76, h: 0.48,
    fontSize: 12, color: C.grafito, fontFace: 'Arial', valign: 'middle',
  });

  s.addText('Fuentes: DENUE 2025 · IMARC Group · Grand View Research  ·  Precios de referencia, no validados con clientes', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22, ...T.nota, align: 'left',
  });
}

// ── SLIDE 9 — DIFERENCIADOR ────────────────────────────────────────────────────
function slideDiferenciador(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'A');

  s.addText('🏆  ¿Por qué CareSignal?', {
    x: 0.5, y: 0.25, w: 9.16, h: 0.55,
    ...T.slideTitulo,
  });
  s.addText('Nadie más modela el ciclo operativo de la ronda', {
    x: 0.5, y: 0.8, w: 9.16, h: 0.35,
    ...T.slideSubtitulo,
  });
  s.addShape('line', { x: 0.5, y: 1.2, w: 9.16, h: 0, line: { color: C.grisSep, width: 1 } });

  // Encabezados de tabla
  const cols = [
    { label: 'Capacidad',           x: 0.5,  w: 3.0  },
    { label: 'CareSignal',          x: 3.55, w: 1.85, color: C.azul },
    { label: 'Cronos Care',         x: 5.45, w: 1.85 },
    { label: 'GERIGES',             x: 7.35, w: 1.85 },
  ];

  // Fila de encabezado
  s.addShape('roundRect', {
    x: 0.5, y: 1.3, w: 9.16, h: 0.5,
    fill: { color: C.azul }, line: { color: C.azul }, rectRadius: 0.05,
  });
  cols.forEach(c => {
    s.addText(c.label, {
      x: c.x + 0.1, y: 1.35, w: c.w - 0.1, h: 0.4,
      fontSize: 12, bold: true, color: C.blanco, fontFace: 'Arial', valign: 'middle',
    });
  });

  // Filas de datos
  const filas = [
    { cap: 'Detección de ronda atrasada',      cs: '✅', cc: '❌', ge: '❌', bg: C.tarjeta },
    { cap: 'Alerta automática al supervisor',  cs: '✅', cc: '❌', ge: '❌', bg: C.blanco  },
    { cap: 'Bitácora de auditoría inmutable',  cs: '✅', cc: '⚠️', ge: '⚠️', bg: C.tarjeta },
    { cap: 'Ciclo completo alerta→cierre',     cs: '✅', cc: '❌', ge: '❌', bg: C.blanco  },
    { cap: 'Precio publicado',                 cs: '✅', cc: '❌', ge: '❌', bg: C.tarjeta },
    { cap: 'Expediente / historial residente', cs: '⚠️',cc: '✅', ge: '✅', bg: C.blanco  },
  ];

  filas.forEach((f, i) => {
    const y = 1.8 + i * 0.65;
    s.addShape('roundRect', {
      x: 0.5, y, w: 9.16, h: 0.58,
      fill: { color: f.bg }, line: { color: C.grisSep, width: 0.4 }, rectRadius: 0.04,
    });
    s.addText(f.cap, { x: 0.6,  y: y + 0.08, w: 2.85, h: 0.42, fontSize: 11.5, color: C.grafito, fontFace: 'Arial' });
    s.addText(f.cs,  { x: 3.55, y: y + 0.05, w: 1.85, h: 0.48, fontSize: 18, align: 'center' });
    s.addText(f.cc,  { x: 5.45, y: y + 0.05, w: 1.85, h: 0.48, fontSize: 18, align: 'center' });
    s.addText(f.ge,  { x: 7.35, y: y + 0.05, w: 1.85, h: 0.48, fontSize: 18, align: 'center' });
  });

  s.addText('⚠️ = funcionalidad parcial o no confirmada  ·  Fuente: investigación pública agosto 2026', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22, ...T.nota, align: 'left',
  });
}

// ── SLIDE 10 — TRACCIÓN ───────────────────────────────────────────────────────
function slideTraccion(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'C');

  s.addText('🏅  Tracción — producto terminado hoy', {
    x: 0.5, y: 0.25, w: 9.16, h: 0.55,
    ...T.slideTitulo,
  });
  s.addText('8 fases con gate review humano · Auditoría QA: PASS', {
    x: 0.5, y: 0.8, w: 9.16, h: 0.35,
    ...T.slideSubtitulo,
  });
  s.addShape('line', { x: 0.5, y: 1.2, w: 9.16, h: 0, line: { color: C.grisSep, width: 1 } });

  // Tarjetas métricas — fila superior
  const metricas = [
    { emoji: '✅', valor: '8 / 8',  label: 'Fases aprobadas\ncon gate review', color: 'F0FDF4' },
    { emoji: '🧪', valor: '38',     label: 'Pruebas\nautomatizadas',            color: 'EFF6FF' },
    { emoji: '📋', valor: '20',     label: 'Aceptación\ndel contrato',           color: 'EFF6FF' },
    { emoji: '🚫', valor: '0',      label: 'Hallazgos\nbloqueantes',            color: 'FFF7ED' },
  ];

  metricas.forEach((m, i) => {
    const x = 0.5 + i * 2.32;
    tarjeta(s, x, 1.38, 2.0, 2.15, m.color);
    s.addText(m.emoji, { x, y: 1.5,  w: 2.0, h: 0.55, fontSize: 26, align: 'center' });
    s.addText(m.valor, { x, y: 2.1,  w: 2.0, h: 0.65, fontSize: 30, bold: true, color: C.azulOscuro, align: 'center', fontFace: 'Arial' });
    s.addText(m.label, { x, y: 2.75, w: 2.0, h: 0.6,  fontSize: 10.5, color: C.gris, align: 'center', fontFace: 'Arial' });
  });

  // Segunda fila — detalles adicionales
  const extras = [
    { emoji: '📊', valor: '20',    label: 'Tipos de evento\nde auditoría',         color: C.tarjeta },
    { emoji: '⚙️', valor: '8',     label: 'Políticas del\nmotor temporal',          color: C.tarjeta },
    { emoji: '👆', valor: '≤ 3',   label: 'Acciones para\ncompletar una ronda',    color: C.tarjeta },
    { emoji: '📦', valor: '~68 KB',label: 'Bundle comprimido\nde producción',       color: C.tarjeta },
  ];

  extras.forEach((m, i) => {
    const x = 0.5 + i * 2.32;
    tarjeta(s, x, 3.75, 2.0, 1.85, m.color);
    s.addText(m.emoji, { x, y: 3.85, w: 2.0, h: 0.5,  fontSize: 22, align: 'center' });
    s.addText(m.valor, { x, y: 4.38, w: 2.0, h: 0.55, fontSize: 24, bold: true, color: C.azul, align: 'center', fontFace: 'Arial' });
    s.addText(m.label, { x, y: 4.95, w: 2.0, h: 0.5,  fontSize: 10, color: C.gris, align: 'center', fontFace: 'Arial' });
  });

  s.addText('MVP operacional · No dispositivo médico · Datos ficticios', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22, ...T.nota, align: 'center',
  });
}

// ── SLIDE 11 — MODELO DE NEGOCIO ──────────────────────────────────────────────
function slideModelo(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'B');

  s.addText('💰  Modelo de negocio', {
    x: 0.5, y: 0.25, w: 9.16, h: 0.55,
    ...T.slideTitulo,
  });
  s.addText('SaaS B2B · por residencia / mes · margen bruto > 97 %', {
    x: 0.5, y: 0.8, w: 9.16, h: 0.35,
    ...T.slideSubtitulo,
  });
  s.addShape('line', { x: 0.5, y: 1.2, w: 9.16, h: 0, line: { color: C.grisSep, width: 1 } });

  // Tres planes
  const planes = [
    {
      nombre: 'Esencial',
      precio: '$1,490',
      sub: 'MXN / mes',
      residentes: 'Hasta 25 residentes',
      supervisores: '1 supervisor',
      cuidadores: 'Hasta 5 cuidadores',
      nota: 'Residencias pequeñas',
      color: C.tarjeta,
      colorPrecio: C.azul,
    },
    {
      nombre: 'Profesional',
      precio: '$3,490',
      sub: 'MXN / mes',
      residentes: 'Hasta 75 residentes',
      supervisores: 'Hasta 3 supervisores',
      cuidadores: 'Hasta 15 cuidadores',
      nota: 'Residencias medianas',
      color: 'EFF6FF',
      colorPrecio: C.azulOscuro,
      destacado: true,
    },
    {
      nombre: 'Institucional',
      precio: '$6,990',
      sub: 'MXN / mes',
      residentes: 'Sin límite',
      supervisores: 'Sin límite',
      cuidadores: 'Sin límite',
      nota: 'Cadenas · soporte prioritario',
      color: C.tarjeta,
      colorPrecio: C.azul,
    },
  ];

  planes.forEach((p, i) => {
    const x = 0.5 + i * 3.08;
    const bordeColor = p.destacado ? C.azul : C.grisSep;
    const bordeW = p.destacado ? 1.5 : 0.5;
    s.addShape('roundRect', {
      x, y: 1.38, w: 2.88, h: 4.6,
      fill: { color: p.color },
      line: { color: bordeColor, width: bordeW },
      rectRadius: 0.12,
    });

    if (p.destacado) {
      s.addShape('roundRect', {
        x: x + 0.4, y: 1.3, w: 2.05, h: 0.32,
        fill: { color: C.azul }, line: { color: C.azul }, rectRadius: 0.06,
      });
      s.addText('Más popular', { x: x + 0.4, y: 1.3, w: 2.05, h: 0.32, fontSize: 9, bold: true, color: C.blanco, align: 'center', fontFace: 'Arial', valign: 'middle' });
    }

    s.addText(p.nombre,  { x, y: 1.55, w: 2.88, h: 0.4,  fontSize: 15, bold: true, color: C.grafito, align: 'center', fontFace: 'Arial' });
    s.addText(p.precio,  { x, y: 2.0,  w: 2.88, h: 0.7,  fontSize: 32, bold: true, color: p.colorPrecio, align: 'center', fontFace: 'Arial' });
    s.addText(p.sub,     { x, y: 2.72, w: 2.88, h: 0.3,  fontSize: 11, color: C.gris, align: 'center', fontFace: 'Arial' });

    s.addShape('line', { x: x + 0.2, y: 3.1, w: 2.48, h: 0, line: { color: C.grisSep, width: 0.5 } });

    [p.residentes, p.supervisores, p.cuidadores, p.nota].forEach((txt, j) => {
      const bold = j === 3;
      s.addText(txt, {
        x: x + 0.15, y: 3.22 + j * 0.54, w: 2.58, h: 0.46,
        fontSize: 11.5, bold, color: bold ? C.azul : C.grafito, align: 'center', fontFace: 'Arial',
      });
    });
  });

  s.addText('⚠️ Precios de referencia — no validados con clientes. Declarar ante jueces.', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22, ...T.nota, align: 'left',
  });
}

// ── SLIDE 12 — IA + CIBERSEGURIDAD ────────────────────────────────────────────
function slideIACiberseg(prs) {
  const s = base(prs);
  decoFondo(s, prs, 'C');

  s.addText('🔐  IA y Ciberseguridad', {
    x: 0.5, y: 0.25, w: 9.16, h: 0.55,
    ...T.slideTitulo,
  });
  s.addText('Datos sensibles por ley · arquitectura en GCP · roadmap de IA operativa', {
    x: 0.5, y: 0.8, w: 9.16, h: 0.35,
    ...T.slideSubtitulo,
  });
  s.addShape('line', { x: 0.5, y: 1.2, w: 9.16, h: 0, line: { color: C.grisSep, width: 1 } });

  // Columna izquierda — Ciberseguridad
  tarjeta(s, 0.5, 1.38, 4.35, 3.5, 'FFF7ED');
  s.addText('🛡️  Ciberseguridad', {
    x: 0.65, y: 1.5, w: 4.05, h: 0.42,
    fontSize: 14, bold: true, color: C.terracota, fontFace: 'Arial',
  });
  s.addShape('line', { x: 0.65, y: 1.95, w: 4.05, h: 0, line: { color: C.grisSep, width: 0.6 } });

  const capas = [
    { emoji: '📜', txt: 'LFPDPPP — datos de adultos\nmayores son datos sensibles por ley' },
    { emoji: '☁️',  txt: 'Google Cloud Run + Firebase\ncon cifrado extremo a extremo' },
    { emoji: '🔒', txt: 'Ningún dato de residente\nsale del dispositivo — privacidad por diseño' },
    { emoji: '👮', txt: 'Agente de ciberseguridad\nactivo 24 h sobre Gemini API' },
  ];
  capas.forEach((c, i) => {
    s.addText(c.emoji, { x: 0.65, y: 2.1 + i * 0.72, w: 0.6, h: 0.58, fontSize: 20, align: 'center' });
    s.addText(c.txt,   { x: 1.3,  y: 2.1 + i * 0.72, w: 3.35, h: 0.58, fontSize: 11.5, color: C.grafito, fontFace: 'Arial', valign: 'middle' });
  });

  // Columna derecha — IA (roadmap)
  tarjeta(s, 5.3, 1.38, 4.35, 3.5, 'EFF6FF');
  s.addText('🤖  IA Operativa — roadmap v0.2', {
    x: 5.45, y: 1.5, w: 4.05, h: 0.42,
    fontSize: 14, bold: true, color: C.azulOscuro, fontFace: 'Arial',
  });
  s.addShape('line', { x: 5.45, y: 1.95, w: 4.05, h: 0, line: { color: C.grisSep, width: 0.6 } });

  const funciones = [
    { emoji: '📈', txt: 'Alertas predictivas\nsobre histórico de tiempos de ronda' },
    { emoji: '🔍', txt: 'Detección de anomalías\nen la bitácora de auditoría' },
    { emoji: '📅', txt: 'Optimización de asignación\nde cuidadores por turno' },
    { emoji: '📝', txt: 'Resumen ejecutivo automático\ndel turno — sin transcripción manual' },
  ];
  funciones.forEach((f, i) => {
    s.addText(f.emoji, { x: 5.45, y: 2.1 + i * 0.72, w: 0.6, h: 0.58, fontSize: 20, align: 'center' });
    s.addText(f.txt,   { x: 6.1,  y: 2.1 + i * 0.72, w: 3.4, h: 0.58, fontSize: 11.5, color: C.grafito, fontFace: 'Arial', valign: 'middle' });
  });

  // Diagrama de arquitectura simplificado — barra central
  s.addShape('line', { x: 4.85, y: 1.55, w: 0, h: 3.2, line: { color: C.grisSep, width: 1 } });
  s.addText('→', { x: 4.72, y: 2.85, w: 0.45, h: 0.4, fontSize: 18, color: C.azul, align: 'center', fontFace: 'Arial' });

  // Remate — base de datos de eventos
  tarjeta(s, 0.5, 5.1, 9.16, 0.82, C.tarjeta);
  s.addText('📊', { x: 0.62, y: 5.22, w: 0.7, h: 0.6, fontSize: 24, align: 'center' });
  s.addText(
    'La bitácora de 20 tipos de evento por turno es el insumo nativo para toda la IA operativa —\nsin integración externa, sin datos sintéticos.',
    { x: 1.4, y: 5.18, w: 8.1, h: 0.66, fontSize: 12, color: C.grafito, fontFace: 'Arial', valign: 'middle' }
  );

  s.addText('Criterios 1 y 11 del concurso: IA aplicada · ciberseguridad activa', {
    x: 0.5, y: 6.88, w: 9.16, h: 0.22, ...T.nota, align: 'left',
  });
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const prs = new PptxGenJS();
  prs.layout = 'LAYOUT_WIDE'; // 16:9 — 10 × 7.5 pulgadas

  // Slides activos en este chunk
  slidePortada(prs);
  slideEscalaGlobal(prs);
  slideMomentoConfianza(prs);
  slideFalloOperativo(prs);
  slideFalloAdministrativo(prs);
  slideMarcoLegal(prs);
  slideSolucion(prs);
  slideMercado(prs);
  slideDiferenciador(prs);
  slideTraccion(prs);
  slideModelo(prs);
  slideIACiberseg(prs);

  const out = path.join(__dirname, '..', 'business', 'CareSignal_Pitch_Deck.pptx');
  await prs.writeFile({ fileName: out });
  console.log('✅ Deck generado:', out);
}

main().catch(e => { console.error('❌', e); process.exit(1); });

main().catch(e => { console.error('❌', e); process.exit(1); });
