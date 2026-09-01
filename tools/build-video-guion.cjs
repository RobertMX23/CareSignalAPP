'use strict';
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType, PageBreak,
  convertMillimetersToTwip,
} = require('docx');
const fs   = require('fs');
const path = require('path');

const C = {
  azul:     '1A5276',
  azulCl:   'D6EAF8',
  verde:    '1E8449',
  verdeCl:  'D5F5E3',
  naranja:  'CA6F1E',
  morado:   '6C3483',
  moradoCl: 'E8DAEF',
  gris:     '424242',
  grisCl:   'F2F3F4',
  blanco:   'FFFFFF',
  negro:    '000000',
};

const run  = (t, o = {}) => new TextRun({ text: t, font: 'Calibri', size: 22, color: C.negro, ...o });
const bold = (t, s = 22, c = C.negro) => run(t, { bold: true, size: s, color: c });
const br   = () => new Paragraph({ children: [] });

const h1 = (t, fill = C.azul) => new Paragraph({
  children: [new TextRun({ text: t, bold: true, size: 30, color: C.blanco, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill },
  spacing: { before: 360, after: 160 },
});

const h2 = (t, fill = C.azulCl, color = C.azul) => new Paragraph({
  children: [new TextRun({ text: t, bold: true, size: 24, color, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill },
  spacing: { before: 200, after: 100 },
});

const divider = () => new Paragraph({
  border: { bottom: { color: C.azulCl, size: 6, style: BorderStyle.SINGLE } },
  spacing: { after: 240 },
});

const nota = (t, c = C.naranja) => new Paragraph({
  children: [new TextRun({ text: `⚙ ${t}`, italics: true, size: 19, color: c, font: 'Calibri' })],
  spacing: { after: 70 },
});

// Prompt Gemini — fondo morado
const gemini = (prompt) => new Paragraph({
  children: [
    new TextRun({ text: '✦ GEMINI PROMPT  ', bold: true, size: 18, color: C.morado, font: 'Calibri' }),
    new TextRun({ text: prompt, size: 19, color: C.negro, font: 'Courier New' }),
  ],
  shading: { type: ShadingType.CLEAR, fill: C.moradoCl },
  border: { left: { color: C.morado, size: 12, style: BorderStyle.SINGLE } },
  indent: { left: convertMillimetersToTwip(8) },
  spacing: { before: 100, after: 140, line: 320 },
});

// Voz en off — fondo azul
const voz = (lines) => {
  const ch = [];
  lines.forEach((l, i) => {
    if (i > 0) ch.push(new TextRun({ text: '', break: 1 }));
    ch.push(new TextRun({ text: l, size: 22, color: C.negro, font: 'Calibri', italics: true }));
  });
  return new Paragraph({
    children: ch,
    shading: { type: ShadingType.CLEAR, fill: C.azulCl },
    border: { left: { color: C.azul, size: 14, style: BorderStyle.SINGLE } },
    indent: { left: convertMillimetersToTwip(8) },
    spacing: { before: 80, after: 120, line: 340 },
  });
};

// Acción en pantalla — fondo verde
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

const bullet = (t, d = 0) => new Paragraph({
  children: [run(`• ${t}`)],
  indent: { left: convertMillimetersToTwip(6 + d * 8) },
  spacing: { after: 55 },
});

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

// Estilo visual global Gemini
const ESTILO = 'Style: clean editorial photography, soft pastel palette (warm ivory background, muted steel-blue accents), cinematic shallow depth of field, no text overlays, no logos, photorealistic, 16:9 aspect ratio, professional healthcare setting';

async function main() {
  const doc = new Document({
    creator: 'Roberto García',
    title: 'CareSignal — Guion de Video + Prompts Gemini (versión lean)',
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
          children: [new TextRun({ text: 'Guion de video — versión lean  ·  ~3:00', bold: true, size: 36, color: C.gris, font: 'Calibri' })],
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '4 escenas · 4 prompts Gemini · narración mínima · demo como protagonista', size: 24, color: C.gris, font: 'Calibri', italics: true })],
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Roberto García  ·  robertogarciaits@gmail.com  ·  linkedin.com/in/robertogarciaits  ·  844 588 1313', size: 20, color: C.gris, font: 'Calibri', italics: true })],
          alignment: AlignmentType.CENTER, spacing: { after: 400 },
        }),

        // ── PRINCIPIO ESTRATÉGICO ────────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({ text: 'Principio estratégico de este video', bold: true, size: 26, color: C.azul, font: 'Calibri' })],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: 'El demo ES el argumento. Todo lo demás es contexto.',
            bold: true, size: 26, color: C.naranja, font: 'Calibri',
          })],
          spacing: { after: 80 },
        }),
        bullet('El juez decide en los primeros 20 segundos si le importa el problema.'),
        bullet('Decide si confía en el producto en los 90 segundos del demo.'),
        bullet('Los números de mercado y el precio se recuerdan solo si el demo ya convenció.'),
        bullet('El nombre se retiene solo si lo vio hacer algo real.'),
        br(),
        nota('Regla de edición: si un segundo de video no muestra el producto funcionando NI el problema humano, córtalo.', C.azul),
        divider(),

        // ── RESUMEN ──────────────────────────────────────────────────────────
        new Paragraph({ children: [bold('Estructura del video', 26, C.azul)], spacing: { before: 120, after: 100 } }),
        tabla(
          ['Escena', 'Qué muestra', 'Tipo de recurso', 'Duración'],
          [
            ['1 · Problema', 'Una imagen. Una oración. Sin datos.', 'Gemini × 1 + voz', '25 s'],
            ['2 · Demo',     'El producto resolviendo el problema', 'Screencast MVP',   '1:50'],
            ['3 · Números',  'Mercado + precio. Nada más.',         'Gemini × 1 + texto', '20 s'],
            ['4 · Cierre',   'Founder. 2 oraciones. Nombre.',       'Cámara directa',   '10 s'],
          ],
          [2000, 3200, 2200, 1600]
        ),
        br(),
        new Paragraph({
          children: [new TextRun({ text: 'Total: ~2:45 – 3:00. Bajo el límite. El tiempo sobrante es silencio — no lo llenes.', italics: true, size: 20, color: C.naranja, font: 'Calibri' })],
          spacing: { after: 100 },
        }),
        divider(),

        // ── ESTILO GLOBAL GEMINI ─────────────────────────────────────────────
        h1('Estilo visual global — aplica a todos los prompts'),
        new Paragraph({ children: [run('Pega este bloque al inicio de cada prompt de imagen. Mantiene coherencia visual entre escenas.')], spacing: { after: 100 } }),
        gemini(ESTILO),
        divider(),

        // ══════════════════════════════════════════════════════════════════════
        // ESCENA 1
        // ══════════════════════════════════════════════════════════════════════
        h1('ESCENA 1 · El problema   00:00 – 00:25   (25 s)'),

        new Paragraph({
          children: [
            bold('Regla: ', 22, C.azul),
            run('Una sola imagen. Una sola oración. El juez debe sentirlo, no entenderlo.'),
          ],
          spacing: { after: 120 },
        }),

        h2('Imagen 1  (00:00 – 00:22)  fade-in desde negro'),
        gemini(
          `${ESTILO}, elderly woman in her 80s sitting alone by a sunlit window in a care home room at night, soft bedside lamp, a paper logbook open on the nightstand with blank lines, intimate and slightly somber mood, no caregiver visible`
        ),
        bullet('Sin texto en pantalla. Solo imagen + silencio + música suave instrumental.'),
        bullet('Transición: fade-in 1 s / hold / fade-out a negro 1 s antes de la voz.'),
        br(),

        h2('🎙 Voz en off  (00:18 – 00:25)  — sobre fade a negro'),
        voz([
          '"¿Qué pasa si nadie fue a verla esta noche y nadie lo sabe?"',
        ]),
        nota('Solo esa oración. Pausa de 2 s. Corte a la escena 2.'),
        divider(),

        // ══════════════════════════════════════════════════════════════════════
        // ESCENA 2
        // ══════════════════════════════════════════════════════════════════════
        h1('ESCENA 2 · El demo   00:25 – 02:15   (1 min 50 s)'),

        new Paragraph({
          children: [
            bold('Regla: ', 22, C.azul),
            run('El screencast es el pitch. La narración es solo lo que NO se ve en pantalla.'),
          ],
          spacing: { after: 120 },
        }),
        nota('Graba con OBS Studio a 1080p. Cursor visible y grande. Sin ventanas extra. Zoom-in suave (1.15×) en cada clic.'),
        br(),

        h2('🖥 Secuencia de 6 pasos'),
        tabla(
          ['Paso', 'Qué se ve en pantalla', 'Voz en off (solo si añade)', 'Seg'],
          [
            ['1', 'Dashboard completo — lista de rondas, Habitación 3 en "Programada", reloj en 02:55', '(silencio — deja que el juez lea la pantalla)', '12 s'],
            ['2', 'Clic en "▶ Avanzar reloj" → reloj salta a 03:05, barra superior pulsa', '"Pasan cinco minutos."', '7 s'],
            ['3', 'Fila Habitación 3 → rojo "VENCIDA". Chip de alerta amarilla aparece en columna de alertas.', '"CareSignal lo detecta solo."', '10 s'],
            ['4', 'Clic en alerta → modal con detalle. Clic en "Reconocer". Estado cambia a "Reconocida".', '"El supervisor la reconoce."', '8 s'],
            ['5', 'Clic en "Asignar" → menú de cuidadores disponibles → clic en nombre → confirmar.', '"La asigna al cuidador en turno."', '8 s'],
            ['6', 'Pestaña "Bitácora" → 3 filas de auditoría con actor + timestamp + acción. Scroll lento.', '"Quién. Cuándo. Qué. Inmutable."', '15 s'],
          ],
          [600, 3200, 3000, 700]
        ),
        br(),
        nota('Entre pasos 3 y 4: pausa visual de 1 s — deja que el juez procese el color rojo.'),
        nota('Paso 6: la última frase ("Inmutable.") se dice mientras el cursor está quieto sobre la bitácora.'),
        br(),

        h2('Frase puente al final del demo  (02:05 – 02:15)'),
        voz([
          '"De ronda vencida a bitácora cerrada — menos de dos minutos.',
          'Eso es lo que la NOM-031 exige. Eso es lo que CareSignal genera."',
        ]),
        nota('Corte a negro 0.5 s. Transición a Escena 3.'),
        divider(),

        // ══════════════════════════════════════════════════════════════════════
        // ESCENA 3
        // ══════════════════════════════════════════════════════════════════════
        h1('ESCENA 3 · Los números   02:15 – 02:35   (20 s)'),

        new Paragraph({
          children: [
            bold('Regla: ', 22, C.azul),
            run('Tres números. Ni uno más. El juez no puede retener más en 20 segundos.'),
          ],
          spacing: { after: 120 },
        }),

        h2('Imagen 3  (02:15 – 02:35)'),
        gemini(
          `${ESTILO}, aerial view of a mid-sized Mexican city at golden hour, care home buildings visible among residential blocks, warm light, sense of scale and untapped opportunity, no people, clean geometric composition`
        ),
        br(),

        h2('Texto superpuesto — animado, aparece uno por uno'),
        new Paragraph({
          children: [
            new TextRun({ text: '+1,300', bold: true, size: 48, color: C.azul, font: 'Calibri' }),
            new TextRun({ text: '  residencias privadas en México', size: 26, color: C.negro, font: 'Calibri' }),
          ],
          spacing: { before: 80, after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '~2M', bold: true, size: 48, color: C.azul, font: 'Calibri' }),
            new TextRun({ text: '  familias coordinando cuidado a distancia', size: 26, color: C.negro, font: 'Calibri' }),
          ],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '$3,990', bold: true, size: 48, color: C.verde, font: 'Calibri' }),
            new TextRun({ text: '  MXN/mes · 80 % margen bruto', size: 26, color: C.negro, font: 'Calibri' }),
          ],
          spacing: { after: 80 },
        }),
        br(),

        h2('🎙 Voz en off  (02:15 – 02:35)'),
        voz([
          '"Más de 1,300 residencias en México. Dos millones de familias.',
          'Plan Profesional: 3,990 pesos al mes. Margen bruto del 80 %."',
        ]),
        nota('Sin más datos. Sin competidores. Sin TAM/SAM/SOM.'),
        divider(),

        // ══════════════════════════════════════════════════════════════════════
        // ESCENA 4
        // ══════════════════════════════════════════════════════════════════════
        h1('ESCENA 4 · El cierre   02:35 – 02:45   (10 s)'),

        new Paragraph({
          children: [
            bold('Regla: ', 22, C.azul),
            run('Founder en cámara. Dos oraciones. El nombre al final. Mirar directo.'),
          ],
          spacing: { after: 120 },
        }),

        h2('🎤 Founder en cámara  (02:35 – 02:45)'),
        pantalla([
          '→ Roberto García frente a cámara, fondo neutro o banner CareSignal',
          '→ Luz frontal. Sin contraluz. Sin efectos.',
          '→ Texto inferior: "Roberto García  ·  robertogarciaits@gmail.com  ·  844 588 1313"',
          '→ Duración: 10 s exactos',
        ]),
        br(),

        h2('🎙 Voz en cámara — sin off, directo al lente'),
        voz([
          '"Buscamos dos o tres residencias piloto para Q1 2027.',
          'Soy Roberto García — esto es CareSignal."',
        ]),
        nota('La última sílaba coincide con el corte a negro. Sin música de salida.'),
        divider(),

        // ── CHECKLIST LEAN ───────────────────────────────────────────────────
        h1('Checklist de producción — versión mínima viable', C.gris),

        new Paragraph({ children: [bold('Imágenes Gemini (2 prompts):',22,C.azul)], spacing:{after:60} }),
        bullet('Genera en Gemini Imagen 3 (AI Studio o imagen.google.com)'),
        bullet('Resolución: 1920×1080 px, PNG. Sin texto legible generado por la IA.'),
        bullet('Rechaza si hay fondos blancos puros o colores saturados — busca marfil/beige + azul acero.'),
        br(),

        new Paragraph({ children: [bold('Screencast (Escena 2):',22,C.azul)], spacing:{after:60} }),
        bullet('OBS Studio o QuickTime, 1080p, 30 fps'),
        bullet('App abierta en localhost:5173, reloj en 02:55, pestaña fijada'),
        bullet('Cursor visible al 150 %. Zoom-in 1.15× en cada clic (0.3 s de transición).'),
        bullet('Graba en silencio — la voz en off se añade en edición, no en la grabación'),
        br(),

        new Paragraph({ children: [bold('Audio:',22,C.azul)], spacing:{after:60} }),
        bullet('Micrófono USB o lavalier — nunca el micrófono de la laptop'),
        bullet('Normaliza a -14 LUFS. Música de fondo (si la usas): -18 dBFS o menos'),
        bullet('Graba la voz de las 4 escenas en una sola sesión para coherencia tonal'),
        br(),

        new Paragraph({ children: [bold('Video final:',22,C.azul)], spacing:{after:60} }),
        bullet('1920×1080, 30 fps, H.264, bitrate ≥ 8 Mbps'),
        bullet('MP4 < 500 MB para el formulario del concurso'),
        bullet('Añade subtítulos SRT — muchos jurados ven sin audio'),
        bullet('Verifica duración ≤ 3:00 antes de enviar'),
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
  console.log(`OK — ${out} (${Math.round(buf.length / 1024)} KB)`);
}

main().catch(e => { console.error('ERROR', e); process.exit(1); });
