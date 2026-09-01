'use strict';
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType, PageBreak,
  convertMillimetersToTwip,
} = require('docx');
const fs   = require('fs');
const path = require('path');

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  azul:    '1A5276',
  azulCl:  'D6EAF8',
  verde:   '1E8449',
  verdeCl: 'D5F5E3',
  naranja: 'CA6F1E',
  naranjaCl:'FDEBD0',
  morado:  '6C3483',
  moradoCl:'E8DAEF',
  gris:    '424242',
  blanco:  'FFFFFF',
  negro:   '000000',
  grisClaro:'F2F3F4',
};

// ── Utilidades ────────────────────────────────────────────────────────────────
const run  = (text, opts = {}) => new TextRun({ text, font: 'Calibri', size: 22, color: C.negro, ...opts });
const bold = (text, size = 22, color = C.negro) => run(text, { bold: true, size, color });
const br   = () => new Paragraph({ children: [] });

const h1 = (text, fill = C.azul) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 28, color: C.blanco, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill },
  spacing: { before: 320, after: 160 },
});

const h2 = (text, fill = C.azulCl, color = C.azul) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 24, color, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill },
  spacing: { before: 200, after: 100 },
});

const chip = (label, fill, color = C.blanco) => new Paragraph({
  children: [new TextRun({ text: `  ${label}  `, bold: true, size: 18, color, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill },
  spacing: { before: 60, after: 60 },
});

const nota = (text, color = C.naranja) => new Paragraph({
  children: [new TextRun({ text: `⚙ ${text}`, italics: true, size: 19, color, font: 'Calibri' })],
  spacing: { after: 60 },
});

const divider = () => new Paragraph({
  border: { bottom: { color: C.azulCl, size: 4, style: BorderStyle.SINGLE } },
  spacing: { after: 200 },
});

const bullet = (text, indent = 0) => new Paragraph({
  children: [run(`• ${text}`)],
  indent: { left: convertMillimetersToTwip(6 + indent * 6) },
  spacing: { after: 50 },
});

// Bloque de prompt Gemini — fondo morado claro
const geminiBox = (prompt) => new Paragraph({
  children: [
    new TextRun({ text: '✦ GEMINI PROMPT  ', bold: true, size: 18, color: C.morado, font: 'Calibri' }),
    new TextRun({ text: prompt, size: 19, color: C.negro, font: 'Courier New' }),
  ],
  shading: { type: ShadingType.CLEAR, fill: C.moradoCl },
  border: { left: { color: C.morado, size: 10, style: BorderStyle.SINGLE } },
  indent: { left: convertMillimetersToTwip(8) },
  spacing: { before: 100, after: 120, line: 320 },
});

// Bloque de narración — fondo azul claro
const narracion = (lines) => {
  const children = [];
  lines.forEach((line, i) => {
    if (i > 0) children.push(new TextRun({ text: '', break: 1 }));
    children.push(new TextRun({ text: line, size: 22, color: C.negro, font: 'Calibri', italics: true }));
  });
  return new Paragraph({
    children,
    shading: { type: ShadingType.CLEAR, fill: C.azulCl },
    border: { left: { color: C.azul, size: 12, style: BorderStyle.SINGLE } },
    indent: { left: convertMillimetersToTwip(8) },
    spacing: { before: 80, after: 100, line: 320 },
  });
};

// Bloque de acción en pantalla — fondo verde claro
const pantallaBox = (lines) => {
  const children = [];
  lines.forEach((line, i) => {
    if (i > 0) children.push(new TextRun({ text: '', break: 1 }));
    children.push(new TextRun({ text: line, size: 19, color: C.verde, font: 'Calibri', bold: true }));
  });
  return new Paragraph({
    children,
    shading: { type: ShadingType.CLEAR, fill: C.verdeCl },
    border: { left: { color: C.verde, size: 10, style: BorderStyle.SINGLE } },
    indent: { left: convertMillimetersToTwip(8) },
    spacing: { before: 80, after: 100, line: 300 },
  });
};

function tablaSimple(headers, rows, widths) {
  const dw  = Math.floor(9000 / headers.length);
  const ws  = widths || headers.map(() => dw);
  const mkC = (text, isH, ri) => new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: String(text), bold: isH, size: 18,
        color: isH ? C.blanco : C.negro, font: 'Calibri' })],
      spacing: { before: 60, after: 60 },
    })],
    shading: { type: ShadingType.CLEAR, fill: isH ? C.azul : ri % 2 === 0 ? C.blanco : C.azulCl },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    width: { size: ws[0], type: WidthType.DXA },
  });
  return new Table({
    rows: [
      new TableRow({ children: headers.map((h) => mkC(h, true, 0)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({ children: row.map((c) => mkC(c, false, ri)) })),
    ],
    width: { size: 9000, type: WidthType.DXA },
  });
}

// ── ESCENAS ───────────────────────────────────────────────────────────────────

/*
  Video de 4 minutos para el concurso WomenCISO 4 / MenCISO 1
  Formato: voz en off + capturas de pantalla del MVP + imágenes generadas con Gemini

  Estructura:
  00:00–00:55  Escena 1 · Hook emocional          (imagen Gemini × 3 + voz)
  00:55–01:25  Escena 2 · Solución                (imagen Gemini × 1 + captura app)
  01:25–02:10  Escena 3 · Demo en vivo            (screencast del MVP)
  02:10–02:35  Escena 4 · Mercado                 (imagen Gemini × 1 + datos)
  02:35–02:55  Escena 5 · Diferenciador           (imagen Gemini × 1)
  02:55–03:20  Escena 6 · Tracción + Modelo       (captura + datos)
  03:20–03:40  Escena 7 · IA y Ciberseguridad     (imagen Gemini × 1)
  03:40–04:00  Escena 8 · Cierre                  (imagen Gemini × 1 + founder)
*/

// ── Estilo visual global para Gemini ─────────────────────────────────────────
const ESTILO = `Style: clean editorial photography, soft pastel palette (warm ivory backgrounds, muted steel blue accents), cinematic shallow depth of field, no text overlays, no logos, photorealistic, 16:9 aspect ratio, professional healthcare setting`;

async function main() {
  const doc = new Document({
    creator: 'Roberto García',
    title: 'CareSignal — Guion de Video + Prompts Gemini',
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22, color: C.negro } } },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top:    convertMillimetersToTwip(20),
            bottom: convertMillimetersToTwip(20),
            left:   convertMillimetersToTwip(22),
            right:  convertMillimetersToTwip(22),
          },
        },
      },
      children: [

        // ── PORTADA ──────────────────────────────────────────────────────────
        br(), br(),
        new Paragraph({
          children: [new TextRun({ text: 'CareSignal', bold: true, size: 80, color: C.azul, font: 'Calibri' })],
          alignment: AlignmentType.CENTER, spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Guion de video · 4 minutos', bold: true, size: 36, color: C.gris, font: 'Calibri' })],
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Prompts para Gemini · Escenas · Narración · Acciones en pantalla', size: 24, color: C.gris, font: 'Calibri', italics: true })],
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Roberto García  ·  robertogarciaits@gmail.com  ·  linkedin.com/in/robertogarciaits  ·  844 588 1313', size: 20, color: C.gris, font: 'Calibri', italics: true })],
          alignment: AlignmentType.CENTER, spacing: { after: 400 },
        }),

        // ── LEYENDA DE BLOQUES ───────────────────────────────────────────────
        new Paragraph({ children: [bold('Leyenda de bloques de color:', 22, C.azul)], spacing: { after: 80 } }),
        chip('  ✦ GEMINI PROMPT — pega este texto directo en Gemini Imagen / Imagen 3', C.morado),
        br(),
        chip('  🎙 NARRACIÓN — voz en off (grábala aparte, en MP3)', C.azul),
        br(),
        chip('  🖥 ACCIÓN EN PANTALLA — screencast del MVP', C.verde),
        br(), br(),
        divider(),

        // ── RESUMEN ──────────────────────────────────────────────────────────
        new Paragraph({ children: [bold('Resumen de escenas', 26, C.azul)], spacing: { before: 160, after: 120 } }),
        tablaSimple(
          ['#', 'Escena', 'Tipo', 'Inicio', 'Dur.'],
          [
            ['1', 'Hook emocional — el problema humano',       'Gemini × 3 imágenes + voz',        '00:00', '55 s'],
            ['2', 'Solución — los dos fallos resueltos',       'Gemini × 1 + captura app',          '00:55', '30 s'],
            ['3', 'Demo en vivo — ronda vencida → bitácora',   'Screencast MVP (6 pasos)',           '01:25', '45 s'],
            ['4', 'Mercado — SAM B2B + B2C',                   'Gemini × 1 + texto animado',        '02:10', '25 s'],
            ['5', 'Diferenciador — por qué nadie más lo hace', 'Gemini × 1',                        '02:35', '20 s'],
            ['6', 'Tracción + Modelo freemium',                'Captura pantalla + números',         '02:55', '25 s'],
            ['7', 'IA y Ciberseguridad',                       'Gemini × 1 + infografía',           '03:20', '20 s'],
            ['8', 'Cierre — llamada a la acción',              'Gemini × 1 + founder on camera',    '03:40', '20 s'],
          ],
          [600, 3200, 2400, 1000, 800]
        ),
        br(),
        new Paragraph({
          children: [run('Herramienta recomendada para el video: CapCut, DaVinci Resolve o Canva Video. Resolución: 1920×1080, 30 fps, H.264.')],
          spacing: { after: 80 },
        }),
        divider(),

        // ── ESTILO GLOBAL GEMINI ─────────────────────────────────────────────
        h1('Estilo visual global — aplica a todos los prompts Gemini'),
        new Paragraph({ children: [run('Copia este bloque al inicio de cualquier prompt de imagen para mantener coherencia visual entre escenas.')], spacing: { after: 100 } }),
        geminiBox(ESTILO),
        new Paragraph({ children: [run('Puedes pegar el estilo seguido de la descripción de escena, separados por una coma.')], spacing: { after: 80 } }),
        divider(),

        // ══ ESCENA 1 ═════════════════════════════════════════════════════════
        h1('Escena 1 · Hook emocional   00:00 – 00:55   (55 s)'),
        new Paragraph({ children: [bold('Objetivo:', 22, C.azul), run(' activar empatía antes de mostrar cualquier dato o tecnología.')] , spacing: { after: 80 } }),

        h2('Imagen 1-A  (00:00 – 00:12)'),
        nota('Abre el video. Sin texto. Solo imagen + música suave de fondo.'),
        geminiBox(
          `${ESTILO}, elderly woman in her 80s sitting by a sunlit window in a care home room, looking out peacefully, warm morning light, soft focus on her face, intimate and dignified mood, no medical equipment visible`
        ),
        bullet('Duración en pantalla: 12 s'),
        bullet('Transición: fade-in desde negro'),
        br(),

        h2('Imagen 1-B  (00:12 – 00:30)'),
        nota('Mientras la narración menciona "450 rondas por semana".'),
        geminiBox(
          `${ESTILO}, caregiver in soft blue scrubs walking down a corridor in a private elder-care residence at night, checking a paper clipboard under dim hallway lights, slightly blurred motion suggesting a routine patrol, quiet and operational mood`
        ),
        bullet('Duración en pantalla: 18 s'),
        bullet('Transición: corte directo'),
        br(),

        h2('Imagen 1-C  (00:30 – 00:55)'),
        nota('El "fallo administrativo" — nadie sabe qué pasó.'),
        geminiBox(
          `${ESTILO}, close-up of an open paper logbook on a wooden desk with handwritten entries, some lines left blank, soft warm desk lamp, a smartphone with an unanswered call visible in the background out of focus, sense of uncertainty and incomplete records`
        ),
        bullet('Duración en pantalla: 25 s'),
        bullet('Transición: fade a negro antes de Escena 2'),
        br(),

        h2('🎙 Narración Escena 1 — voz en off'),
        narracion([
          '"Todos envejecemos. Y llega un momento en que las personas que más queremos',
          'ya no pueden cuidarse solas.',
          'En México, ese momento ya llegó para 17 millones de personas mayores.',
          '',
          'Cuando las llevas a una residencia, les confías su tiempo, su dignidad, su seguridad.',
          '',
          'En una residencia con 50 adultos mayores se realizan cerca de 450 rondas por semana.',
          'Cada una es una oportunidad de que el cuidado ocurra — o de que no ocurra',
          'y nadie lo detecte.',
          '',
          'La familia llama y no hay respuesta.',
          'La inspección llega y no hay evidencia.',
          'El abogado pregunta y no hay defensa.',
          'Una multa bajo la Ley General de Salud puede superar los 234,000 pesos.',
          '',
          'Ese es el fallo. Y estamos resolviendo."',
        ]),
        divider(),

        // ══ ESCENA 2 ═════════════════════════════════════════════════════════
        h1('Escena 2 · Solución   00:55 – 01:25   (30 s)'),
        new Paragraph({ children: [bold('Objetivo:', 22, C.azul), run(' mostrar que CareSignal resuelve los dos fallos.')] , spacing: { after: 80 } }),

        h2('Imagen 2-A  (00:55 – 01:10)'),
        nota('Contraste visual: del papel desorganizado al dashboard digital.'),
        geminiBox(
          `${ESTILO}, split-screen composition: left half shows a messy paper logbook with incomplete handwritten entries; right half shows a clean modern tablet interface with organized care rounds dashboard in soft blue tones, green checkmarks, clear status indicators, high contrast between analog chaos and digital clarity`
        ),
        bullet('Duración en pantalla: 15 s'),
        bullet('Texto superpuesto (opcional): "Fallo operativo  →  Detectado" y "Fallo administrativo  →  Registrado"'),
        br(),

        h2('🖥 Captura de pantalla  (01:10 – 01:25)'),
        pantallaBox([
          '→ Captura estática del dashboard de CareSignal (localhost:5173)',
          '→ Vista: lista de rondas con estados en color (verde/amarillo/rojo)',
          '→ Zoom suave sobre la barra de alertas superior',
          '→ Duración: 15 s',
        ]),
        br(),

        h2('🎙 Narración Escena 2'),
        narracion([
          '"CareSignal resuelve los dos fallos.',
          'El operativo: detecta automáticamente cuando una ronda no ocurre',
          'y alerta al supervisor en tiempo real.',
          'El administrativo: genera una bitácora inmutable —',
          'quién, cuándo, qué resultado — sin papel, sin trabajo extra.',
          'Esto es CareSignal."',
        ]),
        divider(),

        // ══ ESCENA 3 ═════════════════════════════════════════════════════════
        h1('Escena 3 · Demo en vivo   01:25 – 02:10   (45 s)'),
        new Paragraph({ children: [bold('Objetivo:', 22, C.azul), run(' el juez ve la alerta nacer y cerrarse ante sus ojos.')] , spacing: { after: 80 } }),
        nota('Esta escena es 100 % screencast. No se usa Gemini. Graba con OBS Studio o QuickTime a 1080p.'),
        br(),

        h2('🖥 Secuencia de screencast — 6 pasos'),
        tablaSimple(
          ['Paso', 'Acción en pantalla', 'Narración simultánea', 'Seg'],
          [
            ['1', 'Dashboard — Habitación 3 en estado "Programada", reloj simulado en 02:55', '"Este es el turno de noche. Son casi las 3 AM."', '8 s'],
            ['2', 'Clic en "▶ Avanzar reloj" → reloj salta a 03:05', '"Pasan cinco minutos. La ronda no ocurrió."', '5 s'],
            ['3', 'Fila de Habitación 3 cambia a rojo "VENCIDA" — chip de alerta amarilla aparece', '"CareSignal lo detecta solo — sin llamadas, sin cuadernos."', '8 s'],
            ['4', 'Clic en alerta → modal → clic en "Reconocer" (supervisor)', '"El supervisor la recibe al instante y la reconoce."', '6 s'],
            ['5', 'Clic en "Asignar" → seleccionar cuidador → confirmar', '"La asigna al cuidador disponible en turno."', '6 s'],
            ['6', 'Pestaña Bitácora — scroll por 3 eventos de auditoría con actor + hora + acción', '"Y aquí está la bitácora inmutable. Quién hizo qué, a qué hora exacta. Eso es lo que la NOM-031 exige."', '12 s'],
          ],
          [600, 2800, 3800, 800]
        ),
        br(),
        nota('Edición: añade zoom-in suave en cada clic (factor 1.15×, 0.3 s de transición). Cursor visible y grande.'),
        nota('Audio: voz en off pregrabada sincronizada con el screencast. Sin música en esta escena.'),
        divider(),

        // ══ ESCENA 4 ═════════════════════════════════════════════════════════
        h1('Escena 4 · Mercado   02:10 – 02:35   (25 s)'),
        new Paragraph({ children: [bold('Objetivo:', 22, C.azul), run(' SAM B2B + B2C en números concretos.')] , spacing: { after: 80 } }),

        h2('Imagen 4-A  (02:10 – 02:25)'),
        geminiBox(
          `${ESTILO}, aerial view of a medium-sized Mexican city at golden hour, residential care buildings visible among modern urban blocks, warm light, sense of scale and opportunity, no people, clean composition`
        ),
        bullet('Texto animado superpuesto (Motion Bro / CapCut):'),
        bullet('+1,300 residencias privadas en México', 1),
        bullet('~2M familias coordinando cuidado a distancia', 1),
        bullet('Crecimiento: 18% anual', 1),
        bullet('Duración: 15 s'),
        br(),

        h2('🎙 Narración Escena 4'),
        narracion([
          '"Más de 1,300 residencias privadas en México, creciendo al 18% anual.',
          'Y dos millones de familias mexicanas coordinan el cuidado de un adulto mayor —',
          'ese es nuestro segundo mercado.',
          'Objetivo en 3 años: 50 a 200 residencias.',
          'A precio Profesional: entre 199 y 798 mil pesos mensuales recurrentes."',
        ]),
        divider(),

        // ══ ESCENA 5 ═════════════════════════════════════════════════════════
        h1('Escena 5 · Diferenciador   02:35 – 02:55   (20 s)'),
        new Paragraph({ children: [bold('Objetivo:', 22, C.azul), run(' por qué ningún competidor resuelve esto.')] , spacing: { after: 80 } }),

        h2('Imagen 5-A  (02:35 – 02:55)'),
        geminiBox(
          `${ESTILO}, flat lay of a hospital-style whiteboard with two columns: left column labeled "Competitors" with a list of medical record icons crossed out, right column labeled "CareSignal" with a glowing blue shield and clock icon, clean minimal style, soft shadows`
        ),
        bullet('Texto superpuesto (CapCut):'),
        bullet('Cronos Care / GERIGES → expediente clínico, sin detección de rondas', 1),
        bullet('CareSignal → único diseñado para el ciclo operativo de la ronda', 1),
        bullet('Duración: 20 s'),
        br(),

        h2('🎙 Narración Escena 5'),
        narracion([
          '"Los competidores son sistemas de expediente.',
          'Ninguno detecta una ronda atrasada.',
          'Ninguno tiene precio publicado.',
          'CareSignal es la única plataforma diseñada',
          'para el ciclo operativo de la ronda."',
        ]),
        divider(),

        // ══ ESCENA 6 ═════════════════════════════════════════════════════════
        h1('Escena 6 · Tracción + Modelo   02:55 – 03:20   (25 s)'),
        new Paragraph({ children: [bold('Objetivo:', 22, C.azul), run(' producto terminado + precios en 25 segundos.')] , spacing: { after: 80 } }),

        h2('🖥 Capturas de pantalla (02:55 – 03:10)'),
        pantallaBox([
          '→ Captura 1: pantalla de pruebas automatizadas pasando (verde — "38 passed")',
          '→ Captura 2: página de precios del MVP con 4 planes (Freemium / Esencial / Profesional / Institucional)',
          '→ Zoom sobre el plan "Profesional ⭐ $3,990 MXN/mes"',
          '→ Duración total: 15 s',
        ]),
        br(),

        h2('🎙 Narración Escena 6'),
        narracion([
          '"El MVP está terminado hoy.',
          '38 pruebas automatizadas, 20 de aceptación del contrato, cero bloqueantes.',
          'Freemium gratuito para capturar mercado,',
          'más tres planes pagos: desde 1,990 hasta 8,490 pesos al mes.',
          'Margen bruto superior al 80 %."',
        ]),
        divider(),

        // ══ ESCENA 7 ═════════════════════════════════════════════════════════
        h1('Escena 7 · IA y Ciberseguridad   03:20 – 03:40   (20 s)'),
        new Paragraph({ children: [bold('Objetivo:', 22, C.azul), run(' alinear con los criterios 1 y 11 del concurso.')] , spacing: { after: 80 } }),

        h2('Imagen 7-A  (03:20 – 03:40)'),
        geminiBox(
          `${ESTILO}, abstract digital visualization of a secure data pipeline: floating encrypted data nodes connected by glowing blue lines, a central AI brain icon, Google Cloud infrastructure silhouette in the background, dark navy background with soft cyan accents, sense of security and intelligence`
        ),
        bullet('Texto superpuesto:'),
        bullet('Google Cloud Run + Firebase · cifrado extremo a extremo', 1),
        bullet('LFPDPPP compliant · datos de adultos mayores protegidos', 1),
        bullet('Agente predictivo sobre Gemini API — alertas antes del fallo', 1),
        bullet('Duración: 20 s'),
        br(),

        h2('🎙 Narración Escena 7'),
        narracion([
          '"Los datos de adultos mayores son datos sensibles por ley — la LFPDPPP.',
          'CareSignal los estructura sobre Google Cloud Run y Firebase',
          'con cifrado extremo a extremo.',
          'La bitácora de 20 tipos de evento por turno es el insumo',
          'para alertas predictivas y un agente de ciberseguridad activo 24 horas',
          'sobre Gemini API de Google."',
        ]),
        divider(),

        // ══ ESCENA 8 ═════════════════════════════════════════════════════════
        h1('Escena 8 · Cierre   03:40 – 04:00   (20 s)'),
        new Paragraph({ children: [bold('Objetivo:', 22, C.azul), run(' oportunidad + llamada a la acción + founder on camera.')] , spacing: { after: 80 } }),

        h2('Imagen 8-A  (03:40 – 03:50)'),
        geminiBox(
          `${ESTILO}, golden hour light streaming through large windows of a modern care home common room, a caregiver holding a tablet with a glowing interface, elderly resident smiling in a comfortable chair in the background, hopeful and warm mood, sense of trust and operational excellence`
        ),
        bullet('Duración: 10 s'),
        bullet('Texto superpuesto: "El primero en llegar con trazabilidad operativa real / se convierte en el estándar del sector."'),
        br(),

        h2('🎤 Founder on camera  (03:50 – 04:00)'),
        nota('Graba este segmento tú mismo, cámara frontal o webcam HD. Fondo neutro o con logo CareSignal.'),
        pantallaBox([
          '→ Roberto García frente a cámara, 10 segundos',
          '→ Fondo: pared lisa o banner CareSignal',
          '→ Luz frontal (no contraluz)',
          '→ Texto en pantalla inferior: "Roberto García · CareSignal · robertogarciaits@gmail.com"',
        ]),
        br(),

        h2('🎙 Narración Escena 8'),
        narracion([
          '"El sector crece al 18% anual.',
          'La ley ya exige los registros.',
          'Los competidores no los generan.',
          '',
          'Buscamos dos o tres residencias piloto para el primer trimestre de 2027.',
          '',
          'Gracias."',
        ]),
        divider(),

        // ── CHECKLIST DE PRODUCCIÓN ──────────────────────────────────────────
        h1('Checklist de producción antes de exportar', C.gris),
        new Paragraph({ children: [bold('Imágenes Gemini (8 prompts):', 22, C.azul)], spacing: { after: 60 } }),
        bullet('Genera cada imagen en Gemini Imagen 3 (imagen.google.com o AI Studio)'),
        bullet('Resolución mínima: 1920 × 1080 px, formato PNG o WEBP'),
        bullet('Revisa que ninguna imagen contenga texto legible generado por la IA'),
        bullet('Paleta: tonos marfil/beige + azul acero. Rechaza si hay colores saturados o fondos blancos puros'),
        br(),
        new Paragraph({ children: [bold('Audio:', 22, C.azul)], spacing: { after: 60 } }),
        bullet('Graba la narración completa con micrófono USB o lavalier (evita micrófono de laptop)'),
        bullet('Exporta como WAV 44.1 kHz 16-bit, luego comprime a MP3 320 kbps'),
        bullet('Música de fondo: nivel -18 dBFS o menos (la voz siempre domina)'),
        bullet('Música sugerida: Artlist "Soft Inspire" o similar (licencia libre)'),
        br(),
        new Paragraph({ children: [bold('Video final:', 22, C.azul)], spacing: { after: 60 } }),
        bullet('1920 × 1080 px, 30 fps, H.264, bitrate ≥ 8 Mbps'),
        bullet('Exporta también en MP4 < 500 MB para subir al formulario del concurso'),
        bullet('Añade subtítulos (SRT) — muchos jurados ven sin audio'),
        bullet('Verifica que la duración sea ≤ 4:00 antes de enviar'),
        br(),
        new Paragraph({
          children: [new TextRun({ text: 'MVP operacional, no dispositivo médico  ·  Datos ficticios  ·  Roberto García  ·  CareSignal 2026', italics: true, size: 18, color: C.gris, font: 'Calibri' })],
          alignment: AlignmentType.CENTER, spacing: { before: 200 },
        }),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const out = path.join(__dirname, '..', 'business', 'CareSignal_Video_Guion_Gemini.docx');
  fs.writeFileSync(out, buf);
  console.log('OK —', out, `(${Math.round(buf.length / 1024)} KB)`);
}

main().catch(e => { console.error('ERROR', e); process.exit(1); });
