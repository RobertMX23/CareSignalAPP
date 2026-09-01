'use strict';
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType,
  convertMillimetersToTwip,
} = require('docx');
const fs   = require('fs');
const path = require('path');

const C = {
  azul:     '1A5276', azulCl:   'D6EAF8',
  verde:    '1E8449', verdeCl:  'D5F5E3',
  naranja:  'CA6F1E', naranjaCl:'FDEBD0',
  morado:   '6C3483', moradoCl: 'E8DAEF',
  rojo:     '922B21', rojoCl:   'FADBD8',
  gris:     '424242', grisCl:   'F2F3F4',
  blanco:   'FFFFFF', negro:    '000000',
};

const run  = (t, o = {}) => new TextRun({ text: t, font: 'Calibri', size: 22, color: C.negro, ...o });
const bold = (t, s = 22, c = C.negro) => run(t, { bold: true, size: s, color: c });
const br   = () => new Paragraph({ children: [] });

const h1 = (t, fill = C.azul) => new Paragraph({
  children: [new TextRun({ text: t, bold: true, size: 30, color: C.blanco, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill },
  spacing: { before: 360, after: 180 },
});

const h2 = (t, fill = C.azulCl, color = C.azul) => new Paragraph({
  children: [new TextRun({ text: t, bold: true, size: 24, color, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill },
  spacing: { before: 200, after: 100 },
});

const h3 = (t, color = C.azul) => new Paragraph({
  children: [new TextRun({ text: t, bold: true, size: 22, color, font: 'Calibri' })],
  spacing: { before: 160, after: 80 },
});

const divider = () => new Paragraph({
  border: { bottom: { color: C.azulCl, size: 6, style: BorderStyle.SINGLE } },
  spacing: { after: 240 },
});

const nota = (t, c = C.naranja) => new Paragraph({
  children: [new TextRun({ text: `⚙ ${t}`, italics: true, size: 19, color: c, font: 'Calibri' })],
  spacing: { after: 70 },
});

// Prompt Gemini — morado
const gemini = (titulo, prompt) => [
  new Paragraph({
    children: [new TextRun({ text: `✦ GEMINI  ·  ${titulo}`, bold: true, size: 20, color: C.morado, font: 'Calibri' })],
    shading: { type: ShadingType.CLEAR, fill: C.moradoCl },
    spacing: { before: 100, after: 0 },
    indent: { left: convertMillimetersToTwip(6) },
  }),
  new Paragraph({
    children: [new TextRun({ text: prompt, size: 19, color: C.negro, font: 'Courier New' })],
    shading: { type: ShadingType.CLEAR, fill: C.moradoCl },
    border: { left: { color: C.morado, size: 14, style: BorderStyle.SINGLE } },
    indent: { left: convertMillimetersToTwip(8) },
    spacing: { before: 0, after: 140, line: 320 },
  }),
];

// Voz en off — azul
const voz = (lines) => {
  const ch = [];
  lines.forEach((l, i) => {
    if (i > 0) ch.push(new TextRun({ text: '', break: 1 }));
    ch.push(new TextRun({ text: l === '' ? ' ' : l, size: 23, color: C.negro, font: 'Calibri', italics: true }));
  });
  return new Paragraph({
    children: ch,
    shading: { type: ShadingType.CLEAR, fill: C.azulCl },
    border: { left: { color: C.azul, size: 14, style: BorderStyle.SINGLE } },
    indent: { left: convertMillimetersToTwip(8) },
    spacing: { before: 80, after: 120, line: 340 },
  });
};

// Acción pantalla — verde
const pantalla = (lines) => {
  const ch = [];
  lines.forEach((l, i) => {
    if (i > 0) ch.push(new TextRun({ text: '', break: 1 }));
    ch.push(new TextRun({ text: l, size: 20, color: C.verde, font: 'Calibri', bold: true }));
  });
  return new Paragraph({
    children: ch,
    shading: { type: ShadingType.CLEAR, fill: C.verdeCl },
    border: { left: { color: C.verde, size: 12, style: BorderStyle.SINGLE } },
    indent: { left: convertMillimetersToTwip(8) },
    spacing: { before: 80, after: 120, line: 300 },
  });
};

// Ficha de personaje — naranja claro
const fichaPersonaje = (nombre, rol, desc, geminiDesc) => [
  new Paragraph({
    children: [new TextRun({ text: `👤  ${nombre}  ·  ${rol}`, bold: true, size: 22, color: C.naranja, font: 'Calibri' })],
    shading: { type: ShadingType.CLEAR, fill: C.naranjaCl },
    spacing: { before: 160, after: 60 },
    indent: { left: convertMillimetersToTwip(4) },
  }),
  new Paragraph({
    children: [new TextRun({ text: desc, size: 20, color: C.negro, font: 'Calibri' })],
    indent: { left: convertMillimetersToTwip(8) },
    spacing: { after: 60 },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Descripción Gemini: ', bold: true, size: 19, color: C.morado, font: 'Calibri' }),
      new TextRun({ text: geminiDesc, size: 19, color: C.negro, font: 'Courier New' }),
    ],
    shading: { type: ShadingType.CLEAR, fill: C.moradoCl },
    indent: { left: convertMillimetersToTwip(8) },
    spacing: { after: 120 },
  }),
];

// Ficha de escenario — gris claro
const fichaEscenario = (nombre, desc, geminiDesc) => [
  new Paragraph({
    children: [new TextRun({ text: `🏢  Escenario: ${nombre}`, bold: true, size: 22, color: C.gris, font: 'Calibri' })],
    shading: { type: ShadingType.CLEAR, fill: C.grisCl },
    spacing: { before: 140, after: 60 },
    indent: { left: convertMillimetersToTwip(4) },
  }),
  new Paragraph({
    children: [new TextRun({ text: desc, size: 20, color: C.negro, font: 'Calibri' })],
    indent: { left: convertMillimetersToTwip(8) },
    spacing: { after: 60 },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Descripción Gemini: ', bold: true, size: 19, color: C.morado, font: 'Calibri' }),
      new TextRun({ text: geminiDesc, size: 19, color: C.negro, font: 'Courier New' }),
    ],
    shading: { type: ShadingType.CLEAR, fill: C.moradoCl },
    indent: { left: convertMillimetersToTwip(8) },
    spacing: { after: 120 },
  }),
];

// Beat de la escena demo — fila de tiempo
const beat = (tiempo, accion, narr, wowFlag) => {
  const fillAc = wowFlag ? C.rojoCl : C.verdeCl;
  const colorAc = wowFlag ? C.rojo : C.verde;
  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: tiempo, bold: true, size: 22, color: C.blanco, font: 'Calibri' })], spacing: { before: 60, after: 60 } })],
            shading: { type: ShadingType.CLEAR, fill: wowFlag ? C.rojo : C.azul },
            width: { size: 900, type: WidthType.DXA },
            margins: { left: 80, right: 80 },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: accion, bold: !!wowFlag, size: 20, color: colorAc, font: 'Calibri' })], spacing: { before: 60, after: 60 } })],
            shading: { type: ShadingType.CLEAR, fill: fillAc },
            width: { size: 5000, type: WidthType.DXA },
            margins: { left: 80, right: 80 },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: narr || '(silencio)', italics: !narr, size: 19, color: narr ? C.azul : C.gris, font: 'Calibri' })], spacing: { before: 60, after: 60 } })],
            shading: { type: ShadingType.CLEAR, fill: narr ? C.azulCl : C.grisCl },
            width: { size: 3100, type: WidthType.DXA },
            margins: { left: 80, right: 80 },
          }),
        ],
      }),
    ],
    width: { size: 9000, type: WidthType.DXA },
    margins: { top: 0, bottom: 60 },
  });
};

