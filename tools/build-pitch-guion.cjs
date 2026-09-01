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
          children: [new TextRun({ text: 'Roberto García  ·  Agosto 2026  ·  robertogarciaits@gmail.com  ·  linkedin.com/in/robertogarciaits  ·  844 588 1313', size: 22, color: C.gris, font: 'Calibri', italics: true })],
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
            ['2', 'Solución', '30 s', '1:25'],
            ['DEMO', '🖥  Escena demo en vivo', '45 s', '2:10'],
            ['3', 'Mercado', '25 s', '2:35'],
            ['4', 'Diferenciador', '20 s', '2:55'],
            ['5', 'Tracción + Modelo', '25 s', '3:20'],
            ['6', 'IA y Ciberseguridad', '20 s', '3:40'],
            ['7', 'Cierre', '20 s', '4:00'],
          ],
          [1500, 3500, 1500, 2000]
        ),
        br(),
        new Paragraph({
          children: [new TextRun({ text: 'Total: 4:00 exactos. Si el juez interrumpe antes del bloque 6, salta directo al bloque 7 (Cierre).', italics: true, size: 20, color: C.naranja, font: 'Calibri' })],
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
          'En Estados Unidos, para 57 millones. En Japón, para 36 millones.',
          'Globalmente, se estima que más de 770 millones de personas ya viven esa realidad.',
          'Y según las Naciones Unidas, para 2050 serán 1,600 millones —',
          'casi el doble de la población actual de China.',
          '',
          'Cuando llevas a ese familiar, a ese ser querido, a una residencia,',
          'le estás confiando lo más valioso que tienes — su tiempo, su dignidad, su seguridad.',
          '',
          '¿Qué pasa cuando ningún cuidador sabe si alguien fue a ver a ese residente',
          'a las 3 de la mañana — o si la ronda simplemente no ocurrió,',
          'y nadie lo sabe hasta que es tarde?',
          '',
          'Ese es el fallo operativo. Y no es un evento aislado —',
          'como ejemplo, en una residencia con 50 adultos mayores',
          'se realizan cerca de 450 rondas por semana.',
          'Cada una es una oportunidad de que el cuidado ocurra,',
          'o de que no ocurra y nadie lo detecte.',
          '',
          '¿Y qué pasa cuando ese evento no quedó registrado en ningún lugar confiable',
          '— solo en un cuaderno que puede perderse, un WhatsApp que nadie revisa,',
          'o simplemente no existe?',
          '',
          'Ese es el fallo administrativo.',
          'La familia llama y no hay respuesta.',
          'La inspección llega y no hay evidencia.',
          'El abogado pregunta y no hay defensa.',
          'Sin registro auditable, el director no puede demostrar que el cuidado ocurrió',
          '— en ningún escenario.',
          '',
          'En un informe de la CNDH se documentaron condiciones de abandono,',
          'falta de personal y deficiencias operativas en residencias de adultos mayores en México',
          '— consecuencia de no contar con sistemas de gestión operativa que garanticen',
          'que el cuidado ocurrió, en el momento correcto, con la persona correcta.',
          '',
          'La NOM-031 exige registros administrativos permanentes.',
          'Y cualquier inspección, queja familiar o demanda civil puede llegar sin aviso.',
          'El director que no tiene evidencia auditable está expuesto en todo momento.',
          '',
          'Sin registro, no hay trazabilidad.',
          'Sin trazabilidad, no hay rendición de cuentas.',
          'Y sin rendición de cuentas, un derecho reconocido por la ONU y por la ley mexicana',
          '— el derecho a un cuidado digno y de calidad —',
          'se vuelve invisible e inauditable.',
          '',
          'Una multa bajo la Ley General de Salud puede superar los 234,000 pesos.',
          'Y eso es solo la primera.',
          '',
          'Eso es exactamente el problema que estamos resolviendo."',
        ]),
        divider(),

        // ── BLOQUE 2 ─────────────────────────────────────────────────────────
        h1('Bloque 2 · Solución'),
        tiempoLabel('Objetivo: responder los dos fallos del bloque 1 en 30 segundos.', 30, '1:25'),
        nota('El bloque 1 ya plantó el problema — la solución va directa y rápida.'),
        quote([
          '"CareSignal resuelve los dos fallos.',
          'El operativo: detecta automáticamente cuando una ronda no ocurre',
          'y alerta al supervisor en tiempo real.',
          'El administrativo: genera una bitácora inmutable — quién, cuándo, qué resultado —',
          'sin papel, sin transcripción, sin trabajo extra.',
          'El director tiene evidencia lista ante cualquier inspección, queja o demanda.',
          'Y se los voy a mostrar en vivo."',
        ]),
        divider(),

        // ── ESCENA DEMO ──────────────────────────────────────────────────────
        h1('DEMO · Escena en vivo — 45 segundos'),
        tiempoLabel('Objetivo: el juez ve la alerta nacer y cerrarse ante sus ojos.', 45, '2:10'),
        nota('Pantalla compartida. Abre la app ANTES de subir al frente. Practica hasta que cada clic sea automático.'),
        br(),

        // Setup técnico
        new Paragraph({ children: [bold('Setup antes de presentar:', 22, C.azul)], spacing: { after: 60 } }),
        new Paragraph({ children: [run('1. App corriendo en localhost:5173 — pestaña fijada, sin otras pestañas.')], spacing: { after: 40 } }),
        new Paragraph({ children: [run('2. Reloj simulado pausado en 02:55 — la ronda de Habitación 3 vence a las 03:00.')], spacing: { after: 40 } }),
        new Paragraph({ children: [run('3. Resolución mínima: 1280 × 720. Fuente del sistema al 125 %.')], spacing: { after: 40 } }),
        new Paragraph({ children: [run('4. Si usas proyector: prueba colores antes — el azul #5B8DB8 puede verse apagado.')], spacing: { after: 120 } }),

        // Secuencia de pantallas
        new Paragraph({ children: [bold('Secuencia de 6 pasos (45 s):', 22, C.azul)], spacing: { after: 80 } }),
        tablaSimple(
          ['Paso', 'Pantalla / acción', 'Narración en voz alta', 'Seg'],
          [
            ['1', 'Dashboard — lista de rondas activas, Habitación 3 en estado "Programada"', '"Este es el turno de noche. Son casi las 3 AM. La ronda de Habitación 3 está pendiente."', '8 s'],
            ['2', 'Clic en el botón "▶ Avanzar reloj" — reloj salta a 03:05', '"Pasan cinco minutos. La ronda no ocurrió."', '5 s'],
            ['3', 'La fila de Habitación 3 cambia a rojo "VENCIDA" — aparece chip de alerta amarilla en la columna de alertas', '"CareSignal la detecta solo — sin que nadie llame, sin que nadie revise un cuaderno."', '8 s'],
            ['4', 'Clic en la alerta → modal de detalle. Clic en "Reconocer" (rol supervisor)', '"El supervisor la recibe al instante y la reconoce."', '6 s'],
            ['5', 'Clic en "Asignar" → seleccionar cuidador disponible → confirmar', '"La asigna al cuidador disponible en turno."', '6 s'],
            ['6', 'Pestaña Bitácora — fila de auditoría con actor + hora + acción para cada paso. Scroll rápido por 3 eventos.', '"Y aquí está la bitácora inmutable: quién hizo qué, a qué hora exacta. Esto es lo que la NOM-031 exige y lo que protege al director ante cualquier inspección."', '12 s'],
          ],
          [800, 2500, 3800, 900]
        ),
        br(),
        nota('Si el proyector falla: describe la secuencia en voz alta — "el sistema haría X, luego Y". No te disculpes; sigue el ritmo.'),
        nota('Si el reloj no avanza: usa el botón "Reset demo" para volver al estado inicial y repite desde paso 1.'),
        br(),

        // Frase puente al siguiente bloque
        new Paragraph({ children: [bold('Frase de cierre del demo → puente al bloque de Mercado:', 22, C.azul)], spacing: { after: 80 } }),
        quote([
          '"Eso que acaban de ver — de ronda vencida a bitácora cerrada — ocurre en menos de dos minutos.',
          'Y ese flujo existe hoy, en producción, para más de 1,300 residencias en México."',
        ]),
        divider(),

        // ── BLOQUE 3 ─────────────────────────────────────────────────────────
        h1('Bloque 3 · Mercado'),
        tiempoLabel('Objetivo: SAM y potencial de ingresos en 25 segundos.', 25, '2:35'),
        nota('El tamaño global ya se dijo en el bloque 1 — aquí solo el mercado accionable.'),
        quote([
          '"Son más de 1,300 residencias privadas en México, creciendo al 18% anual.',
          'Y dos millones de familias mexicanas coordinan el cuidado de un adulto mayor — ese es nuestro segundo mercado.',
          'Nuestro objetivo en 3 años: 50 a 200 residencias.',
          'A precio Profesional, entre 199,000 y 798,000 pesos mensuales recurrentes."',
        ]),
        divider(),

        // ── BLOQUE 4 ─────────────────────────────────────────────────────────
        h1('Bloque 4 · Diferenciador'),
        tiempoLabel('Objetivo: un golpe limpio — por qué nadie más lo hace.', 20, '2:55'),
        nota('Nombra los competidores con confianza — los conoces mejor que el juez.'),
        quote([
          '"Los competidores — Cronos Care, GERIGES — son sistemas de expediente.',
          'Ninguno detecta una ronda atrasada.',
          'Ninguno tiene precio publicado.',
          'CareSignal es la única plataforma diseñada para el ciclo operativo de la ronda."',
        ]),
        divider(),

        // ── BLOQUE 5 ─────────────────────────────────────────────────────────
        h1('Bloque 5 · Tracción + Modelo de negocio'),
        tiempoLabel('Objetivo: producto terminado y precio en un solo bloque.', 25, '3:20'),
        nota('Ritmo rápido y seguro — cada número refuerza la credibilidad.'),
        quote([
          '"El MVP está terminado hoy.',
          '38 pruebas automatizadas. 20 de aceptación del contrato. Cero bloqueantes. Auditoría PASS.',
          'Freemium gratuito para capturar el mercado, más tres planes pagos desde 1,990 hasta 8,490 pesos al mes.',
          'Margen bruto superior al 80%."',
        ]),
        divider(),

        // ── BLOQUE 6 ─────────────────────────────────────────────────────────
        h1('Bloque 6 · IA y Ciberseguridad'),
        tiempoLabel('Objetivo: alinear con el eje del concurso en 20 segundos.', 20, '3:40'),
        nota('Conecta directamente con los criterios 1 y 11 del concurso.'),
        quote([
          '"Los datos de adultos mayores son datos sensibles por ley — la LFPDPPP.',
          'CareSignal los estructura sobre Google Cloud Run y Firebase con cifrado extremo a extremo.',
          'La bitácora de 20 tipos de evento por turno es el insumo para alertas predictivas',
          'y un agente de ciberseguridad activo 24 horas sobre Gemini API de Google."',
        ]),
        divider(),

        // ── BLOQUE 7 ─────────────────────────────────────────────────────────
        h1('Bloque 7 · Cierre'),
        tiempoLabel('Objetivo: oportunidad + llamada a la acción. Mirando al juez.', 20, '4:00'),
        nota('Baja el ritmo. "Gracias" se dice mirando al juez, no al guion.'),
        quote([
          '"El sector crece al 18% anual.',
          'La ley ya exige los registros.',
          'Los competidores no los generan.',
          'El primero que llegue con trazabilidad operativa real',
          'se convierte en el estándar del sector.',
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
