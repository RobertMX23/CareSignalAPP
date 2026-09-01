'use strict';
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType, PageBreak, TableOfContents,
  StyleLevel, LevelFormat, convertInchesToTwip, convertMillimetersToTwip,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Paleta ─────────────────────────────────────────────────────────────────
const C = {
  azul:    '1A5276', // encabezados
  azulCl:  'D6EAF8', // fondo filas alternas y headers tabla
  gris:    '424242', // body text
  grisCl:  'F2F3F4', // fondo portada
  verde:   '1E8449', // check marks
  naranja: 'CA6F1E', // warnings
  blanco:  'FFFFFF',
  negro:   '000000',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const bold = (t, sz = 22, color = C.negro) =>
  new TextRun({ text: t, bold: true, size: sz, color, font: 'Calibri' });

const normal = (t, sz = 22, color = C.negro) =>
  new TextRun({ text: t, size: sz, color, font: 'Calibri' });

const italic = (t, sz = 22, color = C.gris) =>
  new TextRun({ text: t, italics: true, size: sz, color, font: 'Calibri' });

const br = () => new Paragraph({ children: [] });

const h1 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 32, color: C.blanco, font: 'Calibri' })],
  heading: HeadingLevel.HEADING_1,
  shading: { type: ShadingType.CLEAR, fill: C.azul },
  spacing: { before: 300, after: 200 },
});

const h2 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 26, color: C.azul, font: 'Calibri' })],
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 120 },
  border: { bottom: { color: C.azulCl, size: 6, style: BorderStyle.SINGLE } },
});

const h3 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 24, color: C.gris, font: 'Calibri' })],
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 180, after: 80 },
});

const p = (runs) => new Paragraph({
  children: Array.isArray(runs) ? runs : [normal(runs)],
  spacing: { after: 120, line: 276 },
});

const bullet = (runs) => new Paragraph({
  children: Array.isArray(runs) ? runs : [normal(runs)],
  bullet: { level: 0 },
  spacing: { after: 80 },
});

const divider = () => new Paragraph({
  border: { bottom: { color: C.azulCl, size: 4, style: BorderStyle.SINGLE } },
  spacing: { after: 160 },
});

const note = (text) => new Paragraph({
  children: [italic('⚠ Nota: ' + text, 20, C.naranja)],
  indent: { left: convertMillimetersToTwip(10) },
  spacing: { after: 120 },
});

// ─── Tabla helper ────────────────────────────────────────────────────────────
function tabla(headers, rows, colWidths) {
  const totalCols = headers.length;
  const defaultW = Math.floor(9000 / totalCols);
  const widths = colWidths || headers.map(() => defaultW);

  const makeCell = (text, isHeader, idx) => {
    const fill = isHeader ? C.azul : (idx % 2 === 0 ? C.blanco : C.azulCl);
    const textColor = isHeader ? C.blanco : C.negro;
    const isBold = isHeader;
    const content = String(text || '');
    return new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: content, bold: isBold, size: 18, color: textColor, font: 'Calibri' })],
        alignment: AlignmentType.LEFT,
        spacing: { before: 60, after: 60 },
      })],
      shading: { type: ShadingType.CLEAR, fill },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      width: { size: widths[0], type: WidthType.DXA },
    });
  };

  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, size: 18, color: C.blanco, font: 'Calibri' })],
        spacing: { before: 60, after: 60 },
      })],
      shading: { type: ShadingType.CLEAR, fill: C.azul },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      width: { size: widths[i] || defaultW, type: WidthType.DXA },
    })),
    tableHeader: true,
  });

  const dataRows = rows.map((row, rowIdx) => new TableRow({
    children: row.map((cell, colIdx) => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: String(cell || ''), size: 18, color: C.negro, font: 'Calibri' })],
        spacing: { before: 60, after: 60 },
      })],
      shading: { type: ShadingType.CLEAR, fill: rowIdx % 2 === 0 ? C.blanco : C.azulCl },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      width: { size: widths[colIdx] || defaultW, type: WidthType.DXA },
    })),
  }));

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 9000, type: WidthType.DXA },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });
}

