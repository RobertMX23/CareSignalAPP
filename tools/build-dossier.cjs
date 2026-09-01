/**
 * build-dossier.js — Dossier ejecutivo CareSignal (.docx)
 * Consolida: problemática de raíz, avatares B2B/B2C, mercado, propuesta de
 * valor y estado del producto. El mapa event-driven va como anexo técnico.
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageBreak, Header, Footer, PageNumber, TableOfContents, LevelFormat,
  convertInchesToTwip,
} = require('docx');
const fs = require('fs');

// ---------- Paleta e identidad ----------
const BLUE = '0B5E8C';
const BLUE_DEEP = '08466A';
const INK = '0D1B26';
const INK_2 = '40566A';
const INK_3 = '74899A';
const WASH = 'E8F1F7';
const RULE = 'DAE4EB';
const RISK_BG = 'FDF3DD';
const GOOD_BG = 'E7F4EC';

const FONT = 'Calibri';
const CONTENT_W = 9360; // Letter (12240) menos márgenes de 1" a cada lado

// ---------- Helpers ----------
const p = (text, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 120, line: opts.line ?? 276 },
  alignment: opts.align,
  indent: opts.indent,
  border: opts.border,
  children: [new TextRun({
    text,
    font: FONT,
    size: opts.size ?? 21,          // half-points → 21 = 10.5pt
    bold: opts.bold,
    italics: opts.italics,
    color: opts.color ?? INK_2,
  })],
});

// Párrafo con tramos de formato mixto
const pRich = (runs, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 120, line: 276 },
  alignment: opts.align,
  children: runs.map((r) => new TextRun({
    text: r.t,
    font: FONT,
    size: r.size ?? opts.size ?? 21,
    bold: r.b,
    italics: r.i,
    color: r.c ?? opts.color ?? INK_2,
  })),
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 180 },
  children: [new TextRun({ text, font: FONT, size: 32, bold: true, color: BLUE_DEEP })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 140 },
  children: [new TextRun({ text, font: FONT, size: 25, bold: true, color: INK })],
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text, font: FONT, size: 22, bold: true, color: BLUE })],
});

const bullet = (text, level = 0) => new Paragraph({
  numbering: { reference: 'vinetas', level },
  spacing: { after: 80, line: 276 },
  children: [new TextRun({ text, font: FONT, size: 21, color: INK_2 })],
});

// Bullet con inicio en negrita
const bulletRich = (boldPart, rest, level = 0) => new Paragraph({
  numbering: { reference: 'vinetas', level },
  spacing: { after: 80, line: 276 },
  children: [
    new TextRun({ text: boldPart, font: FONT, size: 21, bold: true, color: INK }),
    new TextRun({ text: rest, font: FONT, size: 21, color: INK_2 }),
  ],
});

// Caja destacada (párrafo con sombreado y borde izquierdo)
const callout = (title, body, bg = WASH, accent = BLUE) => [
  new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: bg },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: accent, space: 8 } },
    spacing: { before: 160, after: 0, line: 276 },
    indent: { left: 120, right: 120 },
    children: [new TextRun({ text: title, font: FONT, size: 19, bold: true, color: accent, allCaps: true })],
  }),
  new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: bg },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: accent, space: 8 } },
    spacing: { before: 40, after: 200, line: 276 },
    indent: { left: 120, right: 120 },
    children: [new TextRun({ text: body, font: FONT, size: 21, color: INK_2 })],
  }),
];

// Cita destacada
const quote = (text) => new Paragraph({
  border: { left: { style: BorderStyle.SINGLE, size: 24, color: BLUE, space: 12 } },
  spacing: { before: 180, after: 200, line: 300 },
  indent: { left: 240, right: 240 },
  children: [new TextRun({ text, font: FONT, size: 24, italics: true, color: INK })],
});

const cell = (content, width, opts = {}) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
  margins: { top: 90, bottom: 90, left: 130, right: 130 },
  children: Array.isArray(content) ? content : [
    new Paragraph({
      spacing: { after: 0, line: 260 },
      children: [new TextRun({
        text: content,
        font: FONT,
        size: opts.size ?? 19,
        bold: opts.bold,
        color: opts.color ?? INK_2,
      })],
    }),
  ],
});

const table = (headers, rows, widths) => new Table({
  columnWidths: widths,
  width: { size: CONTENT_W, type: WidthType.DXA },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 4, color: RULE },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: RULE },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  },
  rows: [
    new TableRow({
      tableHeader: true,
      children: headers.map((hd, i) => cell(hd, widths[i], { fill: WASH, bold: true, color: BLUE_DEEP, size: 18 })),
    }),
    ...rows.map((r) => new TableRow({
      children: r.map((c, i) => (typeof c === 'object' && c !== null && !Array.isArray(c)
        ? cell(c.t, widths[i], c)
        : cell(c, widths[i]))),
    })),
  ],
});

const spacer = (h = 120) => new Paragraph({ spacing: { after: h }, children: [] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

// ============================================================
//  PORTADA
// ============================================================
const cover = [
  new Paragraph({ spacing: { before: 2600, after: 0 }, children: [
    new TextRun({ text: 'CARESIGNAL', font: FONT, size: 22, bold: true, color: BLUE, characterSpacing: 60 }),
  ]}),
  new Paragraph({
    spacing: { before: 220, after: 0 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 14 } },
    children: [new TextRun({ text: 'Dossier ejecutivo', font: FONT, size: 60, bold: true, color: INK })],
  }),
  new Paragraph({ spacing: { before: 300, after: 0 }, children: [
    new TextRun({
      text: 'Problemática de raíz, avatares de cliente y propuesta de valor',
      font: FONT, size: 28, color: INK_2,
    }),
  ]}),
  new Paragraph({ spacing: { before: 120, after: 0 }, children: [
    new TextRun({
      text: 'Mercado de residencias privadas para adultos mayores · México',
      font: FONT, size: 22, color: INK_3,
    }),
  ]}),
  new Paragraph({ spacing: { before: 1400, after: 0 }, children: [
    new TextRun({ text: 'Versión del producto  ', font: FONT, size: 19, color: INK_3 }),
    new TextRun({ text: 'v0.1.0-workshop', font: FONT, size: 19, bold: true, color: INK }),
  ]}),
  new Paragraph({ spacing: { before: 60, after: 0 }, children: [
    new TextRun({ text: 'Estado  ', font: FONT, size: 19, color: INK_3 }),
    new TextRun({ text: 'Auditoría de calidad PASS · 8 de 8 fases aprobadas', font: FONT, size: 19, bold: true, color: INK }),
  ]}),
  new Paragraph({ spacing: { before: 60, after: 0 }, children: [
    new TextRun({ text: 'Audiencia  ', font: FONT, size: 19, color: INK_3 }),
    new TextRun({ text: 'Dirección, inversionistas y gestión de proyecto', font: FONT, size: 19, bold: true, color: INK }),
  ]}),
  new Paragraph({
    spacing: { before: 900, after: 0 },
    shading: { type: ShadingType.CLEAR, fill: WASH },
    indent: { left: 120, right: 120 },
    children: [new TextRun({
      text: 'CareSignal apoya la operación del cuidado. No es un dispositivo médico, no emite diagnósticos y no sustituye al personal.',
      font: FONT, size: 18, italics: true, color: INK_2,
    })],
  }),
  pageBreak(),
];

// ============================================================
//  ÍNDICE
// ============================================================
const toc = [
  h1('Índice'),
  new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ spacing: { before: 200 }, children: [
    new TextRun({ text: 'Para actualizar el índice en Word: clic derecho sobre él → Actualizar campos.', font: FONT, size: 17, italics: true, color: INK_3 }),
  ]}),
  pageBreak(),
];

// ============================================================
//  1 · RESUMEN EJECUTIVO
// ============================================================
const resumen = [
  h1('1. Resumen ejecutivo'),
  p('CareSignal es una aplicación web operacional que permite a una residencia de adultos mayores registrar sus rondas de verificación, detectar retrasos de forma automática, escalar alertas con responsable explícito y conservar una bitácora auditable de todo lo ocurrido.'),
  spacer(60),
  h3('El hallazgo central'),
  quote('Verificar que alguien está bien no deja rastro físico. Si no se captura en el instante, deja de existir.'),
  p('De ahí se derivan los tres dolores del sector: la residencia no puede probar lo que hizo, no puede ver lo que falta mientras aún se corrige, y gasta horas reconstruyendo lo que nadie registró.'),
  spacer(60),
  h3('El argumento comercial más fuerte'),
  ...callout(
    'La obligación ya existe',
    'La NOM-031-SSA3-2012, vigente desde noviembre de 2012, obliga a todo establecimiento de asistencia social para adultos mayores a llevar expediente administrativo por cada usuario, además de reglamento interno, manuales técnico-administrativos, programa de trabajo y registro ante el DIF. La residencia no necesita ser convencida de documentar: ya está obligada. Lo que le falta es una forma de hacerlo que no consuma el turno completo.'
  ),
  ...callout(
    'Matiz indispensable: la norma casi no se fiscaliza',
    'La obligación existe, pero la inspección es escasa. Durante la pandemia, la Comisión Nacional de los Derechos Humanos supervisó 58 de cerca de 1,500 centros: menos del 4%. En consecuencia, el temor a una inspección no puede ser el motor de la venta —una dirección con años de operación sin visitas lo sabe—. El argumento normativo funciona como legitimación de la compra, no como amenaza. El motor real sigue siendo el reclamo de una familia, que sí ocurre con frecuencia. Véase la sección 3.4.',
    RISK_BG, '8A5A00'
  ),
  h3('Los cuatro puntos que un decisor necesita'),
  bulletRich('Demanda estructural. ', 'México tiene 17.1 millones de personas de 60 años o más (12.8% de la población) y la proyección llega a 27.7% hacia 2050. El envejecimiento no se revierte.'),
  bulletRich('Respaldo regulatorio, con matiz. ', 'Existe una norma vigente que exige documentación por usuario, y el producto la convierte en un subproducto automático de la operación diaria. La fiscalización es débil, de modo que se vende como respaldo ante reclamos y como seguro frente a un riesgo de baja probabilidad y consecuencia máxima: la clausura.'),
  bulletRich('Mercado B2B formal estrecho — complementado por B2C. ', 'Alrededor de 1,300 establecimientos B2B en México: obliga a ticket alto o expansión geográfica. El segmento B2C amplía el universo direccionable a ~2M familias con cuidado activo (CONAPO 2025) con un modelo freemium de adquisición viral y bajo CAC.'),
  bulletRich('Producto construido y verificado. ', 'El MVP está terminado, con 20 de 20 pruebas de aceptación aprobadas y 38 pruebas automatizadas en verde. No es una idea: es un producto demostrable hoy.'),
  spacer(80),
  h3('Recomendación'),
  p('Activar B2B con ventas directas —donde existe producto y obligación normativa— en paralelo con la entrada freemium B2C, que opera sobre el mismo motor sin requerir desarrollo adicional. El flywheel: familias que adoptan CareSignal en casa recomiendan la plataforma a la residencia donde ingresa su familiar, generando leads B2B de costo cero. Las notificaciones externas se reservan para v0.2.'),
  pageBreak(),
];

// ============================================================
//  2 · PROBLEMÁTICA DE RAÍZ
// ============================================================
const raiz = [
  h1('2. Problemática de raíz'),
  p('Los síntomas que el sector describe —rondas omitidas, alertas sin dueño, ausencia de evidencia— no son el problema: son consecuencias. Un síntoma se atiende; una raíz se resuelve. Esta sección baja tres niveles hasta la causa estructural.'),
  spacer(80),
  h2('2.1 La cadena causal'),
  table(
    ['Nivel', 'Enunciado'],
    [
      [{ t: 'Síntoma', b: true, color: INK }, 'No sé qué ronda está pendiente, y después no puedo demostrar qué se hizo.'],
      [{ t: 'Causa', b: true, color: INK }, 'El registro depende de que una persona ocupada se acuerde de anotar algo, en papel o mensajería, después de haber hecho la tarea.'],
      [{ t: 'Causa', b: true, color: INK }, 'El conocimiento de lo ocurrido en el turno vive en la memoria de personas que se van a su casa y son relevadas cada ocho horas.'],
      [{ t: 'RAÍZ', b: true, color: 'B3261E' }, { t: 'Verificar que una persona está bien es un acto que no deja rastro físico. A diferencia de un medicamento administrado o una comida servida, "pasé a ver a la señora del 12 a las 10:00 y estaba bien" no produce ninguna evidencia por sí mismo.', b: true, color: INK }],
    ],
    [1900, 7460]
  ),
  spacer(160),
  ...callout(
    'Por qué importa la distinción',
    'Atacar los síntomas por separado —más formatos, más supervisión, más recordatorios— no toca la raíz: la captura sigue dependiendo de la memoria humana. Solo se resuelve si el registro ocurre en el momento del acto y sin trabajo adicional para quien lo realiza.'
  ),
  h2('2.2 Los tres dolores derivados'),
  bulletRich('Dolor de evidencia (el más agudo). ', 'Ante un reclamo de una familia, una auditoría o el dueño, la dirección no tiene registro horario de quién verificó a quién, cuándo y con qué resultado. Es un dolor defensivo, no operativo.'),
  bulletRich('Dolor de visibilidad. ', 'Durante el turno no se sabe qué ronda está pendiente, cuál va retrasada ni quién es responsable de un aviso. Los problemas se conocen tarde y por canales informales.'),
  bulletRich('Dolor administrativo. ', 'Cada reporte y cada aclaración se reconstruye a mano juntando papeles y mensajes. Es tiempo de supervisión invertido en arqueología.'),
  pageBreak(),
];

// ============================================================
//  3 · JUSTIFICACIÓN DE MERCADO
// ============================================================
const mercado = [
  h1('3. Justificación de mercado'),
  h2('3.1 Demanda demográfica'),
  table(
    ['Indicador', 'Valor', 'Fuente'],
    [
      ['Personas de 60 años o más en México (2025)', { t: '17.1 millones', b: true, color: INK }, 'CONAPO, 2025'],
      ['Proporción de la población total (2025)', { t: '12.8%', b: true, color: INK }, 'CONAPO, 2025'],
      ['Proyección de personas mayores hacia 2030', { t: 'más de 20 millones', b: true, color: INK }, 'Proyección CONAPO'],
      ['Proporción proyectada de la población (2050)', { t: '27.7%', b: true, color: INK }, 'Proyección CONAPO'],
    ],
    [4400, 2600, 2360]
  ),
  spacer(200),
  h2('3.2 Estructura del sector'),
  table(
    ['Indicador', 'Valor', 'Fuente'],
    [
      ['Asilos y residencias registrados', { t: '1,297 unidades', b: true, color: INK }, 'DENUE, 2025'],
      ['Crecimiento del registro formal en un año', { t: '+18% (1,096 → 1,297)', b: true, color: INK }, 'DENUE 2024–2025'],
      ['Participación del sector privado', { t: '85%', b: true, color: INK }, 'Cifras de 2018'],
      ['Concentración geográfica', { t: '64% en 9 estados', b: true, color: INK }, 'DENUE'],
      ['Entidades principales', { t: 'Jalisco 152 · CDMX 109 · N.L. 105', b: true, color: INK }, 'DENUE'],
    ],
    [4400, 2600, 2360]
  ),
  spacer(200),
  h2('3.3 Lectura estratégica'),
  bulletRich('La demanda es estructural, no coyuntural. ', 'El envejecimiento poblacional no se revierte: cada año hay más residentes por cuidador disponible.'),
  bulletRich('El mercado formal es estrecho, y conviene decirlo. ', 'Con cerca de 1,300 establecimientos registrados y 85% de ellos privados, el universo B2B formal en México ronda el millar de clientes potenciales. Eso obliga a un ticket alto por cliente o a expandir geografía; no es un mercado de volumen.'),
  bulletRich('La concentración juega a favor. ', 'Que el 64% se ubique en nueve estados hace viable una estrategia comercial presencial y enfocada: Jalisco, Ciudad de México y Nuevo León concentran cerca de 370 establecimientos.'),
  bulletRich('La formalización acelerada es la señal más útil. ', 'Pasar de 1,096 a 1,297 unidades registradas en un año sugiere que el sector se está formalizando, y quien se formaliza es exactamente quien necesita cumplir la norma.'),
  spacer(120),
  ...callout(
    'El dato incómodo, dicho de frente',
    'Alrededor de 1,300 clientes potenciales formales en todo el país. Presentarlo abiertamente ante un inversionista construye credibilidad; omitirlo la destruye cuando lo verifique por su cuenta. El contrapeso es real: la concentración geográfica y el empuje normativo hacen alcanzable una porción significativa de ese universo.',
    RISK_BG, '8A5A00'
  ),
  pageBreak(),

  // --- 3.4 Marco normativo ---
  h2('3.4 El marco normativo: origen, alcance y límites'),
  p('El argumento comercial más fuerte del producto se apoya en una norma concreta. Conviene conocer su historia, porque explica tanto su fuerza como su debilidad.'),
  spacer(120),
  h3('Cronología'),
  table(
    ['Hito', 'Fecha'],
    [
      ['Antecedente: la materia se regulaba en la NOM-167-SSA1-1997', { t: '1997', b: true, color: INK }],
      ['Publicación de la NOM-031-SSA3-2012 en el Diario Oficial', { t: '13 de septiembre de 2012', b: true, color: INK }],
      ['Entrada en vigor', { t: '12 de noviembre de 2012', b: true, color: INK }],
      ['Proyecto de actualización PROY-NOM-031-SSA3-2018 sometido a consulta', { t: '27 de septiembre de 2019', b: true, color: INK }],
      ['Revisión sistemática: resultado "Confirmación"', { t: '5 de agosto de 2021', b: true, color: INK }],
      ['Estado actual', { t: 'Vigente, sin versión que la reemplace', b: true, color: '1E6B3C' }],
    ],
    [6100, 3260]
  ),
  spacer(180),
  p('El proyecto de actualización de 2018 se publicó para consulta pública durante sesenta días, pero nunca se convirtió en norma definitiva. La versión de 2012 sigue siendo la vinculante, y la revisión sistemática de 2021 la confirmó sin modificaciones.'),
  spacer(140),
  h3('Qué problemática la impulsó'),
  p('Los considerandos de la propia norma declaran tres motivos:'),
  spacer(60),
  bulletRich('Presión demográfica. ', 'El crecimiento acelerado de la población adulta mayor incrementa la demanda de servicios de asistencia social y representa un reto para las instituciones de los sectores público, social y privado.'),
  bulletRich('Vulnerabilidad documentada. ', 'La norma se dirige a personas en condiciones de soledad, abandono, discriminación y discapacidad, así como a víctimas de maltrato en sus diversas expresiones. Define de forma explícita qué constituye maltrato y qué constituye estado de abandono, señal de que legislaba sobre un problema observado y no hipotético.'),
  bulletRich('Ausencia de estándar de calidad. ', 'Necesidad de fijar parámetros que aseguren una operación integral más eficaz y un trato digno en los establecimientos.'),
  spacer(160),
  h3('El límite: existe la norma, falta la fiscalización'),
  p('La evidencia disponible indica una brecha considerable entre la obligación normativa y su verificación en campo. Durante la pandemia, la Comisión Nacional de los Derechos Humanos supervisó 58 de aproximadamente 1,500 centros de atención para adultos mayores —menos del 4%— y documentó hacinamiento, ausencia de protocolos sanitarios y deficiencias en la atención. El diagnóstico periodístico de agosto de 2025 describe una desprotección institucional persistente con escasa rendición de cuentas.'),
  spacer(120),
  ...callout(
    'Implicación estratégica para la venta',
    'Si la inspección es rara, el temor al inspector no vende. La secuencia correcta del argumento comercial es: primero el dolor que sí ocurre con frecuencia —el reclamo de una familia—, y después la norma como legitimación de la solución. La frase deja de ser "cumpla o lo multan" y pasa a ser "cuando alguien pregunte, usted ya tiene con qué responder". Existe además un segundo argumento válido: la fiscalización es infrecuente, pero cuando llega puede cerrar establecimientos, como ocurrió con la clausura de un asilo en San Luis Potosí por maltrato en mayo de 2025. Es un riesgo de baja probabilidad y consecuencia máxima, y eso se vende como seguro, no como trámite.'
  ),
  pageBreak(),
];

// ============================================================
//  4 · AVATAR PRIMARIO B2B
// ============================================================
const avatarB2B = [
  h1('4. Avatar primario: residencias privadas'),
  h2('4.1 Quien firma la compra'),
  table(
    ['Atributo', 'Perfil'],
    [
      [{ t: 'Rol', b: true, color: INK }, 'Directora o director de residencia — decisor económico'],
      [{ t: 'Organización', b: true, color: INK }, 'Residencia privada de 20 a 60 residentes'],
      [{ t: 'Equipo', b: true, color: INK }, 'Entre 8 y 20 cuidadores distribuidos en 3 turnos'],
      [{ t: 'Reporta a', b: true, color: INK }, 'Dueño o consejo, y de facto a las familias de los residentes'],
      [{ t: 'Perfil técnico', b: true, color: INK }, 'Bajo. La residencia no cuenta con área de sistemas'],
      [{ t: 'Herramientas actuales', b: true, color: INK }, 'Papel, mensajería instantánea, hojas de cálculo y memoria'],
      [{ t: 'Presupuesto', b: true, color: INK }, 'Discrecional y sensible al precio'],
    ],
    [2600, 6760]
  ),
  spacer(180),
  quote('Cuando una familia me reclama que nadie revisó a su mamá, no tengo con qué responderle. Sé que mi gente hizo su trabajo, pero no puedo demostrarlo.'),
  h3('El trabajo que necesita resolver'),
  p('«Cuando alguien cuestione el cuidado que damos, quiero poder mostrar evidencia horaria en segundos, para proteger la reputación de mi residencia.» El trabajo es demostrar, no vigilar: quien compra no busca controlar a su personal, busca poder responder por él.'),
  h3('Criterios de decisión'),
  bullet('Necesita que su personal lo adopte sin fricción; si los cuidadores lo rechazan, el proyecto muere.'),
  bullet('Desconfía de instalaciones, hardware y proyectos de implementación de meses.'),
  bullet('Teme asumir responsabilidad legal nueva al prometer una vigilancia que no puede sostener.'),
  bullet('Compra después de ver una demostración concreta con su propio caso, no una lista de funciones.'),
  spacer(120),
  h2('4.2 Quienes lo adoptan o lo rechazan'),
  p('El comprador no es el usuario. En este mercado la adopción se decide en el piso, no en la dirección: si el cuidador percibe un reloj checador, deja de usarlo y el dato se vuelve inservible. Los siguientes perfiles no firman, pero tienen poder de veto.'),
  spacer(80),
  h3('Supervisor de turno — aliado natural'),
  pRich([
    { t: 'Su dolor: ', b: true, c: INK },
    { t: 'es el cuello de botella humano. Coordina por mensajería, persigue confirmaciones y al cierre del turno arma el reporte de memoria. Cuando algo se escala, no queda claro quién quedó a cargo.' },
  ]),
  pRich([
    { t: 'Qué gana: ', b: true, c: INK },
    { t: 'el panel le entrega en una pantalla lo que hoy reconstruye a mano, y el escalamiento deja dueño explícito. Es el mayor beneficiado y, por lo tanto, el mejor promotor interno para un piloto.' },
  ]),
  spacer(80),
  h3('Cuidador de piso — riesgo de rechazo'),
  pRich([
    { t: 'Su dolor: ', b: true, c: INK },
    { t: 'se le atribuyen omisiones que no cometió y no tiene forma de probar lo que sí hizo. Trabaja con las manos ocupadas y con poco tiempo entre habitaciones.' },
  ]),
  pRich([
    { t: 'Qué gana: ', b: true, c: INK },
    { t: 'registrar su trabajo lo protege. Ese encuadre decide la adopción: «esto es tu respaldo», no «esto te vigila». El producto lo soporta —una ronda normal se completa en tres acciones o menos, con botones grandes y vista móvil.' },
  ]),
  pageBreak(),
];

// ============================================================
//  5 · PROPUESTA DE VALOR
// ============================================================
const valor = [
  h1('5. Propuesta de valor'),
  p('Cada fila enlaza un dolor concreto con la capacidad ya construida y verificada que lo atiende. No hay funcionalidad prometida en esta tabla: todo está implementado en la versión actual.'),
  spacer(120),
  table(
    ['Dolor del cliente', 'Cómo lo resuelve CareSignal'],
    [
      ['No puedo demostrar qué se hizo ni cuándo.', 'Bitácora append-only: cada acción registra actor, fecha y hora, y no puede editarse desde la aplicación.'],
      ['Me entero tarde de que una ronda no se hizo.', 'El vencimiento genera la alerta automáticamente y la eleva de amarilla a roja según el retraso acumulado.'],
      ['Un aviso por mensajería se pierde y nadie queda a cargo.', 'Toda alerta tiene dueño explícito; las no asignadas se marcan de forma destacada y cada reasignación queda registrada.'],
      ['Se dan por cerrados asuntos que nadie verificó.', 'El sistema impide cerrar sin resolver y resolver sin resultado de verificación. No es una política interna: es una regla que el software no permite saltar.'],
      ['Reconstruir el turno me consume horas.', 'Panel en vivo con residentes por estado, rondas vencidas, alertas sin asignar y tiempo mediano de respuesta.'],
      ['No quiero un proyecto de meses ni comprar equipo.', 'Aplicación web sin sensores ni instalación. Incluye un reloj simulado que permite demostrar el flujo completo en minutos.'],
    ],
    [3900, 5460]
  ),
  spacer(220),
  h2('5.1 Lo que el producto todavía no resuelve'),
  p('Ser explícito en este punto forma parte de la propuesta de valor con este cliente: una dirección escaldada por proveedores que prometen de más confía en quien acota su alcance.'),
  spacer(80),
  bulletRich('La alerta no sale de la pantalla. ', 'No hay mensajes de texto, mensajería instantánea, correo ni notificaciones push. Si nadie tiene la aplicación abierta, el aviso espera.'),
  bulletRich('No hay servidor central ni cuentas reales. ', 'Los datos residen en el navegador; no hay sincronización entre dispositivos ni entre sedes.'),
  bulletRich('No mide nada del residente. ', 'Ni signos vitales, ni caídas, ni sensores. Mide el cumplimiento operativo del equipo, que es un producto distinto.'),
  bulletRich('La captura sigue siendo manual. ', 'No hay lectura de código QR ni NFC en la puerta: el cuidador marca la ronda él mismo, de modo que se registra la declaración, no la presencia física verificada.'),
  spacer(160),
  h2('5.2 Objeciones previsibles'),
  table(
    ['Objeción', 'Respuesta'],
    [
      ['Mi personal no va a usar otra aplicación.', 'Una ronda normal se cierra en tres toques desde el móvil. El encuadre con el equipo es de respaldo, no de vigilancia: por primera vez pueden probar lo que sí hicieron.'],
      ['¿Esto me vuelve responsable legalmente de vigilar?', 'No modifica su obligación de cuidado. Documenta el trabajo que su equipo ya realiza. No es un dispositivo médico y no toma decisiones clínicas.'],
      ['¿Y si se cae el internet o el teléfono?', 'Objeción legítima y hoy sin respuesta completa: no hay modo desconectado ni avisos externos. Es precisamente lo que el piloto debe poner a prueba.'],
      ['Ya tengo bitácora en papel.', 'El papel prueba que alguien escribió algo; no prueba a qué hora, ni permite ver un retraso mientras aún se puede corregir. La diferencia no es el registro: es la oportunidad de reaccionar a tiempo.'],
      ['¿Cuánto cuesta y cómo sé que funciona?', 'Piloto de 30 días midiendo tres indicadores acordados de antemano. Si no se mueven, no hay venta.'],
    ],
    [3300, 6060]
  ),
  pageBreak(),
];

// ============================================================
//  6 · AVATAR B2C
// ============================================================
const avatarB2C = [
  h1('6. Segmento de expansión: familias'),
  ...callout(
    'Estado de esta línea — fase paralela activa',
    'Este segmento ya forma parte del modelo de negocio como fase paralela B2C. El tier Freemium ($0, sin responsabilidad legal) permite que familias adopten CareSignal sin ciclo de venta ni notificaciones externas. El plan Familiar ($199–$399 MXN/mes) opera sobre el mismo motor de rondas de v0.1.0. Las notificaciones externas (SMS/WhatsApp) están reservadas para v0.2 — no bloquean la entrada al mercado. SAM B2C estimado: ~2M familias mexicanas con cuidado activo (CONAPO 2025).',
    'E8F5E9', '1a6b3c'
  ),
  h2('6.1 La coordinadora familiar'),
  table(
    ['Atributo', 'Perfil'],
    [
      [{ t: 'Rol', b: true, color: INK }, 'Hija o hijo de 38 a 55 años — decisor y pagador'],
      [{ t: 'Situación', b: true, color: INK }, 'Su madre o padre vive solo y desea continuar así'],
      [{ t: 'Distancia', b: true, color: INK }, 'Otra ciudad o país; visitas espaciadas'],
      [{ t: 'Rol familiar', b: true, color: INK }, 'Es quien se hace cargo entre los hermanos'],
      [{ t: 'Carga real', b: true, color: INK }, 'Cerca de 38.9 horas semanales si es cuidadora principal'],
      [{ t: 'Motor de compra', b: true, color: INK }, 'Culpa y ansiedad, no eficiencia'],
    ],
    [2600, 6760]
  ),
  spacer(180),
  quote('No quiero vigilarla, quiero dejar de llamarle tres veces al día para saber si está bien, y que mis hermanos se enteren igual que yo sin que yo tenga que contárselos.'),
  h3('Sus dolores'),
  bulletRich('Incertidumbre continua. ', 'No saber si comió, si tomó el medicamento, si se levantó. La duda no tiene horario.'),
  bulletRich('Costo emocional de preguntar. ', 'Llamar para verificar se percibe como invadir o desconfiar. El adulto mayor lo resiente, y ella lo sabe.'),
  bulletRich('Reparto injusto entre hermanos. ', 'Una persona carga con todo mientras las demás ayudan cuando pueden. Genera un resentimiento que nadie nombra.'),
  bulletRich('Enterarse tarde. ', 'Si algo ocurre, se entera por casualidad o cuando ya es grave.'),
  spacer(140),
  h2('6.2 La persona mayor: poder de veto'),
  p('Su dolor no es el mismo. No siente incertidumbre: siente el riesgo de perder autonomía. Su temor real es que un tropiezo se interprete como «ya no puedes vivir sola» y termine en una mudanza que no eligió.'),
  p('Por eso rechaza aquello que la vigila. Cualquier cosa que se perciba como cámara, sensor o reporte a sus espaldas la pone en contra. Y si ella no participa, no hay producto: la señal depende de que ella la emita.'),
  ...callout(
    'La distinción que define el producto',
    'Un gesto que ella controla y que sirve para tranquilizar a sus hijos es autonomía. Un sensor que la reporta es supervisión. Esa diferencia es todo el producto.'
  ),
  h2('6.3 La raíz de este segmento'),
  quote('No existe una señal pasiva de "estoy bien": la única forma de saber es interrumpir, y la única forma de enterarse de un problema es que ya sea grave.'),
  p('Debajo hay un conflicto estructural: la persona mayor quiere que la dejen vivir su vida y la familia quiere saber. Ambas necesidades son legítimas y hoy solo se satisfacen a costa de la otra. Conviene notar que no es la misma raíz que en la residencia: allá el problema es probar hacia afuera un trabajo profesional; aquí es reconciliar dos necesidades familiares en conflicto.'),
  spacer(140),
  h2('6.4 Justificación de mercado'),
  table(
    ['Indicador', 'Valor', 'Fuente'],
    [
      ['Adultos mayores que viven solos', { t: '1.7 millones (11.4%)', b: true, color: INK }, 'INEGI'],
      ['De quienes viven solos, con algún problema de salud', { t: '96.8%', b: true, color: INK }, 'INEGI'],
      ['De quienes viven solos, con discapacidad o limitación', { t: 'cerca del 70%', b: true, color: INK }, 'INEGI'],
      ['Personas cuidadoras que son mujeres', { t: '75.1%', b: true, color: INK }, 'ENASIC 2022'],
      ['Horas semanales de una cuidadora principal', { t: '38.9 horas', b: true, color: INK }, 'ENASIC 2022'],
      ['Hogares receptores de remesas', { t: '11 millones (1 de cada 8.8)', b: true, color: INK }, 'CEMLA · BBVA'],
    ],
    [4400, 2600, 2360]
  ),
  spacer(200),
  p('Tres conclusiones se sostienen con evidencia. El mercado potencial es dos órdenes de magnitud mayor que el B2B: 1.7 millones de hogares frente a cerca de 1,300 establecimientos. Casi todos esos hogares tienen un motivo real de preocupación, de modo que el dolor no hay que crearlo. Y el ángulo de remesas tiene base: 11 millones de hogares reciben dinero del exterior, lo que confirma el patrón de un familiar que sostiene económicamente desde fuera. Falta validar el salto de «manda dinero» a «paga una suscripción de tranquilidad».'),
  pageBreak(),
];

// ============================================================
//  7 · COMPARATIVO Y DECISIÓN
// ============================================================
const decision = [
  h1('7. Comparativo de segmentos y decisión'),
  table(
    ['Criterio', 'B2B · Residencias', 'B2C · Familias'],
    [
      [{ t: 'Raíz del problema', b: true, color: INK }, 'El cuidado no deja rastro y debe probarse ante terceros', 'Autonomía y tranquilidad en conflicto; no hay señal pasiva'],
      [{ t: 'Quién paga', b: true, color: INK }, 'Dirección de la residencia', 'Hija o hijo coordinador, posiblemente desde el extranjero'],
      [{ t: 'Motor de compra', b: true, color: INK }, 'Cumplimiento normativo y defensa ante reclamos', 'Culpa, ansiedad y paz mental'],
      [{ t: 'Universo', b: true, color: INK }, 'Cerca de 1,300 establecimientos', 'Cerca de 1.7 millones de hogares'],
      [{ t: 'Empuje regulatorio', b: true, color: INK }, 'Fuerte: NOM-031-SSA3-2012', 'Ninguno'],
      [{ t: 'Quién emite la señal', b: true, color: INK }, 'Un trabajador, como parte de su empleo', 'La propia persona mayor, de forma voluntaria'],
      [{ t: 'Riesgo principal', b: true, color: INK }, 'Que el cuidador lo rechace por sentirse vigilado', 'Que la persona mayor no participe; sin ella no hay dato'],
      [{ t: 'Estado del producto', b: true, color: INK }, { t: 'Construido y verificado', b: true, color: '1E6B3C' }, { t: 'Concepto; requiere nueva versión', b: true, color: '8A5A00' }],
    ],
    [2200, 3580, 3580]
  ),
  spacer(220),
  ...callout(
    'La tensión estratégica',
    'Hay producto donde el mercado es estrecho, y mercado amplio donde no hay producto. El B2B es el camino corto: existe obligación normativa, el dolor es presupuestable y el MVP ya lo atiende, pero el techo formal ronda el millar de clientes en México. El B2C multiplica el universo, y requiere el canal de avisos que hoy está fuera de alcance. Lo razonable es cobrar en B2B mientras se valida B2C con entrevistas, no con desarrollo, y dejar que esa validación decida si la nueva versión se justifica.'
  ),
  h2('7.1 Qué hay que resolver ahora'),
  table(
    ['Acción', 'Cómo', 'Señal de éxito'],
    [
      [{ t: 'Validar el dolor', b: true, color: INK }, 'Entrevistar de 8 a 10 direcciones: «cuénteme del último reclamo de una familia»', 'Narran el reclamo antes que la omisión'],
      [{ t: 'Probar la adopción', b: true, color: INK }, 'Piloto de 30 días midiendo uso real por turno', 'Uso sostenido en las semanas 3 y 4, no solo en la primera'],
      [{ t: 'Medir el bloqueo', b: true, color: INK }, 'Preguntar de forma directa si la falta de avisos externos impide la compra', 'Si resulta bloqueante, la nueva versión sube de prioridad'],
      [{ t: 'Definir el precio', b: true, color: INK }, 'Ofrecer por residencia y por plaza, y observar cuál comprenden', 'Eligen sin necesitar explicación'],
    ],
    [2200, 4200, 2960]
  ),
  pageBreak(),
];

// ============================================================
//  8 · ESTADO DEL PRODUCTO
// ============================================================
const producto = [
  h1('8. Estado del producto'),
  p('El MVP se construyó bajo un protocolo de ocho fases secuenciales, cada una cerrada con una aprobación formal antes de avanzar a la siguiente. Las ocho están completas y aprobadas.'),
  spacer(120),
  h2('8.1 Resultados verificables'),
  table(
    ['Métrica', 'Resultado'],
    [
      ['Pruebas de aceptación contratadas', { t: '20 de 20 aprobadas', b: true, color: '1E6B3C' }],
      ['Pruebas automatizadas', { t: '38 de 38 en verde', b: true, color: '1E6B3C' }],
      ['Hallazgos críticos (blocker)', { t: 'Ninguno', b: true, color: '1E6B3C' }],
      ['Hallazgos de severidad alta', { t: '1 detectado y corregido', b: true, color: INK }],
      ['Hallazgos medio y bajo', { t: '1 y 1, documentados en backlog', b: true, color: INK }],
      ['Verificación de tipos estricta', { t: 'Sin errores', b: true, color: INK }],
      ['Compilación de producción', { t: 'Limpia', b: true, color: INK }],
      ['Duración del escenario de demostración', { t: 'Segundos (límite contratado: 5 minutos)', b: true, color: INK }],
    ],
    [5000, 4360]
  ),
  spacer(200),
  h2('8.2 Alcance funcional entregado'),
  bullet('Programación y seguimiento de rondas con sus seis estados operativos.'),
  bullet('Detección automática de vencimientos mediante reloj simulado determinista.'),
  bullet('Generación y escalamiento de alertas por severidad según el retraso acumulado.'),
  bullet('Ciclo completo de alerta: reconocer, asignar, reasignar, escalar, verificar, registrar resultado, resolver y cerrar.'),
  bullet('Panel del supervisor con diez indicadores operativos.'),
  bullet('Bitácora auditable append-only con actor, fecha y hora en cada acción.'),
  bullet('Tres escenarios de demostración reproducibles.'),
  spacer(160),
  h2('8.3 Limitaciones declaradas'),
  bullet('La persistencia es local en el navegador; no hay servidor central.'),
  bullet('El paso del tiempo lo controla un reloj simulado; no se usan esperas reales.'),
  bullet('El cambio de usuario es una selección de perfil, no un inicio de sesión con credenciales.'),
  bullet('Una ronda vencida es un estado terminal: un residente permanece en rojo aunque su alerta se resuelva y se cierre.'),
  pageBreak(),
];

// ============================================================
//  ANEXO A · MAPA EVENT-DRIVEN
// ============================================================
const anexoA = [
  h1('Anexo A. Mapa event-driven (técnico)'),
  p('Esta sección está dirigida al equipo técnico y a la gestión de proyecto. Documenta el modelo orientado a eventos que el producto ya implementa: toda acción material emite un evento de auditoría y ese registro es append-only.'),
  spacer(120),
  h2('A.1 Catálogo de eventos'),
  p('El sistema emite veinte tipos de evento, agrupados por la entidad que los posee.'),
  spacer(80),
  h3('Entidad Ronda'),
  table(
    ['Evento', 'Origen', 'Actor'],
    [
      ['round:created', 'Datos iniciales', 'Sistema'],
      ['round:scheduled→due', 'Motor temporal', 'Reloj de demostración'],
      ['round:due→overdue', 'Motor temporal', 'Reloj de demostración'],
      ['round:due→in_progress', 'Iniciar ronda', 'Cuidador'],
      ['round:in_progress→completed', 'Completar ronda', 'Cuidador'],
      ['round:*→cancelled', 'Sin comando de interfaz en esta versión', 'Supervisor'],
    ],
    [3600, 3600, 2160]
  ),
  spacer(180),
  h3('Entidad Alerta'),
  table(
    ['Evento', 'Origen', 'Actor'],
    [
      ['alert:created', 'Vencimiento automático o solicitud de apoyo', 'Reloj o cuidador'],
      ['alert:severity_escalated_by_delay', 'Motor temporal', 'Reloj de demostración'],
      ['alert:open→acknowledged', 'Reconocer alerta', 'Supervisor'],
      ['alert:open→assigned', 'Asignar o aceptar', 'Supervisor o cuidador'],
      ['alert:acknowledged→assigned', 'Asignar', 'Supervisor'],
      ['alert:reassigned', 'Reasignar responsable', 'Supervisor'],
      ['alert:assigned→escalated', 'Escalar', 'Supervisor'],
      ['alert:*→in_verification', 'Iniciar verificación', 'Supervisor'],
      ['alert:in_verification→resolved', 'Registrar resultado y resolver', 'Supervisor'],
      ['alert:resolved→closed', 'Cerrar', 'Supervisor'],
    ],
    [3600, 3600, 2160]
  ),
  spacer(180),
  ...callout(
    'La excepción del modelo',
    'alert:reassigned es el único evento de alerta que no corresponde a una transición de estado. Reasignar no mueve la alerta de asignada o escalada, por lo que no está en la lista blanca de transiciones; se registra de forma manual para cumplir la regla de que toda reasignación genera auditoría.'
  ),
  h2('A.2 Políticas automáticas'),
  table(
    ['#', 'Cuando ocurre', 'Entonces'],
    [
      ['P1', 'Se avanza o restablece el reloj', 'Se ejecuta el motor temporal completo'],
      ['P2', 'Se alcanza la hora programada', 'La ronda pasa a próxima a vencer'],
      ['P3', 'Se supera la hora límite sin iniciar', 'La ronda pasa a vencida'],
      ['P4', 'Hay ronda vencida sin alerta activa', 'Se crea la alerta (amarilla, o roja si el retraso supera 15 minutos)'],
      ['P5', 'Alerta amarilla y retraso mayor al umbral', 'La severidad sube a roja'],
      ['P6', 'Se inicia verificación sin incidente previo', 'Se crea el incidente y pasa a verificación'],
      ['P7', 'Se resuelve la alerta', 'El incidente asociado se resuelve con el mismo resultado'],
      ['P8', 'Se cierra la alerta', 'El incidente resuelto también se cierra'],
    ],
    [900, 4200, 4260]
  ),
  spacer(180),
  ...callout(
    'Política ausente a propósito',
    'Al corregirse el origen de una alerta, esta no se cierra de forma automática: requiere verificación humana. No existe ninguna política que resuelva o cierre alertas por sí sola.'
  ),
  h2('A.3 Invariantes del sistema'),
  bullet('Máximo una alerta activa por ronda.'),
  bullet('No se puede resolver sin resultado de verificación.'),
  bullet('No se puede cerrar sin haber resuelto previamente.'),
  bullet('Una ronda completada o cancelada nunca vence ni genera alerta.'),
  bullet('Toda transición registra actor, fecha y hora.'),
  bullet('La auditoría es append-only y no editable desde la interfaz.'),
  bullet('El estado visual del residente nunca se almacena: se recalcula en cada consulta.'),
  bullet('Ejecutar el motor temporal varias veces equivale a ejecutarlo una sola vez.'),
  spacer(160),
  h2('A.4 Límites del modelo'),
  bulletRich('No hay bus de eventos ni suscriptores. ', 'Los eventos se escriben en la auditoría de forma síncrona y las políticas son llamadas directas. Es un modelo con trazabilidad de eventos, no una arquitectura de publicación y suscripción.'),
  bulletRich('La auditoría no es la fuente de verdad del estado. ', 'El estado reside en las entidades y la auditoría lo acompaña. Una arquitectura de event sourcing real reconstruiría el estado reproduciendo los eventos.'),
  bulletRich('Migrar a un bus real requiere nueva versión del contrato. ', 'Sería un cambio de arquitectura, no un ajuste incremental.'),
  pageBreak(),
];

// ============================================================
//  ANEXO B · FUENTES Y ADVERTENCIAS
// ============================================================
const anexoB = [
  h1('Anexo B. Fuentes y advertencias metodológicas'),
  h2('B.1 Advertencias sobre los datos'),
  bulletRich('Conviven dos fuentes con bases distintas. ', 'CONAPO reporta 17.1 millones de personas de 60 años o más en 2025; el dato de hogares unipersonales (11.4%, equivalente a 1.7 millones) proviene de un corte del INEGI con base de 15.4 millones. Si la proporción se sostiene sobre la población actual, quienes viven solos hoy serían cerca de 1.9 millones, pero esa cifra es una inferencia, no un dato publicado.'),
  bulletRich('El DENUE contabiliza unidades registradas, no el mercado real. ', 'El sector presenta informalidad conocida que las fuentes consultadas no cuantifican. El universo real de residencias es mayor que 1,297; se desconoce en qué medida.'),
  bulletRich('Existe una discrepancia entre fuentes sobre el número de establecimientos. ', 'Este documento emplea la cifra del DENUE 2025 (1,297 unidades, 85% privadas). Un reportaje de agosto de 2025 cita datos del INEGI de 2020 con cerca de 1,500 centros, de los cuales solo 107 serían públicos. Son metodologías y años distintos y no deben mezclarse en una misma lámina. Ante un cuestionamiento sobre el tamaño de mercado, la respuesta defendible es que el universo formal se ubica entre 1,300 y 1,500 establecimientos, con informalidad adicional no cuantificada.'),
  bulletRich('La composición de 85% privado corresponde a 2018. ', 'Es el dato de mayor antigüedad de este documento y conviene reverificarlo antes de utilizarlo en una presentación formal.'),
  bulletRich('No existe dato público de disposición a pagar ', 'en ninguno de los dos segmentos. Es el primer resultado que deben producir el piloto y las entrevistas.'),
  bulletRich('El análisis de avatares es una hipótesis estructurada. ', 'Es coherente con el contrato y con el producto construido, pero no constituye investigación de campo. Su validación está detallada en la sección 7.1.'),
  spacer(180),
  h2('B.2 Fuentes consultadas'),
  bullet('CONAPO, vía Gaceta UNAM. México, oficialmente un país envejecido.'),
  bullet('INEGI. Los adultos mayores en México: perfil sociodemográfico.'),
  bullet('Diario Oficial de la Federación. Norma Oficial Mexicana NOM-031-SSA3-2012, Asistencia social a adultos y adultos mayores.'),
  bullet('Secretaría de Economía, Data México. Asilos y otras residencias para el cuidado de ancianos (DENUE).'),
  bullet('Reporte Índigo. Distribución de asilos y casas de cuidado en México.'),
  bullet('INEGI. Encuesta Nacional para el Sistema de Cuidados (ENASIC) 2022.'),
  bullet('INEGI, vía Quadratín. Adultos mayores que viven solos.'),
  bullet('BBVA Research. Remesas a México 2025.'),
  bullet('CEMLA. Hogares receptores de remesas en México.'),
  bullet('Secretaría de Economía, Plataforma PLATIICA. Estado de vigencia de la NOM-031-SSA3-2012.'),
  bullet('Diario Oficial de la Federación. Proyecto PROY-NOM-031-SSA3-2018, publicado el 27 de septiembre de 2019.'),
  bullet('Vértigo Político, agosto de 2025. Abandono, negligencia y explotación en asilos; cita el Informe ISP-12/2020 de la CNDH.'),
  bullet('Diario Puntual, mayo de 2025. Clausura del asilo Santa Sofía en San Luis Potosí por maltrato.'),
  spacer(240),
  new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: WASH },
    indent: { left: 120, right: 120 },
    spacing: { before: 200, after: 200, line: 276 },
    children: [new TextRun({
      text: 'Aviso. CareSignal es un producto operacional de demostración. No es un dispositivo médico, no realiza diagnósticos, no mide signos vitales, no detecta caídas y no sustituye al personal de cuidado. Los datos utilizados en el producto son ficticios.',
      font: FONT, size: 19, italics: true, color: INK_2,
    })],
  }),
];

// ============================================================
//  DOCUMENTO
// ============================================================
const doc = new Document({
  creator: 'CareSignal',
  title: 'Dossier ejecutivo CareSignal',
  description: 'Problemática de raíz, avatares de cliente y propuesta de valor',
  numbering: {
    config: [{
      reference: 'vinetas',
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 200 } } } },
        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 200 } } } },
      ],
    }],
  },
  styles: {
    default: {
      document: { run: { font: FONT, size: 21, color: INK_2 } },
    },
  },
  sections: [
    // Portada sin encabezado ni pie
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: cover,
    },
    // Cuerpo con encabezado y pie
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 6 } },
            children: [new TextRun({
              text: 'CareSignal · Dossier ejecutivo · v0.1.0-workshop',
              font: FONT, size: 16, color: INK_3,
            })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Página ', font: FONT, size: 16, color: INK_3 }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: INK_3 }),
              new TextRun({ text: ' de ', font: FONT, size: 16, color: INK_3 }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: INK_3 }),
              new TextRun({ text: '  ·  No es un dispositivo médico', font: FONT, size: 16, color: INK_3 }),
            ],
          })],
        }),
      },
      children: [
        ...toc,
        ...resumen,
        ...raiz,
        ...mercado,
        ...avatarB2B,
        ...valor,
        ...avatarB2C,
        ...decision,
        ...producto,
        ...anexoA,
        ...anexoB,
      ],
    },
  ],
});

const path = require('path');
const OUT = process.argv[2] || path.join(__dirname, '..', 'business', 'CareSignal_Dossier_Ejecutivo.docx');
Packer.toBuffer(doc).then((buf) => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buf);
  console.log('OK — ' + path.relative(process.cwd(), OUT) + ' (' + Math.round(buf.length / 1024) + ' KB)');
});
