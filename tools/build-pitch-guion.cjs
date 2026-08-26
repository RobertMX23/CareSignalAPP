'use strict';
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType, PageBreak,
  convertMillimetersToTwip,
} = require('docx');
const fs = require('fs');
const path = require('path');

const C = {
  azul:   '1A5276',
  azulCl: 'D6EAF8',
  gris:   '424242',
  naranja:'CA6F1E',
  blanco: 'FFFFFF',
  negro:  '000000',
  verde:  '1E8449',
};

const run = (text, opts = {}) => new TextRun({
  text, font: 'Calibri', size: 24, color: C.negro, ...opts,
});

const bold = (text, size = 24, color = C.negro) =>
  run(text, { bold: true, size, color });

const br = () => new Paragraph({ children: [] });

const h1 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 28, color: C.blanco, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill: C.azul },
  spacing: { before: 280, after: 160 },
});

const tiempoLabel = (bloque, seg, acum) => new Paragraph({
  children: [
    new TextRun({ text: `${bloque}`, bold: true, size: 20, color: C.azul, font: 'Calibri' }),
    new TextRun({ text: `   ·   ${seg} s   ·   Acumulado: ${acum}`, size: 20, color: C.gris, font: 'Calibri' }),
  ],
  spacing: { before: 80, after: 120 },
});

const quote = (lines) => {
  const children = [];
  lines.forEach((line, i) => {
    if (i > 0) children.push(new TextRun({ text: '', break: 1 }));
    if (line === '') {
      children.push(new TextRun({ text: ' ', size: 24, font: 'Calibri' }));
    } else {
      children.push(new TextRun({ text: line, size: 24, color: C.negro, font: 'Calibri' }));
    }
  });
  return new Paragraph({
    children,
    indent: { left: convertMillimetersToTwip(12) },
    border: { left: { color: C.azul, size: 12, style: BorderStyle.SINGLE } },
    spacing: { before: 120, after: 200, line: 320 },
  });
};

const nota = (text) => new Paragraph({
  children: [new TextRun({ text: `⏱ ${text}`, italics: true, size: 20, color: C.naranja, font: 'Calibri' })],
  spacing: { after: 80 },
});

const divider = () => new Paragraph({
  border: { bottom: { color: C.azulCl, size: 4, style: BorderStyle.SINGLE } },
  spacing: { after: 200 },
});

function tablaSimple(headers, rows, widths) {
  const dw = Math.floor(9000 / headers.length);
  const ws = widths || headers.map(() => dw);
  const mkCell = (text, isH, rowIdx) => new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: String(text), bold: isH, size: 18, color: isH ? C.blanco : C.negro, font: 'Calibri' })],
      spacing: { before: 60, after: 60 },
    })],
    shading: { type: ShadingType.CLEAR, fill: isH ? C.azul : rowIdx % 2 === 0 ? C.blanco : C.azulCl },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
  return new Table({
    rows: [
      new TableRow({ children: headers.map((h, i) => mkCell(h, true, 0)), tableHeader: true }),
      ...rows.map((row, ri) => new TableRow({ children: row.map((c) => mkCell(c, false, ri)) })),
    ],
    width: { size: 9000, type: WidthType.DXA },
  });
}