// ─── Portada ─────────────────────────────────────────────────────────────────
function portada() {
  return [
    br(), br(), br(),
    new Paragraph({
      children: [new TextRun({ text: 'CareSignal', bold: true, size: 72, color: C.azul, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Respuestas a los 11 Criterios de Evaluación', bold: true, size: 36, color: C.gris, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'WomenCISO 4 / MenCISO 1 — Concurso de Innovación en IA y Ciberseguridad', size: 28, color: C.gris, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Agosto 2026  ·  Roberto García  ·  Fundador y Líder de Proyecto  ·  robertogarciaits@gmail.com  ·  linkedin.com/in/robertogarciaits  ·  844 588 1313', size: 24, color: C.gris, font: 'Calibri', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    divider(),
    new Paragraph({
      children: [bold('"MVP operacional, no dispositivo médico  ·  Datos ficticios"', 20, C.naranja)],
      alignment: AlignmentType.CENTER,
    }),
    br(), br(), br(),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ─── CRITERIO 1 ──────────────────────────────────────────────────────────────
function c1() {
  return [
    h1('Criterio 1 · Definición del problema, alineado con IA y ciberseguridad'),
    h2('El problema'),
    p([bold('17.1 millones'), normal(' de personas mayores de 60 años viven en México (CONAPO, 2025). Más de '), bold('1,297 residencias de cuidado'), normal(' operan en el país (DENUE, 2025), el 85% privadas, creciendo al '), bold('+18% interanual'), normal('. La mayoría opera con registros en papel o en hojas de cálculo. Cuando una ronda se retrasa, nadie lo sabe hasta que es demasiado tarde.')]),
    p([bold('El resultado:'), normal(' adultos mayores sin trazabilidad operativa. En un informe de la CNDH se documentaron condiciones de abandono, falta de personal y deficiencias operativas en residencias — consecuencia de no contar con '), bold('sistemas de gestión operativa'), normal(' que garanticen que el cuidado ocurrió, en el momento correcto, con la persona correcta. La NOM-031 exige registros permanentes y cualquier inspección, queja o demanda puede llegar sin aviso. Una multa bajo la Ley General de Salud puede superar los '), bold('$234,000 MXN'), normal(' — y eso es solo la primera.')]),
    h2('Contexto internacional — escala global del problema'),
    note('Se estima (fuentes: US Census Bureau, Statistics Japan, Destatis, UN World Population Prospects 2022). Datos no verificados directamente — declarar ante jueces.'),
    tabla(
      ['País / Región', 'Se estima personas 65+', '% de población', 'Fuente de referencia'],
      [
        ['México', '17.1 millones (60+)', '12.8 %', 'CONAPO 2025 ✅ verificado'],
        ['Estados Unidos', '~57 millones', '~17 %', 'US Census Bureau 2023'],
        ['Japón', '~36 millones', '~29 %', 'Statistics Japan 2023'],
        ['Alemania', '~18 millones', '~22 %', 'Destatis 2023'],
        ['América Latina (65+)', '~65 millones', '—', 'CEPAL / ONU 2024 ✅ verificado'],
        ['Global (total mundial)', '~771 millones', '~10 %', 'UN World Population Prospects 2022'],
        ['Proyección global 2050', '~1,600 millones', '~16 %', 'UN World Population Prospects 2022'],
      ],
      [2500, 2000, 1500, 3000]
    ),
    br(),
    h2('Por qué ahora — ventana de oportunidad 2026'),
    tabla(
      ['Fuerza', 'Dato clave', 'Implicación'],
      [
        ['Crecimiento del sector', '+18% interanual (DENUE 2024→2025)', 'Más residencias sin herramientas digitales'],
        ['NOM-031 sin fiscalización real', 'Menos del 4% supervisadas (CNDH, 2020)', 'Quien llega digitalizado llega protegido'],
        ['Envejecimiento acelerado', '17.1 M hoy → 20 M+ en 2030 (CONAPO)', 'Demanda crece más rápido que la oferta'],
      ],
      [2500, 3000, 3500]
    ),
    br(),
    h2('Alineación con IA y Ciberseguridad'),
    bullet([bold('Ciberseguridad: '), normal('Los datos de adultos mayores son datos sensibles bajo la LFPDPPP. Hoy viven en cuadernos, WhatsApp y correos sin cifrar. CareSignal los estructura y protege con arquitectura sobre '), bold('Google Cloud Run + Firebase'), normal(', cifrado TLS y acceso por rol.')]),
    bullet([bold('Inteligencia Artificial: '), normal('La bitácora de 20 tipos de evento que genera CareSignal es el insumo exacto para alertas predictivas, detección de anomalías y optimización de asignación. Funciones diseñadas para v0.2 sobre '), bold('BigQuery ML · Gemini API'), normal('. En v0.1.0 se excluyen por privacidad: primero la estructura de datos correcta.')]),
    divider(),
  ];
}

// ─── CRITERIO 2 ──────────────────────────────────────────────────────────────
function c2() {
  return [
    h1('Criterio 2 · Solución innovadora, viable y con impacto'),
    h2('La solución'),
    p([bold('CareSignal'), normal(' digitaliza el ciclo operativo completo de una ronda: programación → ejecución → detección de retrasos → alertas → escalación → verificación → cierre. No es un formulario — es un '), bold('sistema de trazabilidad operativa'), normal(' con una máquina de estados que impide transiciones inválidas.')]),
    h2('Por qué es viable'),
    bullet([bold('Sin fricción de adopción:'), normal(' funciona en el navegador, sin instalación, en el mismo teléfono que ya tiene el cuidador.')]),
    bullet([bold('Costo predecible:'), normal(' modelo por residencia, no por plaza. Sin sorpresas para el comprador.')]),
    bullet([bold('Respaldo normativo:'), normal(' la NOM-031-SSA3-2012 exige registros administrativos. CareSignal los genera como subproducto natural de la operación.')]),
    h2('Operación manual vs. CareSignal'),
    note('Estimados de referencia; no datos medidos en campo'),
    tabla(
      ['Actividad', 'Modo manual', 'Con CareSignal'],
      [
        ['Registrar una ronda', '4–6 min · planilla en papel', '~1 min · 3 acciones en pantalla'],
        ['Detectar ronda atrasada', 'Al final del turno o nunca', 'Automático en tiempo real'],
        ['Escalar alerta al supervisor', 'Llamada o búsqueda física', 'Inmediato, trazable, con actor registrado'],
        ['Preparar reporte del turno', '20–30 min de transcripción', 'Generado como subproducto de la operación'],
      ],
      [2500, 3000, 3500]
    ),
    br(),
    p([normal('Una residencia de 50 residentes realiza '), bold('~450 rondas por semana'), normal('. A 5 min de overhead manual, son '), bold('~37 horas semanales'), normal(' de registro sin valor operativo. Con CareSignal baja a menos de 8 horas — y el registro es auditable.')]),
    h2('Innovación frente a competidores reales'),
    tabla(
      ['Lo que los competidores cubren', 'Lo que ninguno cubre', 'Lo que CareSignal agrega'],
      [
        ['Expediente de residente', 'Rondas con estados formales', 'Programación → retraso detectado automáticamente'],
        ['Control de medicamentos', 'Alertas por incumplimiento', 'Alerta automática con timestamp y actor'],
        ['Facturación y cobros', 'Escalación trazable', 'Escalación con historial de propietario de alerta'],
        ['Portal familiar', 'Auditoría inmutable del turno', 'Bitácora append-only: 20 tipos de evento'],
      ],
      [2800, 3000, 3200]
    ),
    br(),
    divider(),
  ];
}

// ─── CRITERIO 3 ──────────────────────────────────────────────────────────────
function c3() {
  return [
    h1('Criterio 3 · Conocimiento del mercado'),
    h2('Dimensión y crecimiento del mercado'),
    tabla(
      ['Indicador', 'Valor actual', 'Proyección', 'Fuente'],
      [
        ['Personas 60+ en México', '17.1 M (12.8%)', '~28 M en 2040 · ~33 M en 2050', 'CONAPO / INAPAM'],
        ['Personas 65+ en LatAm', '~65 millones', '~138 M en 2050 (18.9%)', 'CEPAL / OPS'],
        ['Dependencia de cuidados LatAm', '~8 millones', 'Se triplica hacia 2050', 'BID / OPS'],
        ['Déficit de cuidadores LatAm', '3 M hoy vs. 14 M necesarios', 'Brecha de 11 M', 'BID'],
        ['Cuidado no remunerado MX', '26.3% del PIB', '—', 'INEGI (ENUT)'],
        ['Mercado geriátrico MX', 'USD 20.6 B', 'USD 37.6 B en 2034 (CAGR 6.7%)', 'IMARC Group ⚠'],
        ['Long-Term Care MX', 'USD 25.6 B', 'USD 43.9 B en 2033 (CAGR 6.6%)', 'Grand View Research ⚠'],
        ['Residencias privadas MX', '~1,297–1,500', '+18% interanual', 'DENUE 2025 / INEGI'],
      ],
      [2500, 1800, 2500, 2200]
    ),
    note('IMARC Group y Grand View Research son firmas privadas de investigación de mercado, no fuentes oficiales.'),
    h2('TAM / SAM / SOM — dos líneas de mercado'),
    tabla(
      ['Nivel', 'Línea', 'Estimación', 'Lógica'],
      [
        ['TAM', 'Cuidados y tecnología geriátrica MX + LatAm', 'Decenas de miles de millones USD', 'LTC solo en MX supera USD 25 B'],
        ['SAM B2B', 'Residencias privadas formales en México con capacidad SaaS', '~1,100–1,300 residencias', 'DENUE 2025 · segmento con presupuesto y NOM-031'],
        ['SAM B2C', 'Familias mexicanas con cuidado activo de adulto mayor', '~2M familias', 'CONAPO 2025 · hijos que coordinan cuidado a distancia'],
        ['SOM', 'Captura realista en 3–5 años (ciclo B2B + freemium B2C)', '50–200 residencias + 5,000–20,000 familias', 'Pilotos B2B + autoservicio freemium B2C'],
      ],
      [1200, 3000, 2500, 2300]
    ),
    br(),
    h2('Revenue potencial del SOM — precios sweet-spot'),
    tabla(
      ['Escenario', 'Residencias', 'Plan promedio', 'MRR estimado'],
      [
        ['Pesimista', '25–35', 'Esencial ($1,990/mes)', '~$50k–$70k MXN/mes'],
        ['Equilibrado ⭐', '80–120', 'Profesional ($3,990/mes) — sweet spot', '~$319k–$479k MXN/mes'],
        ['Positivo', '180–250', 'Mix Profesional + Institucional ($8,490)', '~$717k–$997k MXN/mes'],
      ],
      [2000, 1800, 2800, 2400]
    ),
    note('Freemium $0 no genera MRR directo — reduce CAC y acelera conversión a planes pagos. Margen bruto estimado > 80%.'),
    br(),
    h2('Análisis de competencia — mercado mexicano (agosto 2026)'),
    tabla(
      ['Competidor', 'Origen', 'Presencia MX', 'Enfoque', 'Precio publicado'],
      [
        ['Cronos Care', 'México', '+50 residencias activas', 'Residentes, medicamentos, personal, pagos', 'No'],
        ['GERIGES', 'España (localiz. MX)', 'Versión .com/mx/', 'Expediente clínico, PAI/PIA, medicación, turnos', 'No'],
        ['StoriiCare', 'EE.UU.', 'Sin confirmar en MX', 'EHR, eMAR, IA integrada, EVV GPS', 'No'],
        ['Papel / hoja de cálculo', '—', 'Predominante', '—', '—'],
        ['CareSignal', 'México', 'MVP listo para Cloud Run', 'Ciclo operativo de ronda con máquina de estados', '✅ Freemium $0 + 3 planes ($1,990–$8,490)'],
      ],
      [1800, 1500, 2000, 2700, 1000]
    ),
    br(),
    p([bold('El hueco confirmado:'), normal(' Cronos Care y GERIGES son sistemas de '), bold('expediente y administración'), normal('. Ninguno modela el ciclo operativo de la ronda con estados formales, alertas automáticas ni escalación trazable. CareSignal es el único con precio publicado y el único específicamente diseñado para ese ciclo.')]),
    divider(),
  ];
}

// ─── CRITERIO 4 ──────────────────────────────────────────────────────────────
function c4() {
  return [
    h1('Criterio 4 · Propuesta de valor'),
    new Paragraph({
      children: [new TextRun({
        text: '"CareSignal es la única plataforma de trazabilidad operativa diseñada específicamente para residencias de adultos mayores en México: en español, sin instalación, con auditoría inmutable, doble validación documental y lista para Google Cloud Run."',
        bold: true, italics: true, size: 24, color: C.azul, font: 'Calibri',
      })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.CLEAR, fill: C.azulCl },
      spacing: { before: 200, after: 200 },
      indent: { left: convertMillimetersToTwip(10), right: convertMillimetersToTwip(10) },
    }),
    h2('Diferenciadores frente a competidores reales'),
    tabla(
      ['Diferenciador', 'Cronos Care', 'GERIGES', 'CareSignal'],
      [
        ['Rondas con máquina de estados', '❌', '❌', '✅'],
        ['Alerta automática por retraso', '❌', '❌', '✅'],
        ['Escalación con actor registrado', '❌', '❌', '✅'],
        ['Auditoría inmutable append-only', '❌', '❌', '✅'],
        ['Precio publicado', '❌', '❌', '✅'],
        ['Alineado con NOM-031 operativa', '⚠ Parcial', '⚠ Parcial', '✅'],
      ],
      [3000, 2000, 2000, 2000]
    ),
    br(),
    h2('Qué compra la residencia — tres cosas concretas'),
    bullet([bold('Tranquilidad ante la familia:'), normal(' cuando preguntan "¿qué pasó a las 3 am con mi mamá?", CareSignal tiene la respuesta en segundos.')]),
    bullet([bold('Protección ante una inspección:'), normal(' la NOM-031 exige registros. CareSignal los genera como subproducto de la operación diaria — sin trabajo extra.')]),
    bullet([bold('Control operativo en tiempo real:'), normal(' el supervisor ve el retraso en el momento en que ocurre, no una hora después.')]),
    h2('Por qué no es sustituible por lo que ya tienen'),
    bullet([bold('WhatsApp:'), normal(' sin estados auditables, sin historial inmutable, sin reportes.')]),
    bullet([bold('Hoja de cálculo:'), normal(' no detecta retrasos en tiempo real ni escala alertas automáticamente.')]),
    bullet([bold('Sistema clínico hospitalario:'), normal(' cuesta 5–10× más, requiere capacitación extensa, diseñado para hospitales no para residencias.')]),
    divider(),
  ];
}

// ─── CRITERIO 5 ──────────────────────────────────────────────────────────────
function c5() {
  return [
    h1('Criterio 5 · Progreso del producto: prototipo o demo'),
    h2('Estado del MVP'),
    p([bold('CareSignal v0.1.0-workshop'), normal(' es un MVP funcional completo, construido en 8 fases con aprobación humana en cada gate, con auditoría de calidad '), bold('PASS')]),
    tabla(
      ['Métrica', 'Resultado'],
      [
        ['Fases de construcción completadas', '8 de 8 ✅'],
        ['Pruebas de aceptación del contrato', '20 de 20 ✅'],
        ['Pruebas automatizadas', '38 de 38 ✅'],
        ['Hallazgos blocker', '0'],
        ['Hallazgos high', '1, corregido antes del release'],
        ['Paquete de producción', '~225 KB JS (~68 KB comprimido)'],
      ],
      [4500, 4500]
    ),
    br(),
    h2('Qué puede hacer hoy mismo — en menos de 5 minutos'),
    bullet(normal('Ver el dashboard del supervisor con residentes, rondas y alertas activas.')),
    bullet(normal('Iniciar sesión como cuidador, ejecutar una ronda y completarla.')),
    bullet(normal('Observar cómo el reloj simulado genera retrasos y dispara alertas automáticamente.')),
    bullet(normal('Escalar una alerta, asignarla a otro cuidador, verificarla y cerrarla con resultado.')),
    bullet(normal('Consultar la bitácora de auditoría completa con cada acción, actor y timestamp.')),
    p([bold('Todo sin instalación, sin cuenta, sin conexión a internet.')]),
    divider(),
  ];
}

// ─── CRITERIO 6 ──────────────────────────────────────────────────────────────
function c6() {
  return [
    h1('Criterio 6 · Comunicación clara, visual y segura'),
    h2('Claridad para el usuario final'),
    bullet([bold('Tres acciones máximo'), normal(' para completar una ronda normal — sin menús profundos.')]),
    bullet([bold('Semáforo visual'), normal(' (verde/amarillo/rojo) para el estado de cada residente.')]),
    bullet([bold('Avisos obligatorios:'), normal(' "MVP operacional, no dispositivo médico" y "Datos ficticios".')]),
    bullet([bold('Accesibilidad de teclado'), normal(' verificada en QA C8 — navegación completa sin ratón (WCAG 2.1 AA).')]),
    h2('Documentación en tres niveles'),
    tabla(
      ['Nivel', 'Documento', 'Para quién'],
      [
        ['Ejecutivo', 'README.md — executive summary', 'Juez, inversionista'],
        ['Operativo', 'WORKSHOP_DEMO_SCRIPT.md — guion de demo de 5 min', 'Evaluador técnico'],
        ['Técnico', 'docs/00 al docs/10 — contrato, taxonomía, máquina de estados, pruebas', 'Desarrollador, auditor'],
      ],
      [1800, 4200, 3000]
    ),
    br(),
    h2('Seguridad en la comunicación'),
    bullet([bold('Sin datos reales:'), normal(' la aplicación opera exclusivamente con datos ficticios generados por el sistema.')]),
    bullet([bold('Cifrado en tránsito y reposo:'), normal(' arquitectura de producción en Google Cloud Run + Firebase, TLS, sin canales inseguros.')]),
    bullet([bold('Material comercial versionado:'), normal(' deck y dossier en el repositorio — no circulan en canales no controlados.')]),
    divider(),
  ];
}

// ─── CRITERIO 7 ──────────────────────────────────────────────────────────────
function c7() {
  return [
    h1('Criterio 7 · Trabajo en equipo: roles y colaboración'),
    h2('Estructura del equipo — 5 roles requeridos'),
    p([bold('Roberto García'), normal(' lidera el proyecto en calidad de Fundador y Líder de Proyecto. La complejidad del MVP — dominio formal, contrato congelado, pruebas de aceptación y material comercial — exige cinco roles diferenciados:')]),
    tabla(
      ['Rol', 'Responsabilidad', 'Evidencia en el repositorio'],
      [
        ['Líder / Product Owner', 'Visión, contrato, aprobación de cada fase', 'contract/ · CHANGELOG.md'],
        ['Arquitecto de software', 'Dominio, máquina de estados, modelo de datos', 'src/domain/ · docs/00–03'],
        ['Desarrollador full-stack', 'React + TypeScript · motor temporal · escenarios', 'src/ · tests/'],
        ['QA / Auditor de calidad', '20 pruebas de aceptación · 38 automatizadas', 'docs/04 · tests/'],
        ['Diseñador de UX', 'Flujos de cuidador y supervisor · accesibilidad', 'src/pages/ · src/components/'],
      ],
      [2500, 3500, 3000]
    ),
    br(),
    h2('Gate reviews como colaboración estructurada'),
    tabla(
      ['Práctica de equipo convencional', 'Equivalente en CareSignal'],
      [
        ['Definición de requisitos en equipo', 'Contrato congelado con taxonomía YAML y reglas explícitas'],
        ['Revisión de arquitectura por pares', 'Gate C2: criterios formales antes de escribir UI'],
        ['Code review', 'Gate reviews C3–C7: criterios de aceptación por fase en CHANGELOG.md'],
        ['QA independiente', 'Gate C8: auditoría de 20 pruebas de contrato en rol separado'],
        ['Retrospectiva de equipo', 'docs/05-known-limitations.md: hallazgos para versiones futuras'],
      ],
      [4000, 5000]
    ),
    br(),
    h2('Evidencia por fase — quién hizo qué y cuándo'),
    tabla(
      ['Fase', 'Rol ejercido', 'Entregable', 'Resultado'],
      [
        ['C1 · Contrato', 'Líder / Product Owner', 'Contrato v0.1.0, taxonomía YAML', '✅ Gate C1 aprobado'],
        ['C2 · Dominio', 'Arquitecto', 'types.ts, rules.ts, máquina de estados', '✅ Gate C2 — compila, sin any'],
        ['C3 · Datos', 'Desarrollador', 'Datos de semilla, repositorio, reloj', '✅ Gate C3 — IDs coherentes'],
        ['C4 · Shell', 'Desarrollador + UX', '5 páginas, navegación, sesión', '✅ Gate C4 — 5 páginas vivas'],
        ['C5 · Cuidador', 'Desarrollador + UX', 'Flujo ronda en ≤ 3 acciones', '✅ Gate C5 — sin duplicados'],
        ['C6 · Supervisor', 'Arquitecto + Dev', 'Alerta → verificación → cierre', '✅ Gate C6 — auditoría visible'],
        ['C7 · Motor temporal', 'Arquitecto + Dev', 'Escenarios deterministas < 5 min', '✅ Gate C7 — reproducible'],
        ['C8 · QA / Release', 'QA / Auditor', '20/20 contrato · 38/38 auto · 0 blockers', '✅ Gate C8 — PASS'],
      ],
      [2000, 2000, 3000, 2000]
    ),
    br(),
    divider(),
  ];
}

// ─── CRITERIO 8 ──────────────────────────────────────────────────────────────
function c8() {
  return [
    h1('Criterio 8 · Innovación y creatividad'),
    h2('Cuatro planos de innovación simultáneos'),
    tabla(
      ['Plano', 'Tipo de innovación', 'Tipo de creatividad', 'En qué consiste'],
      [
        ['1. La solución', 'De producto + de acceso al mercado', 'Combinatoria', 'Trazabilidad de sectores regulados aplicada por primera vez al dominio de residencias MX'],
        ['2. Integración de IA', 'De proceso — datos primero, inferencia después', 'Exploratoria', 'Bitácora de 20 tipos de evento como base para modelos predictivos en BigQuery ML'],
        ['3. Ciberseguridad activa', 'Tecnológica — seguridad continua vs. pasiva', 'Transformacional', 'Agente IA de ciberseguridad que convierte el cifrado en monitoreo activo 24/7'],
        ['4. Arquitectura event-driven', 'Tecnológica — vanguardia en sector monolítico', 'Combinatoria', 'Principios CNCF / Google Cloud Framework aplicados a un MVP de nicho con recursos mínimos'],
      ],
      [1800, 2200, 2000, 3000]
    ),
    br(),
    h2('Funciones de IA planificadas — roadmap v0.2'),
    tabla(
      ['Función de IA', 'Tipo de modelo', 'Problema que resuelve'],
      [
        ['Alertas predictivas', 'Supervisado', 'Anticipa riesgo por residente basado en histórico de rondas'],
        ['Detección de anomalías', 'No supervisado', 'Detecta desviaciones del protocolo vs. máquina de estados'],
        ['Optimización de asignación', 'Optimización', 'Minimiza tiempos de respuesta distribuyendo carga de cuidadores'],
        ['Resumen ejecutivo de turno', 'Generativa', 'Genera el reporte de traspaso desde los eventos — sin transcripción'],
      ],
      [2500, 2000, 4500]
    ),
    br(),
    p([bold('Plataforma:'), normal(' BigQuery ML · Gemini API (vía Vertex AI). La arquitectura ya está lista para recibirlas. No es especulación — es diseño presente.')]),
    divider(),
  ];
}

// ─── CRITERIO 9 ──────────────────────────────────────────────────────────────
function c9() {
  return [
    h1('Criterio 9 · Factibilidad técnica y financiera'),
    h2('Factibilidad técnica — evidencia del MVP'),
    tabla(
      ['Evidencia', 'Detalle'],
      [
        ['Stack probado', 'React 18 + TypeScript estricto, Vite, sin dependencias no estándar'],
        ['Build de producción', '~225 KB JS (~68 KB comprimido) — carga en cualquier conexión'],
        ['Pruebas automatizadas', '38 pruebas, 0 fallos'],
        ['Sin deuda técnica bloqueante', '0 hallazgos blocker · 1 high corregido antes del release'],
        ['Accesibilidad', 'WCAG 2.1 AA verificada en QA C8'],
      ],
      [3500, 5500]
    ),
    br(),
    h2('Costos de infraestructura — Google Cloud (33 clientes)'),
    tabla(
      ['Servicio', 'Uso estimado/mes', 'Costo USD/mes'],
      [
        ['Cloud Run (API FastAPI)', '~5M solicitudes', '~$15–25'],
        ['Cloud Run (Worker Pub/Sub)', '~200K eventos', '~$5–10'],
        ['Firestore', '~6M lecturas · ~2M escrituras', '~$15–25'],
        ['Pub/Sub', '~200K mensajes', '~$1'],
        ['BigQuery', '~200 MB activos · ~50 GB consultas', '<$1'],
        ['Firebase Auth', 'Hasta 10K usuarios activos', 'Gratis'],
        ['Total estimado', '', '~$37–62 USD/mes'],
      ],
      [3000, 3500, 2500]
    ),
    br(),
    h2('Costos de agentes IA — Gemini API (33 clientes)'),
    tabla(
      ['Agente / Modelo', 'Descripción', 'Costo estimado USD/mes'],
      [
        ['Agente de ciberseguridad', 'Monitoreo continuo · cada 5 min · 24/7 · ~8,640 ejecuciones/mes/residencia', '~$8–10'],
        ['Agente de soporte RAG', 'Chatbot admin + cuidador · ~15,000 consultas/mes a 33 clientes', '~$3–5'],
        ['Modelos operativos v0.2', 'Alertas predictivas · anomalías · asignación · BigQuery ML', '~$18–22'],
        ['Total IA', '', '~$29–37 USD/mes'],
      ],
      [2800, 4000, 2200]
    ),
    br(),
    h2('Factibilidad financiera — modelo de ingresos y margen'),
    tabla(
      ['Plan', 'Precio MXN/mes', 'Mercado objetivo'],
      [
        ['Esencial', '$1,490', 'Residencias pequeñas (hasta 25 residentes)'],
        ['Profesional', '$3,490', 'Residencias medianas (hasta 75 residentes)'],
        ['Institucional', '$6,990', 'Cadenas y residencias grandes'],
      ],
      [2000, 2000, 5000]
    ),
    br(),
    p([bold('Escenario conservador 3% de penetración (~33 residencias):'), normal(' Ingreso mensual ~$80,000 MXN · Infraestructura total ~$66–99 USD/mes · '), bold('Margen bruto >97%'), normal('. El modelo es rentable desde el primer cliente.')]),
    h2('Roadmap de versiones'),
    tabla(
      ['Versión', 'Plazo', 'Qué incluye', 'Hito clave'],
      [
        ['v0.1.0 ✅', 'Agosto 2026', 'MVP demo · localStorage · 38 pruebas · 0 blockers', 'Concurso WomenCISO/MenCISO'],
        ['v1.0', 'Q1 2027', 'Google Cloud Run + Firebase · auth real · multi-tenant · WebSockets', 'Primer cliente de pago'],
        ['v0.2', 'Q3 2027', 'Agentes IA · BigQuery ML · agente ciberseg. 24/7', 'IA en producción con datos reales'],
      ],
      [1500, 1500, 4000, 2000]
    ),
    br(),
    divider(),
  ];
}

// ─── CRITERIO 10 ─────────────────────────────────────────────────────────────
function c10() {
  return [
    h1('Criterio 10 · Valor al usuario y al dueño'),
    h2('Los tres usuarios — dolor y solución'),
    tabla(
      ['Usuario', 'Dolor principal', 'Lo que CareSignal resuelve', 'Resultado'],
      [
        ['Cuidador', 'Responsabilidad sin evidencia · transcripción al final del turno · miedo a la queja', 'Registro en 3 acciones desde el teléfono · el sistema lo protege', 'Su trabajo queda documentado con actor, hora y resultado'],
        ['Supervisor', 'Gestión reactiva · sin visibilidad en tiempo real · rondas atrasadas que nadie avisa', 'Dashboard en tiempo real · alertas automáticas · un clic para asignar', 'Pasa de reaccionar a anticipar'],
        ['Dueño / Director', 'Riesgo legal sin evidencia · inspecciones sin registros · demandas sin defensa', 'Bitácora inmutable · doble validación documental · registros automáticos NOM-031', 'Evidencia lista ante queja, inspección o demanda civil'],
      ],
      [1500, 2500, 2500, 2500]
    ),
    br(),
    h2('La sincronía entre turnos — el momento de mayor riesgo'),
    p([normal('El '), bold('cambio de turno'), normal(' es el instante de mayor riesgo operativo: toda la información del turno saliente debe transferirse al entrante sin perderse ni olvidarse.')]),
    tabla(
      ['Qué se necesita transferir', 'Sin CareSignal', 'Con CareSignal'],
      [
        ['Rondas pendientes o incompletas', 'El cuidador lo menciona de memoria — se olvida', 'Dashboard en tiempo real — visibles desde el primer segundo'],
        ['Alertas activas y su estado', 'Anotado en cuaderno o dicho de palabra', 'Bitácora con actor, hora y última acción'],
        ['Cuidados programados', 'Lista en papel o grupo de WhatsApp', 'Motor temporal — agenda sin transcripción'],
        ['Novedades de cada residente', 'Transmisión verbal — depende de quien esté', 'Accesible por residente — sin buscar cuadernos'],
      ],
      [2500, 3000, 3500]
    ),
    br(),
    h2('Control documental — del papel sin gestión a la doble validación'),
    tabla(
      ['Elemento', 'Sin CareSignal', 'Con CareSignal'],
      [
        ['Formato de registro', 'Papel o cuaderno sin versión controlada', 'Estandarizado · imprimible desde el sistema'],
        ['Respaldo del registro', 'Solo el papel — si se pierde, se pierde', 'Copia digital inmutable con mismo timestamp'],
        ['Localización de registro histórico', 'Búsqueda manual en archivos físicos', 'Búsqueda en sistema — segundos'],
        ['Revisión administrativa', 'Presencial · periódica · con info desactualizada', 'Programada · con agenda definida'],
        ['Validación del director', 'Solo firma física · sin registro de cuándo', 'Firma digital + firma física — doble validación'],
      ],
      [2500, 3000, 3500]
    ),
    br(),
    h2('Riesgo potencial — casos reales y marco sancionatorio'),
    tabla(
      ['Caso', 'Fecha', 'Consecuencia'],
      [
        ['Asilo Santa Sofía, SLP', 'Mayo 2025', 'Clausura definitiva · 10 residentes rescatados · intervención de la Fiscalía estatal'],
        ['Casa de reposo, CDMX', 'Diciembre 2024', 'Denuncia pública viral · investigación abierta'],
        ['"La Aldea de los Abuelos", SLP', 'Mayo 2025', 'Inspección solicitada · exposición mediática'],
      ],
      [2500, 1500, 5000]
    ),
    br(),
    h2('El costo del riesgo vs. el costo de la solución'),
    tabla(
      ['Escenario de riesgo', 'Costo estimado', 'CareSignal 12 meses', 'Diferencia'],
      [
        ['Multa leve Art. 419 LGS', '~$234,620 MXN', '$17,880 MXN', '13× el costo anual'],
        ['Multa grave Art. 420 LGS', 'hasta $703,860 MXN', '$17,880 MXN', '39× el costo anual'],
        ['Clausura · 6 meses de ingresos', '~$1,920,000 MXN', '$17,880 MXN', '107× el costo anual'],
        ['Honorarios de abogado defensor', '$50,000–$150,000 MXN', '$17,880 MXN', '3–8× el costo anual'],
      ],
      [2800, 2500, 2000, 1700]
    ),
    br(),
    p([bold('CareSignal cuesta menos del 0.5% del ingreso mensual de la residencia'), normal(' y genera la evidencia que puede evitar o defender todos los escenarios anteriores. UMA 2026 = $117.31/día (INEGI).')]),
    divider(),
  ];
}

// ─── CRITERIO 11 ─────────────────────────────────────────────────────────────
function c11() {
  return [
    h1('Criterio 11 · Framework de ciberseguridad'),
    p([normal('Los datos de residentes — condición física, historial, incidentes, identidad — son '), bold('datos sensibles'), normal(' bajo la LFPDPPP. CareSignal alinea su framework con el '), bold('NIST Cybersecurity Framework (NIST CSF)'), normal(' e '), bold('ISO 27001'), normal(', implementados a través de Google Cloud Platform, en tres capas: diseño, infraestructura y monitoreo activo.')]),
    h2('Alineación con NIST CSF — las 5 funciones'),
    tabla(
      ['Función NIST CSF', 'Descripción', 'Cómo CareSignal la implementa'],
      [
        ['Identificar', 'Conocer activos y riesgos', 'Inventario de datos sensibles · clasificación LFPDPPP · evaluación de riesgo por rol'],
        ['Proteger', 'Controles de acceso y cifrado', 'Firebase Security Rules · TLS 1.3 · AES-256 · acceso por rol · datos ficticios en demo'],
        ['Detectar', 'Monitoreo de anomalías', 'Agente IA ciberseguridad · análisis bitácora cada 5 min · Cloud Audit Logs'],
        ['Responder', 'Acción ante incidentes', 'Alertas automáticas al administrador · reporte de seguridad por turno'],
        ['Recuperar', 'Continuidad y respaldo', 'Backup digital · sincronización Firestore · historial inmutable'],
      ],
      [2000, 2500, 4500]
    ),
    br(),
    h2('Las tres capas del framework'),
    tabla(
      ['Capa', 'Qué protege', 'Mecanismo', 'Estado'],
      [
        ['Diseño (Privacy by Design)', 'Superficie de ataque y exposición de datos', 'Cloud-ready · dominio puro · datos ficticios · sin APIs externas', 'v0.1.0 — listo para Cloud Run'],
        ['Infraestructura (Google Cloud)', 'Datos en tránsito y en reposo', 'TLS 1.3 · AES-256 · Firebase Rules · aislamiento por residencia', 'v1.0 producción'],
        ['Monitoreo activo (Agente IA)', 'Integridad de la operación 24/7', 'Gemini API (Vertex AI) · análisis continuo de la bitácora', 'v0.2 roadmap'],
      ],
      [2200, 2500, 2800, 1500]
    ),
    br(),
    h2('Controles de seguridad en producción — Google Cloud'),
    tabla(
      ['Control', 'Tecnología', 'Ataque que mitiga'],
      [
        ['Cifrado en tránsito', 'TLS 1.3 (Cloud Run + Firebase)', 'Intercepción de datos en red (MITM)'],
        ['Cifrado en reposo', 'AES-256 (Firestore + BigQuery)', 'Acceso físico no autorizado al almacenamiento'],
        ['Acceso por rol', 'Firebase Security Rules', 'Un cuidador no puede ver datos de otra residencia'],
        ['Aislamiento por residencia', 'Reglas de Firestore por tenant', 'Filtración entre clientes (data leakage)'],
        ['Autenticación', 'Firebase Auth (MFA disponible)', 'Acceso con credenciales robadas'],
        ['Auditoría de acceso', 'Cloud Audit Logs', 'Detecta accesos anómalos a datos de producción'],
        ['Certificaciones', 'ISO 27001 · SOC 2 Type II · GDPR', 'Cumplimiento normativo demostrable ante inspección'],
      ],
      [2500, 3000, 3500]
    ),
    br(),
    h2('Agente IA de ciberseguridad — monitoreo activo vs. control pasivo'),
    tabla(
      ['Capacidad', 'Control pasivo tradicional', 'Agente IA CareSignal (v0.2)'],
      [
        ['Detección de anomalías en bitácora', 'Manual · revisión periódica', 'Automática · cada 5 minutos · 24/7'],
        ['Secuencias imposibles de eventos', 'No detectadas hasta auditoría', 'Detectadas en tiempo real vs. máquina de estados'],
        ['Accesos fuera de horario', 'Log disponible · nadie lo revisa', 'Alerta inmediata al administrador'],
        ['Verificación de configuración', 'Manual · ocasional', 'Automática · reglas Firebase · permisos Cloud Run'],
        ['Reporte de seguridad al director', 'No existe', 'Generado automáticamente por turno o semana'],
        ['Costo a 33 clientes', '—', '~$8–10 USD/mes (Gemini Flash)'],
      ],
      [2800, 3000, 3200]
    ),
    br(),
    new Paragraph({
      children: [new TextRun({
        text: '"CareSignal no añadió seguridad como feature de marketing — la construyó como restricción de diseño. El MVP está listo para Google Cloud Run: activar la capa de infraestructura despliega TLS, cifrado, aislamiento y auditoría sin tocar una línea de dominio ni de UI."',
        bold: true, italics: true, size: 22, color: C.azul, font: 'Calibri',
      })],
      shading: { type: ShadingType.CLEAR, fill: C.azulCl },
      spacing: { before: 160, after: 160 },
      indent: { left: convertMillimetersToTwip(10), right: convertMillimetersToTwip(10) },
    }),
    divider(),
  ];
}

// ─── CIERRE ──────────────────────────────────────────────────────────────────
function cierre() {
  return [
    h1('Datos del proyecto y disclaimer'),
    tabla(
      ['Dato', 'Valor'],
      [
        ['Proyecto', 'CareSignal v0.1.0-workshop'],
        ['Líder', 'Roberto García — Fundador / Product Owner / Arquitecto / Desarrollador / QA / UX'],
        ['Concurso', 'WomenCISO 4 / MenCISO 1 — Innovación en IA y Ciberseguridad'],
        ['Fecha de entrega', 'Domingo 6 de septiembre de 2026'],
        ['Repositorio', 'GitHub (pendiente de publicar — E3.2)'],
        ['Stack', 'React 18 + TypeScript · Vite · Vitest · Google Cloud Run · Firebase · BigQuery'],
        ['Fuentes de cifras', 'CONAPO · DENUE · BID · CEPAL · INEGI · IMARC Group · Grand View Research · LGS'],
      ],
      [3500, 5500]
    ),
    br(),
    new Paragraph({
      children: [new TextRun({
        text: 'MVP operacional, no dispositivo médico · Datos ficticios · No apto para uso clínico, diagnóstico ni emergencias',
        bold: true, size: 20, color: C.naranja, font: 'Calibri',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
    }),
  ];
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const doc = new Document({
    creator: 'Roberto García',
    title: 'CareSignal — Respuestas a los 11 Criterios WomenCISO 4 / MenCISO 1',
    description: 'Documento de evaluación para el concurso de innovación en IA y ciberseguridad',
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22, color: C.negro } },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(20),
            bottom: convertMillimetersToTwip(20),
            left: convertMillimetersToTwip(22),
            right: convertMillimetersToTwip(22),
          },
        },
      },
      children: [
        ...portada(),
        ...c1(),
        ...c2(),
        ...c3(),
        ...c4(),
        ...c5(),
        ...c6(),
        ...c7(),
        ...c8(),
        ...c9(),
        ...c10(),
        ...c11(),
        ...cierre(),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'business', 'CareSignal_Criterios_Concurso_v1.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Documento generado:', outPath);
}

main().catch(err => { console.error('❌', err); process.exit(1); });