function tabla(headers, rows, widths) {
  const mkC = (t, isH, ri) => new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: String(t), bold: isH, size: 18,
        color: isH ? C.blanco : C.negro, font: 'Calibri' })],
      spacing: { before: 60, after: 60 },
    })],
    shading: { type: ShadingType.CLEAR, fill: isH ? C.azul : ri % 2 === 0 ? C.blanco : C.azulCl },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
  return new Table({
    rows: [
      new TableRow({ children: headers.map((h) => mkC(h, true, 0)), tableHeader: true }),
      ...rows.map((r, ri) => new TableRow({ children: r.map((c) => mkC(c, false, ri)) })),
    ],
    width: { size: 9000, type: WidthType.DXA },
  });
}

// Estilo global Gemini
const ESTILO = 'photorealistic, editorial photography, soft pastel palette (warm ivory #FAFAF8 background, muted steel-blue #5B8DB8 accents), cinematic shallow depth of field, no text overlays, no logos, no watermarks, 16:9 aspect ratio, professional Mexican elder-care setting, warm but slightly somber mood';

async function main() {
  const doc = new Document({
    creator: 'Roberto García',
    title: 'CareSignal — Video: Personajes, Escenarios y Prompts Gemini',
    styles: { default: { document: { run: { font: 'Calibri', size: 22, color: C.negro } } } },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(20), bottom: convertMillimetersToTwip(20),
            left: convertMillimetersToTwip(22), right: convertMillimetersToTwip(22),
          },
        },
      },
      children: [

        // ── PORTADA ──────────────────────────────────────────────────────────
        br(), br(),
        new Paragraph({
          children: [new TextRun({ text: 'CareSignal', bold: true, size: 80, color: C.azul, font: 'Calibri' })],
          alignment: AlignmentType.CENTER, spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Video pitch · Personajes · Escenarios · Prompts Gemini', bold: true, size: 32, color: C.gris, font: 'Calibri' })],
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Una escena demo  ·  Perspectiva del director  ·  Hook legal  ·  ~3:00 total', size: 24, color: C.gris, font: 'Calibri', italics: true })],
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Roberto García  ·  robertogarciaits@gmail.com  ·  linkedin.com/in/robertogarciaits  ·  844 588 1313', size: 20, color: C.gris, font: 'Calibri', italics: true })],
          alignment: AlignmentType.CENTER, spacing: { after: 400 },
        }),

        // ── ESTRUCTURA ───────────────────────────────────────────────────────
        new Paragraph({ children: [bold('Estructura del video (3:00 total)', 26, C.azul)], spacing: { after: 100 } }),
        tabla(
          ['Segmento', 'Qué muestra', 'Recurso', 'Inicio', 'Dur.'],
          [
            ['Hook',  '"¿Tienes evidencia de que alguien fue a verla anoche?"', 'Gemini Img-1 + voz', '00:00', '25 s'],
            ['Demo',  'Director ve ronda vencida → alerta → bitácora inmutable', 'Screencast MVP',    '00:25', '1:30'],
            ['Cierre demo', '"Eso es lo que la NOM-031 exige."', 'Screencast + voz', '01:55', '15 s'],
            ['Números', '+1,300 residencias · ~2M familias · $3,990/mes', 'Gemini Img-2 + texto', '02:10', '20 s'],
            ['Founder', 'Roberto en cámara — 2 oraciones — nombre', 'Cámara directa', '02:30', '10 s'],
            ['Créditos', 'Logo + contacto + disclaimer', 'Motion graphics', '02:40', '10 s'],
          ],
          [1600, 3200, 1800, 900, 800]
        ),
        br(),
        divider(),

        // ── ESTILO GLOBAL ────────────────────────────────────────────────────
        h1('Estilo visual global — aplica a todos los prompts Gemini'),
        new Paragraph({ children: [run('Pega siempre este bloque AL INICIO de cada prompt. Garantiza coherencia de paleta y luz entre todas las imágenes.')], spacing: { after: 100 } }),
        ...gemini('ESTILO GLOBAL', ESTILO),
        divider(),

        // ── PERSONAJES ───────────────────────────────────────────────────────
        h1('Personajes', C.naranja),
        new Paragraph({ children: [run('Tres personajes. Solo el Director aparece en imágenes Gemini. Los otros dos aparecen en el screencast como nombres/avatares del MVP.')], spacing: { after: 120 } }),

        ...fichaPersonaje(
          'El Director',
          'Comprador · rol demo_admin en CareSignal',
          'Hombre, ~52 años. Traje oscuro sin corbata, camisa blanca. Expresión seria y cansada — lleva años administrando sin herramientas. Mexicano. Está en su oficina dentro de la residencia, mirando una pantalla. Es el que firma el contrato. Su dolor: ser el responsable legal cuando algo falla y no tener evidencia.',
          'Mexican man in his early 50s, dark blazer, white shirt, no tie, tired but professional expression, seated at a desk in a private care home office, looking at a computer screen with a soft blue dashboard glow on his face, warm desk lamp in the background'
        ),

        ...fichaPersonaje(
          'La Residente',
          'Adulta mayor · aparece en imagen del hook',
          'Mujer, ~82 años. Pijama claro. Habitación individual de residencia privada, noche. Sola junto a la ventana o en la cama. Ella no es una víctima — es una persona digna en una situación de vulnerabilidad. El cuaderno de registro en papel sobre la mesita es el símbolo del sistema roto.',
          'Mexican elderly woman in her early 80s, light cotton pajamas, sitting alone by a dim bedside lamp in a private care home room at night, a paper logbook open on the nightstand with some blank lines visible, intimate and quietly somber mood, no caregiver in sight'
        ),

        ...fichaPersonaje(
          'El Cuidador',
          'Usuario operativo · aparece solo en el screencast',
          'Aparece únicamente como nombre en el menú de asignación del dashboard de CareSignal. No necesita imagen Gemini. En el screencast se ve "Carlos M. — disponible" en la lista de asignación. El nombre debe coincidir con los datos ficticios del seed del MVP.',
          '(no se genera imagen Gemini para este personaje)'
        ),
        divider(),

        // ── ESCENARIOS ───────────────────────────────────────────────────────
        h1('Escenarios', C.gris),

        ...fichaEscenario(
          'Oficina del director',
          'Despacho moderno dentro de una residencia privada. Escritorio de madera oscura, pantalla de computadora con dashboard CareSignal visible. Lámpara de escritorio cálida. Cuadros o diplomas en la pared. Sin ventana exterior — el director está encerrado en su responsabilidad. Aparece en imágenes Gemini opcionales si se añade intro del director.',
          'private care home director\'s office at night, dark wood desk, computer screen with a soft blue dashboard glow, warm desk lamp, diplomas on the wall, no window, enclosed professional atmosphere, sense of administrative responsibility'
        ),

        ...fichaEscenario(
          'Habitación de la residente',
          'Cuarto individual de residencia privada. Cama con ropa de cama clara, mesita de noche con lámpara pequeña y cuaderno de registro en papel abierto. Ventana con persiana, noche. Atmósfera íntima, silenciosa. Este escenario aparece SOLO en la imagen del hook — nunca en el screencast.',
          'private elder-care room at night, single bed with light bedding, small nightstand with a dim lamp and an open paper logbook, window with closed blinds, quiet and intimate atmosphere, no medical equipment, warm ivory and soft shadow palette'
        ),

        ...fichaEscenario(
          'Pantalla CareSignal (dashboard)',
          'Este escenario es el screencast del MVP en localhost:5173. No usa Gemini. El dashboard debe mostrar: barra de alertas superior, lista de residentes con estados en color, columna de rondas programadas/vencidas. Reloj simulado visible en la esquina superior.',
          '(screencast — no se genera imagen Gemini)'
        ),
        divider(),

        // ── PROMPTS COMPLETOS ────────────────────────────────────────────────
        h1('Prompts Gemini completos — listos para copiar y pegar'),
        new Paragraph({ children: [run('Cada prompt ya incluye el estilo global integrado. Copia el bloque completo, pégalo directo en Gemini Imagen 3 (AI Studio o imagen.google.com).')], spacing: { after: 120 } }),

        // ── PROMPT 1: HOOK ────────────────────────────────────────────────────
        h2('Prompt 1 · Imagen del hook  (Escena 1 — 00:00 a 00:22)'),
        new Paragraph({ children: [run('Propósito: activar empatía en los primeros 5 segundos. El juez debe sentir el riesgo antes de que la narración lo nombre.')], spacing: { after: 80 } }),
        ...gemini('IMG-1 · HOOK',
          `${ESTILO}, Mexican elderly woman in her early 80s, light cotton pajamas, sitting alone by a dim bedside lamp in a private care home room at 3 AM, a paper logbook open on the nightstand with several blank lines visible, soft shadow on the empty doorway behind her suggesting no caregiver has come, intimate and quietly somber mood, no medical equipment, shot from slightly above to emphasize solitude`
        ),
        nota('Genera 3 variantes. Elige la que muestre mejor el cuaderno en papel Y la soledad — ambos elementos son clave.'),
        nota('Si el cuaderno no es legible, regénera. Las líneas en blanco son el símbolo del sistema roto.'),
        br(),

        // ── PROMPT 2: NÚMEROS ─────────────────────────────────────────────────
        h2('Prompt 2 · Imagen de números  (Escena 3 — 02:10 a 02:30)'),
        new Paragraph({ children: [run('Propósito: dar escala al mercado con una imagen que el editor pueda usar como fondo para texto animado.')], spacing: { after: 80 } }),
        ...gemini('IMG-2 · MERCADO',
          `${ESTILO}, aerial drone view of a mid-sized Mexican city at golden hour, several residential care buildings visible among modern urban blocks, warm amber and soft blue light, sense of scale and untapped opportunity, no people visible, clean geometric composition with open sky on the upper third for text overlay`
        ),
        nota('El tercio superior de la imagen debe quedar libre (cielo o fondo neutro) — el editor pondrá los números ahí.'),
        nota('Genera en horizontal 16:9. Rechaza si hay logos, señales de tránsito o texto legible en fachadas.'),
        br(),

        // ── PROMPT 3 OPCIONAL: DIRECTOR (si se añade intro) ───────────────────
        h2('Prompt 3 (opcional) · Director mirando el problema  —  para intro extendida'),
        new Paragraph({ children: [run('Solo si se decide añadir 10 segundos antes del hook mostrando al director. No obligatorio en la versión lean.')], spacing: { after: 80 } }),
        ...gemini('IMG-3 · DIRECTOR (opcional)',
          `${ESTILO}, Mexican man in his early 50s, dark blazer, white shirt no tie, seated at his desk in a private care home office at night, looking with concern at a computer screen that casts a soft blue glow on his face, a paper logbook and pen on the desk beside him, warm desk lamp, sense of administrative burden and late-night worry`
        ),
        nota('Este prompt es complementario. Úsalo solo si el video tiene más de 3:00 de presupuesto de tiempo.'),
        divider(),

        // ── ESCENA DEMO — TIMING FRAME A FRAME ───────────────────────────────
        h1('Escena demo · Timing segundo a segundo  (00:25 – 02:10)'),
        new Paragraph({ children: [run('Screencast del MVP. La columna verde es lo que se ve en pantalla. La columna azul es lo que se dice. Las filas rojas son los momentos de mayor impacto — no los cortes ni aceleres.')], spacing: { after: 120 } }),
        br(),

        // Encabezado de tabla de beats
        new Paragraph({ children: [bold('TIEMPO    PANTALLA (screencast)    VOZ EN OFF', 20, C.blanco)], shading: { type: ShadingType.CLEAR, fill: C.azul }, spacing: { after: 4 }, indent: { left: convertMillimetersToTwip(4) } }),

        // Beats
        beat('00:25', 'Fade desde negro. Dashboard completo aparece. Todos los residentes visibles. Reloj simulado: 02:55. Ronda de Habitación 3 en estado azul "Programada".', '"Este es el turno de noche."', false),
        beat('00:37', 'Cursor se mueve lentamente sobre la fila de Habitación 3. Zoom suave 1.1×. El nombre del residente y la hora de ronda son visibles.', '(silencio — deja que el juez lea)', false),
        beat('00:45', 'Clic en "▶ Avanzar reloj". Reloj salta de 02:55 a 03:07. Barra superior parpadea brevemente.', '"Pasan doce minutos."', false),
        beat('00:52 ⚡ WOW', 'La fila de Habitación 3 CAMBIA a rojo "VENCIDA". Un chip amarillo de ALERTA aparece en la columna de alertas. Sucede solo — sin que nadie lo haga.', '"CareSignal lo detecta solo — sin llamadas, sin cuadernos."', true),
        beat('01:05', 'Cursor se mueve a la alerta amarilla. Clic. Se abre modal con detalle: residente, tipo de ronda, hora de vencimiento, estado "Abierta".', '(silencio)', false),
        beat('01:13', 'Clic en botón "Reconocer". Estado del modal cambia a "Reconocida". Badge de alertas en barra superior baja de 1 a 0.', '"El supervisor la reconoce."', false),
        beat('01:21', 'Clic en "Asignar". Menú desplegable muestra lista de cuidadores: "Carlos M. — disponible". Clic en Carlos M. Confirmación verde aparece.', '"La asigna al cuidador en turno."', false),
        beat('01:30', 'Clic en pestaña "Bitácora". Vista de auditoría con 4 filas generadas automáticamente. Cada fila: actor + timestamp + acción.', '(silencio — el juez lee)', false),
        beat('01:38 ⚡ WOW', 'Zoom-in suave sobre la primera fila: "Sistema · 03:07 · Ronda vencida detectada · Habitación 3". Cursor quieto. Pausa 3 segundos.', '"Generado automáticamente. Sin papel. Sin transcripción."', true),
        beat('01:48', 'Scroll lento por las 4 filas restantes. Actor distinto en cada una: Sistema → Supervisor → Supervisor → Cuidador.', '"Quién. Cuándo. Qué. Inmutable."', false),
        beat('01:58', 'Zoom-out al dashboard completo. La fila de Habitación 3 ahora muestra estado "En verificación" — el ciclo sigue.', '(silencio)', false),
        beat('02:05', 'Fade lento a negro. Última imagen: el dashboard quieto, todo bajo control.', '"Eso es lo que la NOM-031 exige.", pausa 1 s, "Listo para cualquier inspección."', false),

        br(),
        nota('Duración total de la escena demo: 1:45. Dentro del presupuesto de 1:30 + 15 s de cierre.'),
        nota('WOW moments (rojo): NO cortes, NO zoom-out, NO música — silencio o voz mínima. El color rojo y el chip de alerta hacen el trabajo.'),
        nota('Música de fondo en toda la escena: -20 dBFS o apagada. La alerta sonando en pantalla (si el MVP tiene sonido) reemplaza la música.'),
        divider(),

        // ── NARRACIÓN COMPLETA ────────────────────────────────────────────────
        h1('Narración completa — guion de voz en off'),
        nota('Graba en una sola sesión. Tono: informado, calmado, sin urgencia artificial. No es un comercial — es evidencia.', C.azul),
        br(),

        h3('Escena 1 · Hook  (00:00 – 00:25)'),
        voz([
          '(silencio 4 s mientras aparece la imagen)',
          '',
          '"¿Tienes evidencia de que alguien fue a verla anoche?"',
          '',
          '(pausa 2 s  —  corte a negro  —  comienza el demo)',
        ]),
        br(),

        h3('Escena 2 · Demo  (00:25 – 02:20)'),
        new Paragraph({ children: [run('La narración va intercalada con los beats — ver tabla anterior. Resumen lineal:')], spacing: { after: 80 } }),
        voz([
          '"Este es el turno de noche."',
          '… (silencio mientras el juez lee el dashboard) …',
          '"Pasan doce minutos."',
          '"CareSignal lo detecta solo — sin llamadas, sin cuadernos."',
          '… (silencio en el modal) …',
          '"El supervisor la reconoce."',
          '"La asigna al cuidador en turno."',
          '… (silencio en la bitácora) …',
          '"Generado automáticamente. Sin papel. Sin transcripción."',
          '"Quién. Cuándo. Qué. Inmutable."',
          '… (silencio — dashboard quieto) …',
          '"Eso es lo que la NOM-031 exige."',
          '(pausa 1 s)',
          '"Listo para cualquier inspección."',
        ]),
        br(),

        h3('Escena 3 · Números  (02:20 – 02:40)'),
        voz([
          '"Más de 1,300 residencias en México. Dos millones de familias.',
          'Plan Profesional: 3,990 pesos al mes. Margen bruto del 80 %."',
        ]),
        br(),

        h3('Escena 4 · Cierre  (02:40 – 02:50)  — founder en cámara, sin off'),
        pantalla([
          '→ Roberto García frente a cámara, directo al lente',
          '→ Fondo: pared neutra o banner CareSignal',
          '→ Luz frontal. Sin efectos. Sin música.',
          '→ Texto inferior: "Roberto García · robertogarciaits@gmail.com · 844 588 1313"',
        ]),
        voz([
          '"Buscamos dos o tres residencias piloto para Q1 2027.',
          'Soy Roberto García — esto es CareSignal."',
        ]),
        divider(),

        // ── CHECKLIST FINAL ───────────────────────────────────────────────────
        h1('Checklist de producción', C.gris),
        new Paragraph({ children: [bold('Antes de grabar el screencast:',22,C.azul)], spacing:{after:60} }),
        new Paragraph({ children: [run('□  App corriendo en localhost:5173')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Reloj simulado en 02:55 — ronda de Habitación 3 programada para 03:00')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Cuidador "Carlos M." visible y en estado "disponible" en el seed')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Pestaña Bitácora vacía (estado inicial limpio)')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  OBS Studio: 1920×1080, 30 fps, cursor visible al 150%')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Sin otras ventanas o notificaciones en pantalla')], spacing:{after:80} }),
        new Paragraph({ children: [bold('Imágenes Gemini:',22,C.azul)], spacing:{after:60} }),
        new Paragraph({ children: [run('□  IMG-1 (Hook): cuaderno con líneas en blanco + soledad visible')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  IMG-2 (Mercado): tercio superior libre para texto animado')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Ambas en 1920×1080 PNG, sin texto legible en la imagen')], spacing:{after:80} }),
        new Paragraph({ children: [bold('Video final:',22,C.azul)], spacing:{after:60} }),
        new Paragraph({ children: [run('□  Duración ≤ 3:00')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  MP4 H.264, ≥ 8 Mbps, < 500 MB')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Subtítulos SRT incluidos')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Disclaimer visible en créditos: "MVP operacional, no dispositivo médico · Datos ficticios"')], spacing:{after:80} }),
        br(),
        new Paragraph({
          children: [new TextRun({ text: 'MVP operacional, no dispositivo médico  ·  Datos ficticios  ·  Roberto García  ·  CareSignal 2026', italics: true, size: 18, color: C.gris, font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
        }),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const out = path.join(__dirname, '..', 'business', 'CareSignal_Video_Guion_Gemini.docx');
  fs.writeFileSync(out, buf);
  console.log(`OK — ${out} (${Math.round(buf.length / 1024)} KB)`);
}

main().catch(e => { console.error('ERROR', e); process.exit(1); });