async function main() {
  const doc = new Document({
    creator: 'Roberto García',
    title: 'CareSignal — Guion de Pitch 4 minutos · WomenCISO/MenCISO 2026',
    styles: {
      default: { document: { run: { font: 'Calibri', size: 24, color: C.negro } } },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(22),
            bottom: convertMillimetersToTwip(22),
            left: convertMillimetersToTwip(25),
            right: convertMillimetersToTwip(25),
          },
        },
      },
      children: [

        // ── PORTADA ──────────────────────────────────────────────────────────
        br(), br(),
        new Paragraph({
          children: [new TextRun({ text: 'CareSignal', bold: true, size: 80, color: C.azul, font: 'Calibri' })],
          alignment: AlignmentType.CENTER, spacing: { after: 160 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Guion de pitch · 4 minutos', bold: true, size: 36, color: C.gris, font: 'Calibri' })],
          alignment: AlignmentType.CENTER, spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'WomenCISO 4 / MenCISO 1 — Innovación en IA y Ciberseguridad', size: 26, color: C.gris, font: 'Calibri', italics: true })],
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Roberto García · Agosto 2026', size: 22, color: C.gris, font: 'Calibri', italics: true })],
          alignment: AlignmentType.CENTER, spacing: { after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Cómo usar este guion:', bold: true, size: 22, color: C.azul, font: 'Calibri' })],
          spacing: { after: 80 },
        }),
        new Paragraph({ children: [run('• Practica cada bloque por separado antes de encadenarlos.')], spacing: { after: 60 } }),
        new Paragraph({ children: [run('• El texto entre comillas es el guion exacto — el resto son instrucciones de apoyo.')], spacing: { after: 60 } }),
        new Paragraph({ children: [run('• La pausa natural entre bloques no está cronometrada — úsala para respirar.')], spacing: { after: 60 } }),
        new Paragraph({ children: [run('• Si el juez interrumpe antes del bloque 8, prioriza el cierre sobre IA/ciberseguridad.')], spacing: { after: 60 } }),
        br(),
        divider(),

        // ── RESUMEN DE TIEMPOS ───────────────────────────────────────────────
        new Paragraph({ children: [bold('Resumen de tiempos', 26, C.azul)], spacing: { before: 160, after: 120 } }),
        tablaSimple(
          ['Bloque', 'Contenido', 'Segundos', 'Acumulado'],
          [
            ['1', 'Hook / Problema', '55 s', '0:55'],
            ['2', 'Solución', '45 s', '1:40'],
            ['3', 'Mercado', '35 s', '2:15'],
            ['4', 'Diferenciador', '25 s', '2:40'],
            ['5', 'Tracción / Prueba', '25 s', '3:05'],
            ['6', 'Modelo de negocio', '20 s', '3:25'],
            ['7', 'IA y Ciberseguridad', '25 s', '3:50'],
            ['8', 'Cierre', '20 s', '4:10'],
          ],
          [2000, 3500, 1500, 2000]
        ),
        br(),
        new Paragraph({
          children: [new TextRun({ text: 'Total: ~4:10 · margen aceptable. Si hay límite estricto de 4:00, recorta una oración del bloque 3 (mercado).', italics: true, size: 20, color: C.naranja, font: 'Calibri' })],
          spacing: { after: 120 },
        }),
        divider(),

        // ── BLOQUE 1 ─────────────────────────────────────────────────────────
        h1('Bloque 1 · Hook / Problema'),
        tiempoLabel('Objetivo: activar empatía antes de mostrar cualquier dato.', 55, '0:55'),
        nota('Habla despacio. La primera oración es la más importante de todo el pitch.'),
        quote([
          '"Todos somos humanos. Todos envejecemos. Y todos, en algún momento,',
          'vamos a necesitar que alguien cuide de nosotros...',
          '',
          'Y llega un momento en que las personas que más queremos ya no pueden cuidarse solas.',
          'En México, ese momento ya llegó para 17 millones de personas mayores.',
          'En América Latina, para más de 65 millones.',
          'Y según la CEPAL, para 2050 serán 138 millones — casi 1 de cada 5 latinoamericanos.',
          '',
          'Cuando llevas a ese familiar, a ese ser querido, a una residencia,',
          'le estás confiando lo más valioso que tienes — su tiempo, su dignidad, su seguridad.',
          '',
          '¿Qué pasa cuando ningún cuidador de la residencia sabe si alguien fue a verla',
          'a las 3 de la mañana — o si la ronda de cuidado simplemente no ocurrió?',
          '¿Cuándo el único registro de atención es un cuaderno que puede perderse,',
          'un grupo de WhatsApp que nadie revisa, o simplemente no existe?"',
          '',
          'En México fallecen más de 700,000 personas mayores cada año.',
          'Muchas de ellas en residencias de cuidado.',
          'La CNDH realizó un muestreo en 58 de más de 1,500 residencias en todo el país.',
          'Y en las que logró visitar documentó condiciones de abandono,',
          'falta de personal y deficiencias operativas.',
          '',
          'Cuando no hay registro, no hay responsabilidad.',
          'Cuando no hay responsabilidad, no hay cuidado digno.',
          'Y cuando no hay cuidado digno — ese familiar no tiene el acompañamiento',
          'que merece hasta el final.',
          'Eso es exactamente el problema que estamos resolviendo."',
        ]),
        divider(),

        // ── BLOQUE 2 ─────────────────────────────────────────────────────────
        h1('Bloque 2 · Solución'),
        tiempoLabel('Objetivo: el juez entiende QUÉ hace el producto en 45 segundos.', 45, '1:40'),
        nota('Si hay pantalla disponible, muestra el dashboard en este momento.'),
        quote([
          '"CareSignal digitaliza el ciclo operativo completo de una ronda de cuidado:',
          'el cuidador la ejecuta en 3 acciones desde su teléfono.',
          'Si se retrasa — el sistema lo detecta solo y avisa al supervisor en tiempo real.',
          '',
          'Cada acción queda registrada: quién, cuándo, qué resultado.',
          'Una bitácora inmutable que se genera sola — sin papel, sin transcripción,',
          'sin trabajo extra.',
          '',
          'El familiar que pregunta por su mamá tiene una respuesta en segundos.',
          'El director que enfrenta una inspección tiene evidencia lista."',
        ]),
        divider(),

        // ── BLOQUE 3 ─────────────────────────────────────────────────────────
        h1('Bloque 3 · Mercado'),
        tiempoLabel('Objetivo: dimensionar la oportunidad con datos creíbles.', 35, '2:15'),
        nota('Si el tiempo aprieta, corta la última oración de los ingresos.'),
        quote([
          '"Son más de 1,300 residencias privadas formales en México.',
          'Crecen al 18% cada año.',
          'La ley — la NOM-031 — ya exige los registros.',
          'Pero menos del 4% fueron supervisadas durante la pandemia.',
          '',
          'El que llega digitalizado primero, llega protegido.',
          '',
          'Nuestro objetivo en 3 años: 50 a 200 residencias.',
          'A precio Profesional, eso equivale a entre 175,000 y 700,000',
          'pesos mensuales recurrentes."',
        ]),
        divider(),

        // ── BLOQUE 4 ─────────────────────────────────────────────────────────
        h1('Bloque 4 · Diferenciador'),
        tiempoLabel('Objetivo: dejar claro por qué nadie más lo está haciendo.', 25, '2:40'),
        nota('Nombra los competidores con confianza — los conoces mejor que el juez.'),
        quote([
          '"Los competidores en México — Cronos Care, GERIGES — son sistemas',
          'de expediente y administración.',
          'Ninguno detecta una ronda atrasada.',
          'Ninguno dispara una alerta automática.',
          'Ninguno tiene precio publicado.',
          '',
          'CareSignal es la única plataforma diseñada específicamente',
          'para ese ciclo operativo."',
        ]),
        divider(),

        // ── BLOQUE 5 ─────────────────────────────────────────────────────────
        h1('Bloque 5 · Tracción / Prueba'),
        tiempoLabel('Objetivo: demostrar que el producto existe y funciona hoy.', 25, '3:05'),
        nota('Sube el ritmo — este bloque va rápido y con seguridad.'),
        quote([
          '"El MVP está terminado hoy.',
          '38 pruebas automatizadas.',
          '20 pruebas de aceptación del contrato.',
          'Cero hallazgos bloqueantes.',
          'Auditoría con resultado PASS.',
          '',
          'Se puede usar ahora mismo — sin instalación, sin cuenta, sin internet."',
        ]),
        divider(),

        // ── BLOQUE 6 ─────────────────────────────────────────────────────────
        h1('Bloque 6 · Modelo de negocio'),
        tiempoLabel('Objetivo: precio claro, margen impresionante.', 20, '3:25'),
        nota('Di los números con calma — que el juez los procese.'),
        quote([
          '"Tres planes por residencia al mes:',
          'desde 1,490 hasta 6,990 pesos. Sin cobro por plaza.',
          '',
          'Infraestructura en Google Cloud para 33 clientes:',
          'menos de 100 dólares al mes.',
          'Margen bruto superior al 97%."',
        ]),
        divider(),

        // ── BLOQUE 7 ─────────────────────────────────────────────────────────
        h1('Bloque 7 · IA y Ciberseguridad'),
        tiempoLabel('Objetivo: alinear con el eje del concurso en 25 segundos.', 25, '3:50'),
        nota('Este bloque cierra el argumento técnico — conecta con el criterio 11.'),
        quote([
          '"Los datos de adultos mayores son datos sensibles por ley — la LFPDPPP.',
          'Hoy viven en cuadernos y grupos de WhatsApp sin ningún cifrado.',
          '',
          'CareSignal los estructura sobre Google Cloud Run y Firebase',
          'con cifrado extremo a extremo.',
          'Y la bitácora que genera — 20 tipos de evento por turno —',
          'es el insumo exacto para alertas predictivas',
          'y un agente de ciberseguridad activo las 24 horas,',
          'sobre Gemini API de Google."',
        ]),
        divider(),

        // ── BLOQUE 8 ─────────────────────────────────────────────────────────
        h1('Bloque 8 · Cierre'),
        tiempoLabel('Objetivo: anclar el precio con un dato de riesgo y hacer la llamada a la acción.', 20, '4:10'),
        nota('Baja el ritmo. La última oración se dice mirando al juez, no al guion.'),
        quote([
          '"Una multa leve bajo la Ley General de Salud cuesta 234,000 pesos.',
          'CareSignal cuesta 17,880 al año.',
          'Es 13 veces más barato que la primera multa.',
          '',
          'Buscamos dos o tres residencias piloto para el primer trimestre de 2027.',
          '',
          'Gracias."',
        ]),
        divider(),

        // ── NOTAS FINALES ────────────────────────────────────────────────────
        new Paragraph({ children: [bold('Notas para la sesión de preguntas (4 minutos)', 26, C.azul)], spacing: { before: 160, after: 120 } }),
        new Paragraph({ children: [run('Si preguntan por clientes: "Cero clientes hoy. La tracción es de producto. Buscamos los primeros pilotos con este pitch."')], spacing: { after: 80 } }),
        new Paragraph({ children: [run('Si preguntan por IA en el producto: "La ausencia de IA en v0.1.0 es una decisión de privacidad — ningún dato de residente sale del dispositivo. La IA entra en v0.2 cuando tengamos datos reales con consentimiento."')], spacing: { after: 80 } }),
        new Paragraph({ children: [run('Si preguntan por competencia: "Cronos Care tiene +50 residencias en México. Somos complementarios en expediente clínico, directamente superiores en ciclo operativo de ronda."')], spacing: { after: 80 } }),
        new Paragraph({ children: [run('Si preguntan por el equipo: "Proyecto individual — 5 roles, 8 fases con gate review en cada una. El método es la evidencia de colaboración estructurada."')], spacing: { after: 80 } }),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const out = path.join(__dirname, '..', 'business', 'CareSignal_Pitch_Guion_4min.docx');
  fs.writeFileSync(out, buf);
  console.log('✅ Guion generado:', out);
}

main().catch(e => { console.error('❌', e); process.exit(1); });
