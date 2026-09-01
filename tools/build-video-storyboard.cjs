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
  rojo:     '7B241C', rojoCl:   'FADBD8',
  amarillo: '7D6608', amarilloCl:'FEF9E7',
  gris:     '424242', grisCl:   'F2F3F4',
  negro2:   '1C1C1C', blanco:   'FFFFFF', negro: '000000',
};

const run  = (t, o = {}) => new TextRun({ text: t, font: 'Calibri', size: 21, color: C.negro, ...o });
const bold = (t, s = 21, c = C.negro) => run(t, { bold: true, size: s, color: c });
const br   = () => new Paragraph({ children: [] });

const h1 = (t, fill = C.azul) => new Paragraph({
  children: [new TextRun({ text: t, bold: true, size: 28, color: C.blanco, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill },
  spacing: { before: 320, after: 160 },
});

const h2 = (t, fill = C.azulCl, color = C.azul) => new Paragraph({
  children: [new TextRun({ text: t, bold: true, size: 23, color, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill },
  spacing: { before: 180, after: 90 },
});

const divider = (color = C.azulCl) => new Paragraph({
  border: { bottom: { color, size: 6, style: BorderStyle.SINGLE } },
  spacing: { after: 220 },
});

const flag = (t) => new Paragraph({
  children: [new TextRun({ text: `⚠ FLAG  ·  ${t}`, bold: true, size: 19, color: C.rojo, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill: C.rojoCl },
  indent: { left: convertMillimetersToTwip(6) },
  spacing: { before: 60, after: 80 },
});

const nota = (t, c = C.naranja) => new Paragraph({
  children: [new TextRun({ text: `⚙ ${t}`, italics: true, size: 19, color: c, font: 'Calibri' })],
  spacing: { after: 60 },
});

// Bloque Veo — morado
const veoBlock = (label, prompt) => [
  new Paragraph({
    children: [new TextRun({ text: `▶ VEO 3 FLOW  ·  ${label}`, bold: true, size: 19, color: C.blanco, font: 'Calibri' })],
    shading: { type: ShadingType.CLEAR, fill: C.morado },
    indent: { left: convertMillimetersToTwip(4) },
    spacing: { before: 80, after: 0 },
  }),
  new Paragraph({
    children: [new TextRun({ text: prompt, size: 18, color: C.negro, font: 'Courier New' })],
    shading: { type: ShadingType.CLEAR, fill: C.moradoCl },
    border: { left: { color: C.morado, size: 14, style: BorderStyle.SINGLE } },
    indent: { left: convertMillimetersToTwip(6) },
    spacing: { before: 0, after: 100, line: 320 },
  }),
];

// Bloque transición
const transicion = (tipo, detalle) => new Paragraph({
  children: [
    new TextRun({ text: `↔ TRANSICIÓN [${tipo}]  `, bold: true, size: 19, color: C.amarillo, font: 'Calibri' }),
    new TextRun({ text: detalle, size: 19, color: C.negro, font: 'Calibri' }),
  ],
  shading: { type: ShadingType.CLEAR, fill: C.amarilloCl },
  indent: { left: convertMillimetersToTwip(4) },
  spacing: { before: 60, after: 80 },
});

// Voz en off — azul
const voz = (t) => new Paragraph({
  children: [
    new TextRun({ text: '🎙 VOZ  ', bold: true, size: 18, color: C.azul, font: 'Calibri' }),
    new TextRun({ text: t, size: 19, color: C.negro, font: 'Calibri', italics: true }),
  ],
  shading: { type: ShadingType.CLEAR, fill: C.azulCl },
  indent: { left: convertMillimetersToTwip(4) },
  spacing: { before: 60, after: 80 },
});

// Screencast — verde
const screencast = (t) => new Paragraph({
  children: [
    new TextRun({ text: '🖥 SCREENCAST  ', bold: true, size: 18, color: C.verde, font: 'Calibri' }),
    new TextRun({ text: t, size: 19, color: C.negro, font: 'Calibri', bold: true }),
  ],
  shading: { type: ShadingType.CLEAR, fill: C.verdeCl },
  indent: { left: convertMillimetersToTwip(4) },
  spacing: { before: 60, after: 80 },
});

// Pie de clip — último cuadro
const ultimoCuadro = (t) => new Paragraph({
  children: [
    new TextRun({ text: '⬛ ÚLTIMO CUADRO  ', bold: true, size: 17, color: C.gris, font: 'Calibri' }),
    new TextRun({ text: t, size: 17, color: C.gris, font: 'Calibri', italics: true }),
  ],
  indent: { left: convertMillimetersToTwip(4) },
  spacing: { before: 0, after: 60 },
});

// Cabecera de clip
const clipHeader = (num, tc, dur, tipo, flag_) => {
  const fillMap = {
    'VEO':        C.morado,
    'SCREENCAST': C.verde,
    'CÁMARA':     C.azul,
    'GRÁFICOS':   C.gris,
    'NEGRO':      C.negro2,
    'FLAGGED':    C.rojo,
  };
  const fill = fillMap[flag_ ? 'FLAGGED' : tipo] || C.gris;
  return new Paragraph({
    children: [
      new TextRun({ text: `  CLIP ${num}  `, bold: true, size: 24, color: C.blanco, font: 'Calibri' }),
      new TextRun({ text: `  ${tc}  `, size: 22, color: C.blanco, font: 'Calibri' }),
      new TextRun({ text: `  ${dur}  `, bold: true, size: 22, color: C.blanco, font: 'Calibri' }),
      new TextRun({ text: `  ${tipo}${flag_ ? '  ⚠ ATENCIÓN' : ''}  `, size: 20, color: C.blanco, font: 'Calibri', italics: !!flag_ }),
    ],
    shading: { type: ShadingType.CLEAR, fill },
    spacing: { before: 280, after: 100 },
    indent: { left: convertMillimetersToTwip(2) },
  });
};

// ── ANCHORS (se copian a Flow una sola vez) ─────────────────────────────────
const CHAR_A = `Mexican elderly woman in her early 80s, silver hair loosely gathered, light blue cotton pajamas, seated in a private care home room at night — USE THIS EXACT DESCRIPTION IN EVERY CLIP WHERE SHE APPEARS`;

const SCENE_ROOM = `private elder-care room, nighttime, warm amber bedside lamp (#8B6914 tone), ivory-painted walls, single bed with cream bedding, wooden nightstand, closed blinds on window — NO MEDICAL EQUIPMENT`;

const SCENE_AERIAL = `aerial drone view of a mid-size Mexican city, golden hour, warm amber and steel-blue light, care home buildings among modern urban blocks, upper third of frame is open sky — NO PEOPLE VISIBLE`;

// ── ESTILO GLOBAL ────────────────────────────────────────────────────────────
const ESTILO_VEO = `photorealistic, cinematic, editorial look, soft pastel palette (warm ivory background, muted steel-blue #5B8DB8 accents), shallow depth of field, no text overlays, no logos, 16:9 1920x1080, 24fps, professional Mexican elder-care setting`;

async function main() {
  const doc = new Document({
    creator: 'Roberto García',
    title: 'CareSignal — Storyboard Veo 3 / Google Flow',
    styles: { default: { document: { run: { font: 'Calibri', size: 21, color: C.negro } } } },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(18), bottom: convertMillimetersToTwip(18),
            left: convertMillimetersToTwip(20), right: convertMillimetersToTwip(20),
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
          children: [new TextRun({ text: 'Storyboard Veo 3 · Google Flow', bold: true, size: 34, color: C.gris, font: 'Calibri' })],
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Clips de 10 s · Prompts listos para Flow · Transiciones · Flags de atención', size: 22, color: C.gris, font: 'Calibri', italics: true })],
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Roberto García  ·  robertogarciaits@gmail.com  ·  844 588 1313', size: 19, color: C.gris, font: 'Calibri', italics: true })],
          alignment: AlignmentType.CENTER, spacing: { after: 360 },
        }),

        // ── LEYENDA ──────────────────────────────────────────────────────────
        new Paragraph({ children: [bold('Leyenda de bloques', 24, C.azul)], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: '  ▶ VEO 3 FLOW  ', bold: true, size: 19, color: C.blanco, font: 'Calibri' })], shading: { type: ShadingType.CLEAR, fill: C.morado }, spacing: { after: 40 } }),
        new Paragraph({ children: [run('  → Prompt listo para pegar en Google Flow. Incluye movimiento de cámara y audio Veo 3 nativo.')] , spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: '  🖥 SCREENCAST  ', bold: true, size: 19, color: C.blanco, font: 'Calibri' })], shading: { type: ShadingType.CLEAR, fill: C.verde }, spacing: { after: 40 } }),
        new Paragraph({ children: [run('  → Grabación del MVP (OBS Studio). No se genera con Veo.')] , spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: '  ↔ TRANSICIÓN [TIPO]  ', bold: true, size: 19, color: C.amarillo, font: 'Calibri' })], shading: { type: ShadingType.CLEAR, fill: C.amarilloCl }, spacing: { after: 40 } }),
        new Paragraph({ children: [run('  → Indica cómo conectar dos clips. CLEAN = baja complejidad de edición. RIESGO = requiere atención.')] , spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: '  ⚠ FLAG  ', bold: true, size: 19, color: C.rojo, font: 'Calibri' })], shading: { type: ShadingType.CLEAR, fill: C.rojoCl }, spacing: { after: 40 } }),
        new Paragraph({ children: [run('  → Situación donde el límite de 10 s es un problema. Se indica la alternativa recomendada.')] , spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: '  ⬛ ÚLTIMO CUADRO  ', bold: true, size: 17, color: C.gris, font: 'Calibri' })], spacing: { after: 40 } }),
        new Paragraph({ children: [run('  → Descripción del último fotograma visible del clip — debe coincidir visualmente con el primer fotograma del siguiente.')] , spacing: { after: 80 } }),
        divider(),

        // ── ANCHORS FLOW ─────────────────────────────────────────────────────
        h1('Anchors de Flow — configurar UNA VEZ antes de generar clips'),
        new Paragraph({ children: [run('En Google Flow, crea los siguientes cards antes de generar cualquier clip. Copia el texto exacto en cada campo.')], spacing: { after: 100 } }),
        br(),

        new Paragraph({ children: [bold('CHARACTER CARD — La Residente', 22, C.morado)], spacing: { after: 60 } }),
        ...veoBlock('CHARACTER — copiar en el campo "Character" de Flow', CHAR_A),
        nota('Este anchor garantiza que el rostro, ropa y postura de la residente sean consistentes entre clips. No cambies ninguna palabra.'),
        br(),

        new Paragraph({ children: [bold('SCENE CARD 1 — Habitación de noche', 22, C.morado)], spacing: { after: 60 } }),
        ...veoBlock('SCENE 1 — copiar en el campo "Scene" de Flow', SCENE_ROOM),
        br(),

        new Paragraph({ children: [bold('SCENE CARD 2 — Ciudad aérea', 22, C.morado)], spacing: { after: 60 } }),
        ...veoBlock('SCENE 2 — copiar en el campo "Scene" de Flow', SCENE_AERIAL),
        nota('Cambia de SCENE 1 a SCENE 2 antes de generar los clips 04 y 05.'),
        br(),

        new Paragraph({ children: [bold('ESTILO GLOBAL (pegar al inicio de cada prompt si Flow no lo aplica automáticamente):', 21, C.azul)], spacing: { after: 60 } }),
        ...veoBlock('ESTILO GLOBAL', ESTILO_VEO),
        divider(),

        // ── MAPA DE CLIPS ────────────────────────────────────────────────────
        h1('Mapa de clips — visión completa'),
        new Table({
          rows: [
            new TableRow({
              children: ['Clip','Tiempo','Dur.','Tipo','Transición de salida'].map(h => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: C.blanco, font: 'Calibri' })], spacing:{before:50,after:50} })],
                shading: { type: ShadingType.CLEAR, fill: C.azul },
                margins: { left: 80, right: 80 },
              })),
            }),
            ...([
              ['01','00:00–00:10','10 s','VEO','Corte directo → Clip 02 (mismo escenario)'],
              ['02','00:10–00:20','10 s','VEO','Corte directo → Clip 03 (zoom-in continuo)'],
              ['03','00:20–00:25','5 s ⚠','VEO','Fade a negro → pausa voz → screencast'],
              ['—','00:25–00:25','(negro)','NEGRO','Voz en off sobre negro: la pregunta del hook'],
              ['04–14','00:28–02:10','1:42','SCREENCAST','Fade a negro → Clip 15'],
              ['15','02:10–02:20','10 s','VEO','Corte directo → Clip 16 (continuidad aérea)'],
              ['16','02:20–02:30','10 s','VEO','Fade a negro → founder'],
              ['17','02:30–02:40','10 s','CÁMARA','Fade a negro → créditos'],
              ['18','02:40–02:50','10 s','GRÁFICOS','Fade a negro'],
            ]).map(([cl,tc,dur,tipo,trans], ri) => new TableRow({
              children: [cl,tc,dur,tipo,trans].map(c => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: c, size: 17, color: C.negro, font: 'Calibri' })], spacing:{before:50,after:50} })],
                shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? C.blanco : C.azulCl },
                margins: { left: 80, right: 80 },
              })),
            })),
          ],
          width: { size: 9000, type: WidthType.DXA },
        }),
        divider(),

        // ══════════════════════════════════════════════════════════════════════
        // CLIP 01
        // ══════════════════════════════════════════════════════════════════════
        clipHeader('01', '00:00 – 00:10', '10 s', 'VEO', false),
        new Paragraph({ children: [bold('Objetivo: establecer el escenario. El juez entra al mundo antes de que hable nadie.', 21, C.gris)], spacing: { after: 80 } }),
        ...veoBlock('CLIP 01 · Wide establishing — habitación de noche',
          `${ESTILO_VEO}. A wide static shot opens on a dimly lit private elder-care room at 3 AM. Mexican elderly woman in her early 80s, silver hair loosely gathered, light blue cotton pajamas, seated in an armchair by the window, her back slightly toward camera, gazing at nothing. Warm amber bedside lamp casts soft shadows. Open paper logbook on the wooden nightstand, several lines blank and unsigned. Camera holds completely still. Audio: faint clock ticking somewhere down the hall, very soft building hum, absolute silence otherwise. No caregiver appears. 10 seconds.`
        ),
        voz('(silencio — sin narración en este clip)'),
        ultimoCuadro('Mujer en sillón, cuaderno visible en mesita, luz ámbar, sin cuidador.'),
        transicion('CORTE DIRECTO', 'Mismo escenario y luz — la cámara empieza a moverse en clip 02. CLEAN.'),

        // ══════════════════════════════════════════════════════════════════════
        // CLIP 02
        // ══════════════════════════════════════════════════════════════════════
        clipHeader('02', '00:10 – 00:20', '10 s', 'VEO', false),
        new Paragraph({ children: [bold('Objetivo: el cuaderno vacío = el sistema roto. Sin palabras.', 21, C.gris)], spacing: { after: 80 } }),
        ...veoBlock('CLIP 02 · Dolly-in al cuaderno — movimiento continuo',
          `${ESTILO_VEO}. Continuous shot in the same private elder-care room, 3 AM. The camera begins a slow, smooth dolly-in from behind the nightstand, moving steadily forward toward the open paper logbook. Mexican elderly woman in her early 80s, silver hair loosely gathered, light blue cotton pajamas, remains softly out of focus in the left background. The logbook center-frame comes into sharp focus: a date at the top, several lines below blank and unsigned. Camera eases to a gentle stop in a close-up of the blank lines. Same ambient audio from clip 01 — clock ticking, building hum. No voices. 10 seconds.`
        ),
        voz('(silencio — la imagen hace el trabajo)'),
        ultimoCuadro('Close-up del cuaderno, líneas en blanco en foco, mujer desenfocada al fondo izquierdo.'),
        transicion('CORTE DIRECTO', 'Clip 03 es zoom-in extremo del mismo cuaderno — continuidad de foco y luz. CLEAN si el ángulo coincide.'),

        // ══════════════════════════════════════════════════════════════════════
        // CLIP 03 — FLAG
        // ══════════════════════════════════════════════════════════════════════
        clipHeader('03', '00:20 – 00:25', '5 s', 'VEO', true),
        flag('Solo 5 segundos — Veo 3 mínimo recomendado es 5 s. Alternativa: extender Clip 02 a 15 s y eliminar este clip.'),
        new Paragraph({ children: [bold('Objetivo: el hook visual máximo — el renglón en blanco como símbolo del fallo.', 21, C.gris)], spacing: { after: 80 } }),
        ...veoBlock('CLIP 03 · Extreme close-up — línea en blanco (5 s)',
          `${ESTILO_VEO}. Extreme close-up of a paper logbook page, a single blank unsigned line fills most of the frame. Warm amber light from the left. A pen lies unused beside the page. Camera completely static. Very faint clock ticking. 5 seconds. End on this still frame.`
        ),
        voz('(silencio — voz arranca en el negro posterior)'),
        ultimoCuadro('Renglón en blanco en primer plano, pluma al lado, luz ámbar.'),
        transicion('FADE A NEGRO · 1 s', 'Negro completo → voz en off sobre pantalla negra → fade-in del screencast. CLEAN.'),
        nota('ALTERNATIVA RECOMENDADA: si Veo produce artefactos en 5 s, elimina este clip. Extiende Clip 02 a 15 s con el mismo prompt añadiendo "camera eases into an extreme close-up of a single blank line, hold for 5 seconds." Total hook = 15 s + 10 s negro/voz.', C.rojo),

        // ══════════════════════════════════════════════════════════════════════
        // NEGRO + VOZ (00:25 – 00:28)
        // ══════════════════════════════════════════════════════════════════════
        clipHeader('—', '00:25 – 00:28', '3 s', 'NEGRO', false),
        new Paragraph({ children: [bold('Pantalla negra. Solo la voz. Silencio visual máximo.', 21, C.gris)], spacing: { after: 80 } }),
        voz('"¿Tienes evidencia de que alguien fue a verla anoche?"'),
        nota('Pausa de 0.5 s después de la pregunta, luego fade-in del screencast. La pregunta se queda resonando.', C.azul),
        transicion('FADE-IN · 1 s', 'Negro → screencast MVP aparece. CLEAN.'),

        // ══════════════════════════════════════════════════════════════════════
        // CLIPS 04–14 — SCREENCAST
        // ══════════════════════════════════════════════════════════════════════
        clipHeader('04–14', '00:28 – 02:10', '1 min 42 s', 'SCREENCAST', false),
        new Paragraph({ children: [bold('Demo en vivo del MVP — no se genera con Veo. Ver documento de guion para el timing beat a beat.', 21, C.gris)], spacing: { after: 80 } }),
        screencast('Dashboard → reloj avanza → ronda VENCIDA (WOW) → alerta → reconocer → asignar → bitácora inmutable (WOW) → cierre'),
        new Paragraph({ children: [
          bold('Segmentos de 10 s dentro del screencast (referencia para el editor):', 21, C.azul),
        ], spacing: { after: 60 } }),
        new Table({
          rows: [
            new TableRow({ children: ['Segmento','Tiempo','Acción en pantalla','Narración'].map(h => new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 17, color: C.blanco, font: 'Calibri' })], spacing:{before:40,after:40} })],
              shading: { type: ShadingType.CLEAR, fill: C.verde },
              margins: { left: 80, right: 80 },
            })) }),
            ...[
              ['SC-01','00:28–00:38','Dashboard completo. Reloj 02:55. Habitación 3 en azul "Programada".','(silencio)'],
              ['SC-02','00:38–00:48','Cursor lento sobre fila Hab.3. Zoom suave 1.1×.','(silencio — el juez lee)'],
              ['SC-03','00:48–00:58','Clic "▶ Avanzar reloj". Reloj salta a 03:07.', '"Pasan doce minutos."'],
              ['SC-04 ⚡','00:58–01:08','Fila CAMBIA a rojo "VENCIDA". Chip amarillo aparece SOLO.', '"CareSignal lo detecta solo."'],
              ['SC-05','01:08–01:18','Clic en alerta → modal detalle: residente, hora, estado "Abierta".','(silencio)'],
              ['SC-06','01:18–01:28','Clic "Reconocer" → estado cambia a "Reconocida". Badge baja a 0.','"El supervisor la reconoce."'],
              ['SC-07','01:28–01:38','Clic "Asignar" → menú de cuidadores → Carlos M. → confirmar.','"La asigna al cuidador en turno."'],
              ['SC-08','01:38–01:48','Pestaña "Bitácora". 4 filas auto-generadas. Scroll lento.','(silencio — el juez lee)'],
              ['SC-09 ⚡','01:48–01:58','Zoom-in fila: "Sistema · 03:07 · Ronda vencida · Hab.3". Cursor quieto.','"Quién. Cuándo. Qué. Inmutable."'],
              ['SC-10','01:58–02:08','Dashboard completo quieto. Estado "En verificación". Todo bajo control.','(silencio)'],
              ['SC-11','02:08–02:10','Fade lento a negro. 2 s.','"Eso es lo que la NOM-031 exige. Listo para cualquier inspección."'],
            ].map(([seg,tc,acc,nar], ri) => new TableRow({
              children: [seg,tc,acc,nar].map(c => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: c, size: 16, color: C.negro, font: 'Calibri', bold: c.includes('⚡') })], spacing:{before:40,after:40} })],
                shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? C.blanco : C.verdeCl },
                margins: { left: 70, right: 70 },
              })),
            })),
          ],
          width: { size: 9000, type: WidthType.DXA },
        }),
        br(),
        nota('Los ⚡ son los WOW moments — NO cortes, NO zoom-out, NO música. Pausa visual mínima 2 s.'),
        transicion('FADE A NEGRO · 1.5 s', 'Screencast → negro → Clip 15 aéreo. CLEAN. El negro separa el demo del mercado.'),

        // ══════════════════════════════════════════════════════════════════════
        // CLIP 15
        // ══════════════════════════════════════════════════════════════════════
        clipHeader('15', '02:10 – 02:20', '10 s', 'VEO', false),
        new Paragraph({ children: [bold('Objetivo: escala visual. De la pantalla al mercado real.', 21, C.gris)], spacing: { after: 80 } }),
        nota('Cambia a SCENE CARD 2 (Ciudad aérea) en Flow antes de generar este clip.', C.morado),
        ...veoBlock('CLIP 15 · Aerial establish — ciudad mexicana golden hour',
          `${ESTILO_VEO}. Aerial drone shot looking straight down at a mid-size Mexican city, golden hour light, warm amber and muted steel-blue tones. Several mid-rise residential care buildings visible among modern urban blocks. Camera begins a very slow clockwise rotation while maintaining altitude. Upper third of the frame is open sky — clear pale amber-blue. No people visible, no text, no logos. Audio: very distant city hum, low ambient wind. 10 seconds.`
        ),
        voz('"Más de 1,300 residencias en México. Dos millones de familias."'),
        ultimoCuadro('Ciudad desde arriba, ligeramente rotada en sentido horario, cielo en tercio superior.'),
        transicion('CORTE DIRECTO', 'Clip 16 continúa la misma rotación aérea — movimiento ininterrumpido. RIESGO: si Veo genera diferente ángulo de luz entre clips, usar DISSOLVE 0.5 s en lugar de corte directo.'),

        // ══════════════════════════════════════════════════════════════════════
        // CLIP 16
        // ══════════════════════════════════════════════════════════════════════
        clipHeader('16', '02:20 – 02:30', '10 s', 'VEO', false),
        new Paragraph({ children: [bold('Objetivo: misma vista aérea con texto animado superpuesto en post-producción.', 21, C.gris)], spacing: { after: 80 } }),
        flag('El texto de los 3 números NO lo genera Veo — se añade en el editor (CapCut/DaVinci) sobre este clip.'),
        ...veoBlock('CLIP 16 · Aerial continue — mismo movimiento, altitude ligeramente mayor',
          `${ESTILO_VEO}. Continuous aerial shot of the same mid-size Mexican city, golden hour, identical warm amber and steel-blue light as the previous clip. Camera is now slightly higher altitude, the slow clockwise rotation continues seamlessly. More of the city and horizon visible. Upper third remains open sky. Audio: same distant city hum, fading slightly. 10 seconds.`
        ),
        voz('"Plan Profesional: 3,990 pesos al mes. Margen bruto del 80 %."'),
        new Paragraph({ children: [bold('Texto animado en post (editor añade sobre el clip):', 21, C.azul)], spacing: { after: 60 } }),
        new Paragraph({ children: [new TextRun({ text: '+1,300', bold: true, size: 40, color: C.azul, font: 'Calibri' }), new TextRun({ text: '  residencias privadas en México  ·  aparece a 02:10', size: 20, color: C.gris, font: 'Calibri' })] , spacing: { after: 40 } }),
        new Paragraph({ children: [new TextRun({ text: '~2M', bold: true, size: 40, color: C.azul, font: 'Calibri' }), new TextRun({ text: '  familias coordinando cuidado  ·  aparece a 02:17', size: 20, color: C.gris, font: 'Calibri' })] , spacing: { after: 40 } }),
        new Paragraph({ children: [new TextRun({ text: '$3,990', bold: true, size: 40, color: C.verde, font: 'Calibri' }), new TextRun({ text: '  MXN/mes · 80 % margen bruto  ·  aparece a 02:24', size: 20, color: C.gris, font: 'Calibri' })] , spacing: { after: 80 } }),
        ultimoCuadro('Ciudad aérea más amplia, rotación continua, texto "$3,990" visible en pantalla.'),
        transicion('FADE A NEGRO · 1 s', 'Negro → founder en cámara. El cambio de escala (aéreo → primer plano humano) necesita el negro. CLEAN.'),

        // ══════════════════════════════════════════════════════════════════════
        // CLIP 17
        // ══════════════════════════════════════════════════════════════════════
        clipHeader('17', '02:30 – 02:40', '10 s', 'CÁMARA REAL', false),
        new Paragraph({ children: [bold('Roberto García en cámara. Sin Veo. Directo al lente.', 21, C.gris)], spacing: { after: 80 } }),
        screencast('Grabar con cámara/webcam HD. Fondo neutro o banner CareSignal. Luz frontal. Sin efectos.\nTexto inferior: "Roberto García  ·  robertogarciaits@gmail.com  ·  844 588 1313"'),
        voz('"Buscamos dos o tres residencias piloto para Q1 2027. Soy Roberto García — esto es CareSignal."'),
        ultimoCuadro('Roberto mirando al lente, texto de contacto visible, sin hablar ya.'),
        transicion('FADE A NEGRO · 0.5 s', 'Negro → créditos. CLEAN.'),

        // ══════════════════════════════════════════════════════════════════════
        // CLIP 18
        // ══════════════════════════════════════════════════════════════════════
        clipHeader('18', '02:40 – 02:50', '10 s', 'GRÁFICOS', false),
        new Paragraph({ children: [bold('Motion graphics. Logo + datos + disclaimer.', 21, C.gris)], spacing: { after: 80 } }),
        screencast('Fondo: azul oscuro #1A5276\nTexto centrado: CareSignal (logo / wordmark)\nLínea 1: Roberto García  ·  robertogarciaits@gmail.com  ·  linkedin.com/in/robertogarciaits  ·  844 588 1313\nLínea 2 (pequeña): MVP operacional, no dispositivo médico  ·  Datos ficticios  ·  WomenCISO 4 / MenCISO 1 · 2026\nFade-out a negro en segundo 8.'),
        transicion('FADE A NEGRO · 2 s', 'Cierre. Video termina en negro completo.'),
        divider(),

        // ── RESUMEN DE TRANSICIONES ──────────────────────────────────────────
        h1('Resumen de transiciones — tabla de referencia del editor'),
        new Table({
          rows: [
            new TableRow({ children: ['Entre clips','Tipo','Duración','Complejidad'].map(h => new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 17, color: C.blanco, font: 'Calibri' })], spacing:{before:40,after:40} })],
              shading: { type: ShadingType.CLEAR, fill: C.azul },
              margins: { left: 80, right: 80 },
            })) }),
            ...([
              ['Negro → Clip 01',           'Fade-in',          '1 s',    '✅ CLEAN'],
              ['Clip 01 → Clip 02',          'Corte directo',    '0 s',    '✅ CLEAN — mismo escenario y luz'],
              ['Clip 02 → Clip 03',          'Corte directo',    '0 s',    '⚠ RIESGO — zoom debe coincidir; si no, usar dissolve 0.5 s'],
              ['Clip 03 → Negro',            'Fade-out',         '1 s',    '✅ CLEAN'],
              ['Negro → Screencast',         'Fade-in',          '1 s',    '✅ CLEAN'],
              ['Screencast → Negro',         'Fade-out',         '1.5 s',  '✅ CLEAN'],
              ['Negro → Clip 15 aéreo',      'Fade-in',          '1 s',    '✅ CLEAN'],
              ['Clip 15 → Clip 16',          'Corte directo',    '0 s',    '⚠ RIESGO — generar ambos con mismo seed en Flow; si hay drift de luz, usar dissolve 0.5 s'],
              ['Clip 16 → Negro',            'Fade-out',         '1 s',    '✅ CLEAN'],
              ['Negro → Founder',            'Fade-in',          '0.5 s',  '✅ CLEAN'],
              ['Founder → Negro',            'Fade-out',         '0.5 s',  '✅ CLEAN'],
              ['Negro → Créditos',           'Fade-in',          '0.5 s',  '✅ CLEAN'],
              ['Créditos → Negro final',     'Fade-out',         '2 s',    '✅ CLEAN'],
            ]).map(([entre,tipo,dur,comp], ri) => new TableRow({
              children: [entre,tipo,dur,comp].map(c => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: c, size: 16,
                  color: c.includes('RIESGO') ? C.rojo : C.negro,
                  bold: c.includes('⚠'), font: 'Calibri' })], spacing:{before:40,after:40} })],
                shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? C.blanco : C.azulCl },
                margins: { left: 80, right: 80 },
              })),
            })),
          ],
          width: { size: 9000, type: WidthType.DXA },
        }),
        br(),
        nota('RIESGO de drift de color entre clips Veo contiguos: generarlos en la misma sesión de Flow, con el mismo seed si la herramienta lo permite. Si el color difiere >10 % en luminancia, reemplaza el corte directo por dissolve 0.5 s.', C.rojo),
        divider(),

        // ── CHECKLIST FINAL ──────────────────────────────────────────────────
        h1('Checklist de producción Veo / Flow', C.gris),
        new Paragraph({ children: [bold('En Google Flow, antes de generar:',21,C.azul)], spacing:{after:60} }),
        new Paragraph({ children: [run('□  Character card "La Residente" creado y guardado')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Scene card "Habitación de noche" creado')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Scene card "Ciudad aérea" creado')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Clips 01, 02, 03 generados con SCENE 1 activa')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Clips 15, 16 generados con SCENE 2 activa — misma sesión, mismo seed')], spacing:{after:80} }),
        new Paragraph({ children: [bold('Al ensamblar en el editor:',21,C.azul)], spacing:{after:60} }),
        new Paragraph({ children: [run('□  Revisar Clip 01→02 y Clip 02→03: corte directo sin salto de luz')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Revisar Clip 15→16: si hay drift de color, cambiar a dissolve 0.5 s')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Texto animado añadido sobre Clips 15–16 (no generado por Veo)')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Subtítulos SRT exportados y sincronizados')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Duración total ≤ 3:00')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  Disclaimer visible en Clip 18 (créditos)')], spacing:{after:40} }),
        new Paragraph({ children: [run('□  MP4 H.264, 1920×1080, ≥ 8 Mbps, < 500 MB')], spacing:{after:80} }),
        br(),
        new Paragraph({
          children: [new TextRun({ text: 'MVP operacional, no dispositivo médico  ·  Datos ficticios  ·  Roberto García  ·  CareSignal 2026', italics: true, size: 17, color: C.gris, font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
        }),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const out = path.join(__dirname, '..', 'business', 'CareSignal_Video_Storyboard_Veo.docx');
  fs.writeFileSync(out, buf);
  console.log(`OK — ${out} (${Math.round(buf.length / 1024)} KB)`);
}

main().catch(e => { console.error('ERROR', e); process.exit(1); });
