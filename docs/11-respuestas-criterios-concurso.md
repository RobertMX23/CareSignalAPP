# 11 — Respuestas a los criterios de evaluación WomenCISO 4 / MenCISO 1

> Textos de presentación para cada uno de los 11 criterios de la Guía Oficial de
> Entrega de Proyectos. Fuente de cifras: `09-datos-mercado.md`.
>
> Última actualización: **25 de agosto de 2026**

---

## Criterio 1 · Definición del problema, alineado con IA y ciberseguridad

### El problema

México tiene **17.1 millones de personas mayores de 60 años** (CONAPO, 2025) y más de
**1,297 residencias de cuidado registradas** (DENUE, 2025), de las cuales el 85% son
privadas. El sector crece a un ritmo del 18% interanual — y opera mayoritariamente con
registros en papel o en hojas de cálculo.

En una residencia de cuidado, cada turno exige completar rondas de verificación con cada
residente: hidratación, movilidad, alimentación, estado general. Cuando una ronda se
retrasa o no se registra, nadie lo sabe hasta que es demasiado tarde. El personal no
tiene visibilidad en tiempo real. El supervisor no puede actuar sobre lo que no ve.

**El resultado:** adultos mayores en condición de vulnerabilidad, sin trazabilidad
operativa, en instalaciones que la CNDH supervisó en menos del 4% de los casos durante
la pandemia (Informe CNDH ISP-12/2020).

### Por qué ahora

El sector no está en equilibrio estable — está en aceleración. Tres fuerzas convergen en
2026 y crean una ventana de oportunidad que no existía hace dos años:

| Fuerza | Dato | Implicación |
|---|---|---|
| Crecimiento del sector | +18% interanual en establecimientos registrados (DENUE 2024→2025) | Más residencias sin herramientas — el mercado se amplía mientras la oferta digital es casi nula |
| NOM-031-SSA3-2012 vigente sin fiscalización real | Menos del 4% de centros supervisados (CNDH, 2020) | La norma existe, la inspección aumentará — quien llegue digitalizado llega protegido |
| Envejecimiento acelerado | 17.1 M mayores hoy → 20 M+ en 2030 (CONAPO) | La demanda de cuidado crece más rápido que la capacidad instalada; la presión familiar sobre las residencias también |

La combinación de crecimiento acelerado + marco normativo sin cumplimiento generalizado
crea el momento exacto para una solución de trazabilidad operativa: antes de que la
fiscalización se intensifique, no después.

### La alineación con IA y ciberseguridad

**Ciberseguridad:** Los datos de adultos mayores — su condición física, sus incidentes,
su historial de atención — son **datos sensibles** bajo la LFPDPPP. Hoy esos datos viven
en cuadernos, en WhatsApp, en correos sin cifrar. CareSignal los estructura, los protege
y los hace auditables, con una arquitectura de producción sobre **Google Cloud Run +
Firebase**, con cifrado en tránsito y en reposo, y reglas de acceso por rol.

**Inteligencia Artificial:** La bitácora de eventos operativos que CareSignal genera —
20 tipos de evento por ronda, alerta e incidente — es el insumo exacto para modelos
predictivos: anticipar qué residente tiene mayor probabilidad de requerir atención no
programada, detectar anomalías en los tiempos de respuesta, optimizar la asignación de
cuidadores por turno. Esas funciones están diseñadas para v0.2, sobre **BigQuery ML ·
Gemini API (vía Vertex AI)**. La decisión de excluirlas de v0.1.0 fue deliberada: primero la estructura
de datos correcta, luego la inferencia sobre ella.

---

## Criterio 2 · Solución innovadora, viable y con impacto

### La solución

CareSignal es una aplicación web operativa para residencias de cuidado de adultos mayores
que digitaliza el ciclo completo de una ronda: programación, ejecución, detección de
retrasos, alertas, escalación, verificación y cierre con registro de resultado. Todo en
tiempo real, para cuidadores y supervisores, desde cualquier dispositivo con navegador.

No es un formulario. Es un **sistema de trazabilidad operativa** con una máquina de
estados que impide transiciones inválidas — una ronda completada no puede volverse
atrasada; una alerta no puede cerrarse sin resultado verificado — garantizando que el
registro refleje lo que realmente ocurrió, no lo que alguien quiso que pareciera.

### Por qué es viable

- **Sin fricción de adopción:** funciona en el navegador, sin instalación, sin hardware
  nuevo. Un cuidador lo usa con el mismo teléfono que ya tiene.
- **Sin dependencia de conectividad constante:** el prototipo opera en local; la
  arquitectura de producción en Google Cloud sincroniza cuando hay red.
- **Costo marginal casi cero por residente:** el modelo de precios es por residencia,
  no por plaza — predecible para el comprador.
- **Normativa que lo respalda:** la NOM-031-SSA3-2012 obliga a expediente administrativo
  por cada usuario y manuales técnico-administrativos. CareSignal genera ese registro
  como subproducto natural de la operación.

### Manual vs. CareSignal — estimado operativo

*(Estimados de referencia; no datos medidos en campo)*

| Actividad | Modo manual | Con CareSignal |
|---|---|---|
| Registrar una ronda completada | 4–6 min (buscar planilla, anotar, archivar) | ~1 min (3 acciones en pantalla) |
| Detectar una ronda atrasada | Al final del turno, o nunca | Automático en tiempo real |
| Escalar una alerta al supervisor | Llamada o búsqueda física | Inmediato, trazable, con actor registrado |
| Preparar el reporte del turno | 20–30 min de transcripción | Generado como subproducto de la operación |

Una residencia de 50 residentes realiza aproximadamente **450 rondas por semana**. A
5 minutos de overhead administrativo por ronda en modo manual, eso es **~37 horas
semanales** de registro que no genera ningún valor operativo. Con CareSignal, ese tiempo
baja a menos de 8 horas — y el registro es auditable desde el primer momento.

### El impacto

El impacto no es médico. Es operativo, legal y reputacional — y eso es exactamente lo
que una dirección de residencia privada compra. Una residencia de 50 residentes con
3 turnos diarios realiza aproximadamente **450 rondas por semana**. CareSignal convierte
cada una en un evento auditable con actor, timestamp y resultado: evidencia que protege
a la residencia ante una inspección, ante una familia inconforme, ante una demanda.

### Por qué esta solución es innovadora

CareSignal no es la primera aplicación web para residencias en México — existen Cronos Care
(+50 residencias activas) y GERIGES (versión localizada para MX). Pero ambas resuelven
la **administración**: expediente del residente, medicamentos, facturación, portal familiar.

Ninguna modela el **ciclo operativo del turno**:

| Lo que los competidores cubren | Lo que ninguno cubre | Lo que CareSignal agrega |
|---|---|---|
| Expediente de residente | Rondas con estados formales | Programación → ejecución → retraso detectado automáticamente |
| Control de medicamentos | Alertas por incumplimiento | Alerta automática al supervisor con timestamp y actor |
| Facturación y cobros | Escalación trazable | Escalación con historial de quién tenía la alerta en cada momento |
| Portal familiar | Auditoría inmutable del turno | Bitácora append-only: 20 tipos de evento, no editable |

La innovación no está en la tecnología — está en que nadie había modelado ese ciclo con
una máquina de estados formal para este sector. CareSignal lleva al mercado de residencias
mexicanas una capacidad de trazabilidad operativa que hasta hoy solo existía en sistemas
hospitalarios de $500K USD o en papel.

> Ver criterio 8 para la tipología completa de innovación (de producto, de proceso,
> combinatoria y exploratoria) con su evidencia técnica.

---

## Criterio 3 · Conocimiento del mercado

### El mercado — dimensión y crecimiento

El envejecimiento acelerado está creando uno de los mercados de mayor crecimiento de la
próxima década. México es el punto de entrada; América Latina es el horizonte.

| Indicador | Valor actual | Proyección | Fuente |
|---|---|---|---|
| Personas de 60+ en México | **17.1 M (12.8 % de la población)** | ~28 M en 2040 · ~33 M en 2050 | CONAPO / INAPAM |
| Personas de 65+ en LatAm | **~65 millones** | ~138 M en 2050 (18.9 % región) | CEPAL / OPS |
| Personas con dependencia de cuidados en LatAm | **~8 millones** | se triplica hacia 2050 | BID / OPS |
| Déficit de cuidadores remunerados en LatAm | 3 M hoy vs. **14 M necesarios** | brecha de 11 M | BID |
| Economía del cuidado no remunerado en México | **26.3 % del PIB** | — | INEGI (ENUT) |
| Mercado geriátrico / salud adultos mayores MX | **USD 20.6 B** | USD 37.6 B en 2034 (CAGR 6.7 %) | IMARC Group ⚠ |
| Long-Term Care (cuidados de largo plazo) MX | **USD 25.6 B** | USD 43.9 B en 2033 (CAGR 6.6 %) | Grand View Research ⚠ |
| Residencias privadas formales en México | **~1,297–1,500** | crecimiento +18 % interanual | DENUE 2025 / INEGI |

> ⚠ IMARC Group y Grand View Research son firmas privadas de investigación de mercado, no fuentes oficiales.
> Declararlo ante jueces; son las mejores referencias disponibles para este segmento.

### TAM / SAM / SOM — modelo B2B CareSignal

| Nivel | Descripción | Estimación | Lógica |
|---|---|---|---|
| **TAM** | Mercado total de cuidados geriátricos y tecnología (MX + LatAm) | Decenas de miles de millones USD | LTC solo en MX supera USD 25 B; LatAm multiplica |
| **SAM** | Residencias privadas formales en México con capacidad de adoptar SaaS operativo | ~1,100–1,300 residencias | DENUE 2025; segmento con presupuesto y obligación normativa |
| **SOM** | Captura realista en 3–5 años (equipo en etapa temprana, ciclo de venta B2B) | **50–200 residencias** | Requiere pilotos, referencias y construcción de confianza |

**Revenue potencial del SOM:**

| Escenario | Residencias | Plan promedio | MRR estimado |
|---|---|---|---|
| Conservador | 50 | Esencial ($1,490/mes) | ~$74,500 MXN/mes |
| Base | 100 | Profesional ($3,490/mes) | ~$349,000 MXN/mes |
| Optimista | 200 | Profesional ($3,490/mes) | ~$698,000 MXN/mes |

El segmento comprador es la **dirección de la residencia privada**: una operación con
presión familiar, riesgo reputacional y obligaciones normativas bajo la NOM-031-SSA3-2012
— y sin herramientas digitales específicas para la trazabilidad del turno operativo.

### Análisis de competencia directa — mercado mexicano

Investigación realizada en agosto de 2026 sobre soluciones actualmente disponibles en México:

#### Competidores con presencia en México

| Competidor | Origen | Modelo | Enfoque | Presencia MX |
|---|---|---|---|---|
| **Cronos Care** | México | Cloud / SaaS | Gestión integral: residentes, medicamentos, personal, pagos, portal familiar | ✅ +50 residencias activas |
| **GERIGES** | España (localiz. MX) | Cloud / SaaS | Expediente clínico, PAI/PIA, medicación, turnos, app táctil para auxiliares | ✅ Versión `.com/mx/` |
| **StoriiCare** | EE.UU. | Cloud / SaaS | EHR, eMAR, IA integrada, verificación EVV con GPS | ⚠ Sin presencia confirmada en MX |
| **Papel / hojas de cálculo** | — | — | Mayoría del sector | ✅ Predominante |

#### Comparativa funcional detallada

| Función | Cronos Care | GERIGES | StoriiCare | **CareSignal** |
|---|---|---|---|---|
| Idioma | Español | Español | Español (traducido) | Español nativo |
| Modelo de precios | Sin publicar | Sin publicar | Sin publicar | ✅ Publicado (3 planes) |
| Sin instalación | ✅ | ✅ | ✅ | ✅ |
| Expediente clínico / médico | ✅ | ✅ | ✅ | ❌ (operativo, no médico) |
| Rondas con máquina de estados | ❌ | ❌ | ❌ | ✅ |
| Alertas automáticas por retraso | ❌ | ❌ | ❌ | ✅ |
| Escalación supervisor trazable | ❌ | ❌ | ❌ | ✅ |
| Auditoría append-only inmutable | ❌ | ❌ | ❌ | ✅ |
| Doble validación documental | ❌ | ❌ | ❌ | ✅ |
| IA integrada | ❌ | ❌ | ✅ (EHR) | Roadmap v0.2 |
| Portal familiar | ✅ | ✅ | ✅ | Roadmap v0.2 |
| Alineado con NOM-031 operativa | ⚠ Parcial | ⚠ Parcial | ❌ | ✅ |

#### El hueco que ninguno cubre

Cronos Care y GERIGES son los competidores más relevantes en México. Ambos son sistemas de
**expediente y facturación**: registran al residente, gestionan medicamentos y cobros. Ninguno
modela el ciclo operativo de la ronda — la secuencia programación → ejecución → retraso →
alerta → escalación → verificación → cierre — con transiciones de estado formales que
impidan registros inválidos.

**La diferencia clave no es de funcionalidades, es de dominio modelado:**

- Cronos Care y GERIGES resuelven la **administración de la residencia**
- CareSignal resuelve la **trazabilidad operativa del turno**

Son complementarios, no idénticos — y el ciclo de ronda es exactamente lo que la
NOM-031 exige como "programa de trabajo" y que hoy se lleva en papel o no se lleva.

### La necesidad validada por la norma

La NOM-031-SSA3-2012 exige expediente por residente, programa de trabajo y manuales
técnico-administrativos. La CNDH supervisó menos del 4% de los centros durante la
pandemia — lo que significa que el riesgo de inspección es bajo pero la consecuencia es
máxima (clausura, como el caso del Asilo Santa Sofía en SLP, mayo 2025). CareSignal
responde exactamente a ese perfil de riesgo: bajo costo de adopción, alta cobertura ante
el evento de baja probabilidad y consecuencia grave.

---

## Criterio 4 · Propuesta de valor

### Propuesta de valor en una línea

> **CareSignal es la única plataforma de trazabilidad operativa diseñada específicamente
> para residencias de adultos mayores en México: en español, sin instalación, con
> auditoría inmutable, doble validación documental y lista para Google Cloud Run.**

### Por qué es única — frente a los competidores reales

Los dos competidores con presencia activa en México son Cronos Care (+50 residencias) y
GERIGES (versión localizada). Ambos cubren expediente, medicamentos y facturación. Ninguno
modela el ciclo operativo de la ronda con estados formales, alertas automáticas por
retraso ni escalación trazable al supervisor.

| Diferenciador | Cronos Care | GERIGES | CareSignal |
|---|---|---|---|
| Rondas con máquina de estados | ❌ | ❌ | ✅ |
| Alerta automática por retraso | ❌ | ❌ | ✅ |
| Escalación con actor registrado | ❌ | ❌ | ✅ |
| Auditoría inmutable append-only | ❌ | ❌ | ✅ |
| Precio publicado | ❌ | ❌ | ✅ |
| Alineado con NOM-031 operativa | ⚠ Parcial | ⚠ Parcial | ✅ |

CareSignal no compite con ellos en expediente clínico — ese no es el dominio del MVP. Compite
en el ciclo de turno operativo, que es donde ocurre el riesgo y donde no hay ninguna solución
específica hoy en el mercado mexicano.

---

### Qué compra la residencia

La dirección de una residencia privada no compra software — compra **tres cosas concretas**:

1. **Tranquilidad ante una familia exigente.** Cuando un familiar pregunta "¿qué pasó a
   las 3 am con mi mamá?", CareSignal tiene la respuesta en segundos: quién hizo la
   ronda, a qué hora, qué encontró, qué acción tomó.

2. **Protección ante una inspección.** La NOM-031-SSA3-2012 exige registros. CareSignal
   los genera como subproducto de la operación diaria — sin trabajo extra, sin
   transcripción al final del turno.

3. **Control operativo en tiempo real.** Un supervisor que hoy se entera de un retraso
   cuando ya pasó una hora, con CareSignal lo ve en el momento en que ocurre y puede
   actuar antes de que escale.

### Por qué no es sustituible por lo que ya tienen

- **WhatsApp** no tiene estados auditables, no impide borrar mensajes, no genera reportes.
- **Una hoja de cálculo** no detecta retrasos en tiempo real ni escala alertas
  automáticamente.
- **Un sistema clínico** cuesta 5–10× más, requiere capacitación extensa y está pensado
  para hospitales.

### El diferenciador técnico que los jueces pueden verificar

CareSignal tiene **38 pruebas automatizadas y 20 pruebas de aceptación del contrato**,
todas aprobadas. La máquina de estados impide transiciones inválidas por diseño — no por
validación de formulario. Eso significa que la auditoría no puede mentir: refleja lo que
el sistema permitió hacer, no lo que alguien escribió.

La arquitectura de producción sobre **Google Cloud Run + Firebase** añade el diferenciador
de seguridad: datos cifrados, acceso por rol, sin mezcla de información entre residencias.

---

## Criterio 5 · Progreso del producto: prototipo o demo

### El estado del producto

CareSignal no es una idea ni un wireframe. Es un **MVP funcional completo**, construido
en 8 fases con aprobación humana en cada gate, publicado como `v0.1.0-workshop` con
auditoría de calidad PASS.

| Métrica | Resultado |
|---|---|
| Fases de construcción completadas | 8 de 8 |
| Pruebas de aceptación del contrato | 20 de 20 ✅ |
| Pruebas automatizadas | 38 de 38 ✅ |
| Hallazgos blocker | 0 |
| Hallazgos high | 1, corregido antes del release |
| Paquete de producción | ~225 KB JS (~68 KB comprimido) |

### Qué puede hacer hoy mismo

Un evaluador puede abrir la aplicación en el navegador y en menos de 5 minutos:

1. Ver el dashboard del supervisor con residentes, rondas y alertas activas.
2. Iniciar sesión como cuidador, ejecutar una ronda y completarla.
3. Observar cómo el reloj simulado genera retrasos y dispara alertas automáticamente.
4. Escalar una alerta, asignarla a otro cuidador, verificarla y cerrarla con resultado.
5. Consultar la bitácora de auditoría completa con cada acción, actor y timestamp.

Todo sin instalación, sin cuenta, sin conexión a internet.

### El método como evidencia adicional

El producto se construyó bajo un **contrato congelado** con taxonomía, máquina de estados
y reglas de negocio definidas antes de escribir una sola línea de React. Cada fase cerró
con un gate de revisión documentado en `CHANGELOG.md`. Ese protocolo — no solo el código
— es parte de la innovación: demuestra que el sistema es mantenible, auditable y
extensible por cualquier desarrollador que tome el proyecto.

---

## Criterio 6 · Comunicación clara, visual y segura

### Claridad para el usuario final

CareSignal fue diseñado para cuidadores con distintos niveles de alfabetización digital,
en turnos de alta carga cognitiva. Cada decisión de UX refleja eso:

- **Tres acciones máximo** para completar una ronda normal — sin menús profundos, sin
  formularios largos.
- **Semáforo visual** (verde / amarillo / rojo) para el estado de cada residente —
  legible de un vistazo desde el dashboard.
- **Avisos obligatorios en pantalla:** "MVP operacional, no dispositivo médico" y "Datos
  ficticios" — el sistema nunca permite confundir el demo con un entorno real.
- **Accesibilidad de teclado** corregida y verificada en el QA de la fase C8 —
  navegación completa sin ratón.

### Claridad para el evaluador

El repositorio incluye documentación estructurada en tres niveles:

| Nivel | Documento | Para quién |
|---|---|---|
| Ejecutivo | `README.md` — executive summary | Juez, inversionista |
| Operativo | `WORKSHOP_DEMO_SCRIPT.md` — guion de demo de 5 min | Evaluador técnico |
| Técnico | `docs/00` al `docs/10` — contrato, taxonomía, máquina de estados, pruebas | Desarrollador, auditor |

### Seguridad en la comunicación

- Ninguna pantalla expone datos reales de personas — la aplicación opera exclusivamente
  con datos ficticios generados por el sistema.
- La arquitectura de producción en **Google Cloud Run + Firebase** establece comunicación
  cifrada TLS en tránsito y cifrado en reposo — sin canales inseguros como correo o
  mensajería sin control.
- El material comercial (deck, dossier) está versionado en el repositorio — no circula
  en canales no controlados durante el proceso de entrega.

---

## Criterio 7 · Trabajo en equipo: roles y colaboración

### Estructura del equipo requerida por el proyecto

CareSignal es un proyecto de innovación liderado por **Roberto García, fundador y líder
del proyecto**. La naturaleza del MVP — sistema de dominio complejo con contrato
congelado, máquina de estados, pruebas de aceptación y material comercial — requiere
cinco roles claramente definidos:

| Rol | Responsabilidad en el proyecto | Evidencia |
|---|---|---|
| **Líder de proyecto / Product Owner** | Visión del producto, definición del contrato, aprobación de cada fase | `contract/`, decisiones de gate en `CHANGELOG.md` |
| **Arquitecto de software** | Diseño del dominio, máquina de estados, modelo de datos, reglas de negocio | `src/domain/`, `docs/00–03` |
| **Desarrollador full-stack** | Implementación React + TypeScript estricto, motor temporal, escenarios | `src/`, `tests/` |
| **QA / Auditor de calidad** | 20 pruebas de aceptación, 38 pruebas automatizadas, reporte de hallazgos | `docs/04`, `tests/` |
| **Diseñador de UX** | Flujos de cuidador y supervisor, accesibilidad, semáforo visual | `src/pages/`, `src/components/` |

### Método de trabajo y trazabilidad

El proyecto opera bajo un **protocolo de gate reviews**: cada fase requirió aprobación
explícita antes de avanzar a la siguiente. Ese proceso — con criterios definidos,
resultados documentados y decisiones trazables en `CHANGELOG.md` — garantiza la misma
disciplina que exige la colaboración en equipo: ningún entregable avanzó sin validación
estructurada.

El historial de 8 commits, uno por fase, es la evidencia pública de ese método y del
liderazgo continuo sobre cada decisión de alcance, arquitectura y calidad.

### Evidencia de colaboración: quién hizo qué y cuándo

| Fase | Rol ejercido | Entregable | Resultado del gate |
|---|---|---|---|
| C1 · Contrato y taxonomía | Líder / Product Owner | Contrato congelado v0.1.0, taxonomía YAML, límites de alcance | ✅ Gate C1 aprobado |
| C2 · Dominio y tipos | Arquitecto de software | `types.ts`, `rules.ts`, máquina de estados formal | ✅ Gate C2 — compila, sin `any` |
| C3 · Datos y reloj | Desarrollador full-stack | Datos de semilla, repositorio, reloj determinista | ✅ Gate C3 — IDs coherentes |
| C4 · Shell y navegación | Desarrollador + UX | 5 páginas, navegación, sesión ficticia | ✅ Gate C4 — 5 páginas vivas |
| C5 · Flujo del cuidador | Desarrollador + UX | Flujo completo de ronda en ≤ 3 acciones | ✅ Gate C5 — sin alertas duplicadas |
| C6 · Dashboard supervisor | Arquitecto + Desarrollador | Ciclo completo alerta → verificación → cierre | ✅ Gate C6 — auditoría visible |
| C7 · Motor temporal | Arquitecto + Desarrollador | Escenarios deterministas, demo < 5 minutos | ✅ Gate C7 — reproducible |
| C8 · QA y release | QA / Auditor | 20/20 pruebas de contrato · 38/38 automatizadas · 0 blockers | ✅ Gate C8 — PASS |

### Gate reviews como mecanismo de colaboración estructurada

En equipos distribuidos, la calidad se garantiza con revisiones por pares (peer review)
y criterios de aceptación explícitos. En un proyecto individual liderado, ese mismo
rigor se implementa mediante **gate reviews**: cada fase tiene criterios de aprobación
definidos antes de empezar, y ningún entregable avanza sin que esos criterios se cumplan
y se documenten.

| Práctica de equipo convencional | Equivalente en CareSignal |
|---|---|
| Definición de requisitos en equipo | Contrato congelado con taxonomía YAML y reglas de negocio explícitas |
| Revisión de arquitectura por pares | Gate C2: criterios formales antes de escribir una línea de UI |
| Code review | Gate reviews C3–C7: criterios de aceptación por fase documentados en `CHANGELOG.md` |
| QA independiente | Gate C8: auditoría de 20 pruebas de contrato ejecutada en rol separado |
| Retrospectiva de equipo | `docs/05-known-limitations.md`: hallazgos documentados para versiones futuras |

**Roberto García lidera el proyecto en todos los roles** — no porque el proyecto carezca
de estructura, sino porque esa estructura está documentada, es trazable y produce los
mismos entregables que un equipo multidisciplinario produciría. La diferencia es la
velocidad y la coherencia: cada decisión de alcance, arquitectura y calidad pasó por el
mismo líder, sin fricción de coordinación y con trazabilidad completa en git.

---

## Criterio 8 · Innovación y creatividad

### Definición de innovación en este proyecto

**Innovación** es resolver un problema real de una forma que antes no existía o no era
accesible para ese mercado. Se clasifica por su naturaleza: de producto, de proceso, de
modelo de negocio o tecnológica.

**Creatividad** es la capacidad de combinar elementos existentes de formas no obvias para
generar valor. Se expresa como creatividad combinatoria (unir ideas de dominios distintos),
exploratoria (profundizar dentro de un espacio definido) o transformacional (cambiar las
reglas del espacio).

En CareSignal, ambas operan en cuatro planos simultáneos.

---

### 1. Innovación en la solución

> **Tipo de innovación:** de producto + de acceso al mercado
> **Tipo de creatividad:** combinatoria — herramientas de trazabilidad de sectores regulados (salud, finanzas) aplicadas por primera vez al mercado de residencias de adultos mayores en México

El mercado de residencias opera hoy con papel, WhatsApp y hojas de cálculo — no por
falta de tecnología, sino porque ninguna solución fue diseñada para su dominio específico:
rondas, alertas, escalación, verificación y cierre con trazabilidad completa.

CareSignal modela ese ciclo en una **máquina de estados formal**, en español, sin
instalación y a un costo accesible. Lleva al sector una capacidad que hasta hoy solo
tenían los hospitales con sistemas de $500K USD.

---

### 2. Innovación en la integración de IA

> **Tipo de innovación:** de proceso — arquitectura de datos primero, inferencia después
> **Tipo de creatividad:** exploratoria — profundiza en el dominio para construir la base de datos correcta antes de añadir modelos

La tendencia del mercado es añadir IA sin datos estructurados que la sustenten.
CareSignal hizo lo contrario: primero los 20 tipos de evento, el motor temporal y la
bitácora append-only — luego los modelos sobre esa base.

Las funciones de IA planificadas para v0.2, sobre **BigQuery ML · Gemini API (vía Vertex AI)**:

| Función de IA | Tipo | Qué problema resuelve |
|---|---|---|
| **Alertas predictivas** | Supervisado | Anticipa riesgo de incidente por residente basado en histórico de rondas |
| **Detección de anomalías** | No supervisado | Detecta desviaciones del protocolo — registros imposibles según la máquina de estados |
| **Optimización de asignación** | Optimización | Minimiza tiempos de respuesta distribuyendo carga entre cuidadores disponibles |
| **Resumen ejecutivo de turno** | Generativa | Genera el reporte de traspaso desde los eventos — sin transcripción manual |

La arquitectura ya está lista para recibirlas. No es especulación — es diseño presente.

---

### 3. Innovación en ciberseguridad

> **Tipo de innovación:** tecnológica — seguridad activa y continua vs. controles pasivos
> **Tipo de creatividad:** transformacional — convierte la ciberseguridad de un atributo del producto en una capacidad operativa autónoma

La visión de CareSignal incluye un **agente de IA de ciberseguridad** que opera de forma
continua sobre el entorno de producción:

- **Monitoreo continuo de integridad:** analiza patrones de la bitácora en busca de
  comportamientos anómalos — accesos fuera de horario, secuencias de eventos imposibles
  según la máquina de estados, modificaciones inesperadas.
- **Pruebas de seguridad automatizadas:** verifica periódicamente la configuración de
  reglas de Firebase, permisos de Cloud Run y exposición de endpoints — y reporta
  desviaciones antes de que sean explotadas.
- **Protección de población vulnerable:** los datos de adultos mayores son datos sensibles
  bajo la LFPDPPP. Un agente que los monitorea activamente eleva el estándar del sector
  al nivel que hoy solo tienen las instituciones financieras y de salud de primer nivel.

Esto transforma la ciberseguridad de CareSignal de un control pasivo (cifrado) a una
**capacidad activa, continua y auditable**.

---

### 4. Innovación técnica: arquitectura event-driven modular

> **Tipo de innovación:** tecnológica — adopción de patrones de arquitectura de vanguardia en un sector que opera con software monolítico
> **Tipo de creatividad:** combinatoria — principios del CNCF, Google Cloud Architecture Framework y AWS Well-Architected aplicados a un MVP de nicho con recursos mínimos

| Capa | Responsabilidad | Ventaja estructural |
|---|---|---|
| **Dominio puro** | Tipos, reglas, transiciones — sin dependencias externas | Testeable de forma aislada; portable a cualquier backend |
| **Motor de eventos** | Genera y registra eventos inmutables por cada acción | Fuente de verdad para auditoría y para los modelos de IA |
| **Repositorio** | Única capa que toca el almacenamiento | Migrar de localStorage a Firebase es un cambio de una sola capa |
| **UI** | Consume estado — nunca lo produce ni lo persiste | Componentes intercambiables sin riesgo de corrupción de datos |

En un mercado donde el software de gestión de residencias es monolítico, propietario y
no auditable, esta arquitectura es una ventaja verificable — cualquier evaluador técnico
puede confirmarlo leyendo el repositorio.

---

## Criterio 9 · Factibilidad técnica y financiera

### Factibilidad técnica — el MVP

El MVP no es una promesa — es código funcionando, verificado y publicado.

| Evidencia técnica | Detalle |
|---|---|
| Stack probado | React 18 + TypeScript estricto, Vite, sin dependencias no estándar |
| Build de producción | ~225 KB JS (~68 KB comprimido) — carga en cualquier conexión |
| Pruebas automatizadas | 38 pruebas, 0 fallos |
| Sin deuda técnica bloqueante | 0 hallazgos `blocker`, 1 `high` corregido antes del release |
| Accesibilidad | WCAG 2.1 AA verificada en QA C8 |

### Arquitectura de producción: eventos asíncronos, modular y en tiempo real

La arquitectura de producción sigue el patrón **monolito modular con eventos asíncronos**
— recomendado por Google Cloud Architecture Framework y CNCF para sistemas SaaS que
necesitan escalar sin microservicios prematuros.

```
┌─────────────────────────────────────────────────────┐
│  Cliente (React SPA)                                 │
│  WebSocket ◄──────────────────────────────────────► │
└────────────────────┬────────────────────────────────┘
                     │ REST / WebSocket
┌────────────────────▼────────────────────────────────┐
│  API Backend — FastAPI (Python) en Cloud Run         │
│  • REST API: CRUD de rondas, alertas, residentes     │
│  • WebSocket server: push de eventos en tiempo real  │
│  • Publica eventos a Pub/Sub al completar cada acción│
└──────┬────────────────────────┬───────────────────── ┘
       │ Firestore               │ Pub/Sub (async)
┌──────▼──────────┐    ┌────────▼──────────────────── ┐
│ Firebase        │    │ Worker — Cloud Run (job)       │
│ Firestore       │    │ • Consume eventos de Pub/Sub   │
│ (estado vivo)   │    │ • Escribe a BigQuery           │
│ Firebase Auth   │    │ • Dispara alertas automáticas  │
└─────────────────┘    └────────────────────────────── ┘
                                │ streaming insert
                       ┌────────▼──────────────────────┐
                       │ BigQuery                       │
                       │ • Histórico de eventos         │
                       │ • Modelos de IA (v0.2)         │
                       │ • Reportes y dashboards        │
                       └───────────────────────────────┘
```

**Por qué FastAPI:** framework Python asíncrono de alto rendimiento, nativo para APIs
REST y WebSockets, con tipado fuerte compatible con el modelo de dominio TypeScript del
frontend. Ideal para Cloud Run por su arranque rápido y bajo footprint.

**Por qué WebSockets:** el dashboard del supervisor necesita actualizaciones en tiempo
real sin polling — cuando una ronda se retrasa o se genera una alerta, el supervisor lo
ve en segundos, no en el próximo refresh.

**Por qué Pub/Sub:** desacopla la escritura operativa (Firestore, tiempo crítico) del
procesamiento analítico (BigQuery, puede tener latencia). El sistema no bloquea una
acción del cuidador esperando que BigQuery confirme la escritura.

### Estimado de generación de datos

*(Estimados de referencia para una residencia de 50 residentes, 3 turnos diarios)*

| Fuente de datos | Eventos/día | Tamaño estimado/evento | Datos/mes | Datos/año |
|---|---|---|---|---|
| Rondas (completas, canceladas, atrasadas) | ~150 | ~500 bytes | ~2.2 MB | ~27 MB |
| Alertas e incidentes | ~5–15 | ~800 bytes | ~0.3 MB | ~3.5 MB |
| Eventos de auditoría (todas las acciones) | ~300 | ~400 bytes | ~3.6 MB | ~44 MB |
| **Total por residencia** | **~465** | — | **~6 MB** | **~75 MB** |

A **33 clientes** (escenario 3% de penetración): ~200 MB/mes · ~2.5 GB/año —
volumen mínimo para BigQuery, con costo de almacenamiento inferior a $1 USD/mes.

### Estimado de costos de infraestructura Google Cloud

*(Precios públicos GCP, agosto 2026; estimados para 33 clientes activos)*

| Servicio | Uso estimado/mes | Costo estimado USD/mes |
|---|---|---|
| Cloud Run (API FastAPI) | ~5M solicitudes, ~0.5 vCPU-seg promedio | ~$15–25 |
| Cloud Run (Worker Pub/Sub) | Procesamiento de ~200K eventos | ~$5–10 |
| Firestore | ~6M lecturas · ~2M escrituras por 33 clientes | ~$15–25 |
| Pub/Sub | ~200K mensajes/mes | ~$1 |
| BigQuery (almacenamiento) | ~200 MB activos | <$1 |
| BigQuery (consultas) | ~50 GB procesados/mes | ~$0.25 |
| Firebase Auth | Hasta 10K usuarios activos/mes | Gratis |
| **Total estimado** | | **~$37–62 USD/mes** |

A **100 clientes:** ~$110–180 USD/mes. Margen bruto >90% a cualquier escala de este rango.

### Estimado de costos de IA — agentes y modelos

Los agentes de IA operan sobre **Gemini API (vía Vertex AI)** con facturación por tokens
consumidos. Se modelan tres agentes independientes:

#### Agente de ciberseguridad (monitoreo continuo)
Analiza la bitácora de auditoría cada 5 minutos buscando anomalías y secuencias
imposibles según la máquina de estados. Opera 24/7.

| Parámetro | Estimado |
|---|---|
| Ejecuciones/mes por residencia | ~8,640 (288/día × 30) |
| Tokens de entrada por ejecución | ~200 (ventana de eventos recientes) |
| Tokens de salida por ejecución | ~50 (score + motivo) |
| Costo a 33 clientes (Gemini Flash) | **~$8–10 USD/mes** |

#### Agente de soporte al administrador y al cuidador
Chatbot operativo con acceso al manual de la residencia, historial de incidentes y
estado actual. Responde preguntas en lenguaje natural: "¿cuántas alertas hubo este turno?",
"¿qué protocolo aplica si un residente no responde?"

| Parámetro | Estimado |
|---|---|
| Consultas/mes a 33 clientes | ~15,000 (≈15/día por residencia) |
| Tokens de entrada por consulta | ~1,000 (contexto RAG + pregunta) |
| Tokens de salida por consulta | ~500 (respuesta estructurada) |
| Costo a 33 clientes (Gemini Flash) | **~$3–5 USD/mes** |

#### Modelos de IA operativa (v0.2 — alertas predictivas, anomalías, asignación)
Inferencia por lotes sobre BigQuery ML · Gemini API (vía Vertex AI), ejecución cada hora.

| Parámetro | Estimado |
|---|---|
| Predicciones/mes a 33 clientes | ~1.2M (33 × 50 residentes × 24 corridas/día × 30) |
| Tokens de entrada promedio | ~200 por predicción |
| Costo (Gemini API · BigQuery ML) | **~$18–22 USD/mes** |

#### Resumen de costos de IA a 33 clientes

| Agente / modelo | Costo estimado USD/mes |
|---|---|
| Agente de ciberseguridad (continuo) | $8–10 |
| Agente de soporte admin + cuidador | $3–5 |
| Modelos operativos v0.2 (predictivos) | $18–22 |
| **Total IA** | **~$29–37 USD/mes** |

---

### Factibilidad financiera — costo total y margen

**Modelo de ingresos:** SaaS B2B, suscripción mensual por residencia.

| Plan | Precio | Mercado objetivo |
|---|---|---|
| Esencial | $1,490 MXN/mes | Residencias pequeñas (hasta 25 residentes) |
| Profesional | $3,490 MXN/mes | Residencias medianas (hasta 75 residentes) |
| Institucional | $6,990 MXN/mes | Cadenas y residencias grandes |

**Escenario conservador — 3% de penetración** (DENUE 2025: ~1,100 residencias privadas):

| Concepto | Valor |
|---|---|
| Clientes | ~33 residencias |
| Ingreso mensual (mix Esencial/Profesional) | ~$80,000 MXN (~$4,000 USD) |
| Ingreso anual | ~$960,000 MXN (~$48,000 USD) |
| Infraestructura Google Cloud | ~$37–62 USD/mes |
| Agentes e IA (Gemini API) | ~$29–37 USD/mes |
| **Costo total operativo** | **~$66–99 USD/mes** |
| **Margen bruto estimado** | **>97%** |

El modelo es rentable desde el primer cliente. Los agentes de IA se facturan por uso
real — a cero clientes, costo cero. No hay costo fijo de infraestructura.

### Roadmap de versiones — el plan forward

| Versión | Plazo estimado | Qué incluye | Hito clave |
|---|---|---|---|
| **v0.1.0** | Agosto 2026 ✅ | MVP demo · localStorage · 8 fases · 38 pruebas · 0 blockers | Concurso WomenCISO/MenCISO |
| **v1.0** | Q1 2027 | Despliegue en Google Cloud Run + Firebase · auth real · multi-tenant · WebSockets | Primer cliente de pago |
| **v0.2** | Q3 2027 | Agentes IA (alertas predictivas · anomalías · soporte RAG) · BigQuery ML · agente de ciberseguridad 24/7 | IA en producción con datos reales |

La ruta de v0.1.0 a v1.0 **no requiere rediseñar el dominio ni la UI** — solo activar la capa de infraestructura. El repositorio ya está estructurado para ese paso.

---

## Criterio 10 · Valor al usuario y al dueño

### Usuario 1: El cuidador

**El dolor:**
Trabaja en turnos de 8–12 horas con 15–30 residentes a cargo. Al final del turno tiene
que recordar qué hizo, cuándo y con quién — y transcribirlo en una planilla o un
cuaderno. Si algo salió mal y no quedó registrado, la responsabilidad cae sobre él. No
tiene forma de demostrar que siguió el protocolo si alguien lo cuestiona. El miedo a
la queja lo acompaña en cada turno.

**La solución:**
Con CareSignal registra cada ronda en el momento en que ocurre, en 3 acciones desde su
teléfono. Si algo requiere atención, el sistema lo detecta y lo escala — él no tiene
que decidir si "merece" reportarse. Al final del turno, todo está documentado con su
nombre, la hora exacta y el resultado. Su trabajo queda protegido por el propio registro.

---

### Usuario 2: El supervisor

**El dolor — cómo opera hoy:**

| Situación | Lo que vive el supervisor sin CareSignal |
|---|---|
| Visibilidad del piso | Cero en tiempo real — se entera cuando alguien lo llama o al revisar el cuaderno al final del turno |
| Ronda atrasada | Se entera una hora después, cuando el cuidador del siguiente turno lo menciona de paso — o nunca |
| Asignación de tareas | Por WhatsApp: sin confirmación, sin trazabilidad, sin saber si se cumplió |
| Incidente ocurrido | Reconstruir la cronología lleva horas: papeles, mensajes, llamadas, versiones distintas |
| Cierre de turno | Resumen verbal o anotado a mano — incompleto, dependiente de la memoria del cuidador saliente |

El supervisor no gestiona — **reacciona**. Y cuando reacciona, ya es tarde.

**La solución — con CareSignal:**

| Situación | Lo que CareSignal entrega al supervisor |
|---|---|
| Visibilidad del piso | Dashboard en tiempo real: estado de cada residente, rondas activas y alertas abiertas |
| Ronda atrasada | Alerta automática en el momento en que ocurre — sin esperar que nadie lo avise |
| Asignación de tareas | Un clic: asignación registrada con actor, hora y estado de cumplimiento |
| Incidente ocurrido | Cronología completa en la bitácora — sin reconstrucción, sin suposiciones, sin versiones |
| Cierre de turno | Bitácora lista, generada como subproducto de la operación — sin transcripción |

El supervisor pasa de **reaccionar** a **anticipar**.

---

### La sincronía entre turnos — donde los tres usuarios se conectan

El momento de mayor riesgo en una residencia no es una emergencia — es el **cambio de
turno**. Es el instante en que toda la información operativa del turno saliente tiene que
transferirse al entrante, sin perderse, sin errores, sin olvidos.

**Hoy — el traspaso en modo manual:**

| Qué se necesita transferir | Cómo ocurre hoy | Resultado |
|---|---|---|
| Rondas pendientes o incompletas | El cuidador saliente lo menciona de memoria | Se olvida, se pierde, llega incompleto |
| Alertas activas y su estado | Anotado en un cuaderno o dicho de palabra | Sin contexto, sin historial, sin actor |
| Cuidados programados para el turno | Lista en papel o en un grupo de WhatsApp | Difícil de verificar, fácil de saltarse |
| Novedades de cada residente | Transmisión verbal entre cuidadores | Depende de quién esté disponible y de cuánto recuerda |

**El cuidador entrante llega sin saber nada que no le dijeron en voz alta.**
El supervisor no tiene forma de verificar que el traspaso fue completo.
El dueño no sabe qué se perdió entre turnos — hasta que hay un problema.

**Con CareSignal — el traspaso es automático y completo:**

| Qué necesita el turno entrante | Cómo CareSignal lo entrega |
|---|---|
| Rondas pendientes o atrasadas | Dashboard en tiempo real — visibles desde el primer segundo |
| Alertas activas y su estado | Bitácora con actor, hora y última acción registrada |
| Cuidados programados para el turno | Motor temporal — agenda generada sin transcripción |
| Historial reciente de cada residente | Accesible por residente — sin buscar en cuadernos |

El cuidador entrante no depende de lo que el saliente recuerda — **depende del sistema**.
El supervisor no necesita estar presente en el cambio de turno para garantizar continuidad.
El dueño sabe que ninguna tarea programada se perdió entre turnos.

**Eso es continuidad operativa trazable** — y es exactamente lo que una familia exige
cuando pregunta: *"¿quién estuvo con mi mamá esta noche y qué hizo?"*

---

### Control de documentos — del papel sin gestión al respaldo digital con doble validación

**El problema actual — documentación en papel sin control:**

| Situación | Sin CareSignal |
|---|---|
| Formatos de registro | Papel impreso o cuadernos — sin versión controlada, sin índice |
| Localización de un registro histórico | Búsqueda manual en archivos físicos — minutos u horas |
| Pérdida o alteración de un documento | Sin forma de detectarlo ni reconstruirlo |
| Revisión de cumplimiento por la administración | Revisión presencial, periódica, con información desactualizada |
| Validación del reporte por la dirección | Firma física — sin registro de cuándo ni quién revisó |

**Con CareSignal — gestión documental con doble validación:**

Cada registro operativo generado en el sistema puede:

1. **Imprimirse en formato estandarizado** — el mismo campo, el mismo orden, siempre — listo para el expediente físico que exige la NOM-031-SSA3-2012.

2. **Respaldarse digitalmente de forma automática** — la versión impresa tiene su copia digital inmutable en el sistema, con el mismo timestamp y los mismos datos. Si el papel se pierde, el respaldo existe.

3. **Programarse para revisión digital por la administración** — los reportes de turno, semanales o mensuales se envían al administrador con una agenda definida. No hay que ir a buscar el cuaderno.

4. **Firmarse digitalmente por la administración** — el reporte revisado recibe la firma digital del director o supervisor con fecha y hora de revisión. Esa firma queda registrada en el sistema.

5. **Complementarse con firma física en el impreso** — la firma digital **no sustituye** la firma física en el reporte impreso. Ambas coexisten: **doble validación**, digital y en papel, que se refuerzan mutuamente ante cualquier auditoría o inspección.

| Elemento de validación | Modo manual | Con CareSignal |
|---|---|---|
| Registro del evento | Anotación manual, sin hora exacta | Evento digital con timestamp inmutable |
| Reporte impreso | Papel sin respaldo | Impresión desde el sistema + copia digital |
| Revisión administrativa | Presencial, sin registro de cuándo | Programada, con firma digital y fecha |
| Validación final | Solo firma física | **Firma digital + firma física — doble validación** |

La doble validación convierte cada reporte en un documento **legalmente robusto**: tiene la trazabilidad digital del sistema y la autenticidad de la firma física del responsable. Ante una inspección de la Secretaría de Salud o una demanda civil, esa combinación es el estándar más alto de evidencia que una residencia puede presentar.

---

### Usuario 3: El dueño / director de la residencia

**El dolor:**
Vive con tres miedos que no puede controlar completamente: que una familia reclame que
su familiar no recibió atención, que una inspección encuentre que los registros no
existen o son inconsistentes, y que una demanda por negligencia llegue sin evidencia
para defenderse. Hoy no tiene forma de demostrar que los protocolos se siguieron —
porque nadie los registra de forma sistemática.

**La solución:**

| Miedo | Qué CareSignal entrega |
|---|---|
| **Queja familiar** | Bitácora inmutable: quién atendió a su familiar, a qué hora, qué encontró y qué hizo — en segundos |
| **Inspección NOM-031** | Registros operativos generados automáticamente como subproducto del trabajo diario — sin trabajo extra |
| **Demanda por negligencia** | Evidencia de que los protocolos se siguieron; o de que la desviación fue detectada, escalada y atendida |

---

### Riesgo potencial — casos reales y marco sancionatorio

#### Casos documentados en México (2024–2025)

| Caso | Fecha | Lo que ocurrió | Consecuencia |
|---|---|---|---|
| **Asilo Santa Sofía, SLP** | Mayo 2025 | Videos de maltrato difundidos en redes; operaba sin permisos ni protección civil | Clausura definitiva · 10 residentes rescatados · intervención de la Fiscalía estatal |
| **Casa de reposo, CDMX** | Diciembre 2024 | Cámaras ocultas captaron maltrato verbal y físico a residentes | Denuncia pública viral · investigación abierta |
| **"La Aldea de los Abuelos", SLP** | Mayo 2025 | Denuncia ciudadana en redes por condiciones de insalubridad | Inspección solicitada · exposición mediática |

**El patrón es siempre el mismo:** sin registros operativos, la residencia no puede
demostrar qué ocurrió ni cuándo. La clausura o la demanda llegan antes de que haya
evidencia para defenderse.

#### Marco sancionatorio — Ley General de Salud (UMA 2026 = $117.31/día)

| Artículo | Sanción | Monto estimado en pesos |
|---|---|---|
| Art. 419 LGS | Multa por infracciones leves | Hasta 2,000 UMA = **~$234,620 MXN** |
| Art. 420 LGS | Multa por infracciones graves | 2,000–6,000 UMA = **$234,620–$703,860 MXN** |
| Art. 417 LGS | Clausura temporal o definitiva | Sin límite de monto — pérdida total del negocio |

Además de las multas administrativas, las familias pueden iniciar **demanda civil por
daños y perjuicios** — sin tope legal en México para indemnizaciones por negligencia
contra población vulnerable.

#### La comparativa que cierra el argumento

Una residencia con 40 residentes a $8,000 MXN/mes genera **~$320,000 MXN/mes de
ingreso**. Una multa del Art. 420 LGS puede representar **hasta 2.2 meses de ingreso
bruto** — sin contar el costo reputacional, la pérdida de residentes ni una eventual
demanda civil.

| Concepto | Monto |
|---|---|
| Multa grave (Art. 420 LGS) | $234,620–$703,860 MXN (una sola vez) |
| Pérdida de ingresos por clausura (6 meses) | ~$1,920,000 MXN |
| Honorarios de abogado defensor | $50,000–$150,000 MXN estimado |
| **CareSignal Plan Esencial (12 meses)** | **$17,880 MXN** |

**CareSignal a $1,490 MXN/mes es menos del 0.5% del ingreso mensual de la residencia**
y genera la evidencia que puede evitar — o defender — cualquiera de esos escenarios.
La residencia que tiene CareSignal llega a cualquier cuestionamiento con evidencia;
la que no lo tiene, llega con una disculpa.

> Fuentes: Infobae (mayo 2025) · Proceso (mayo 2025) · Infobae CDMX (diciembre 2024) ·
> Ley General de Salud Arts. 417–420 · INEGI — UMA 2026 ($117.31/día)

---

### Tablas comparativas — resumen ejecutivo del criterio 10

#### Tabla 1 — Operación diaria: sin CareSignal vs. con CareSignal

| Actividad | Sin CareSignal | Con CareSignal |
|---|---|---|
| Registrar una ronda completada | 4–6 min · planilla en papel · a mano | ~1 min · 3 acciones en el teléfono |
| Detectar una ronda atrasada | Al final del turno — o nunca | Alerta automática en el momento |
| Escalar un problema al supervisor | Llamada o búsqueda física | Un clic · trazable · con actor y timestamp |
| Saber el estado de un residente | Imposible sin buscar el cuaderno | Dashboard — visible en segundos |
| Asignar una tarea a un cuidador | WhatsApp · sin confirmación | Sistema · con registro de cumplimiento |
| Preparar el reporte del turno | 20–30 min de transcripción manual | Generado automáticamente al cerrar turno |
| Traspaso entre turnos | Verbal o en papel — incompleto por definición | Instantáneo y completo desde el dashboard |

---

#### Tabla 2 — Control documental: sin CareSignal vs. con CareSignal

| Elemento | Sin CareSignal | Con CareSignal |
|---|---|---|
| Formato de registro | Papel o cuaderno sin versión controlada | Estandarizado · imprimible desde el sistema |
| Respaldo del registro | Solo el papel — si se pierde, se pierde | Copia digital inmutable con mismo timestamp |
| Localización de un registro histórico | Búsqueda manual en archivos físicos | Búsqueda en sistema — segundos |
| Revisión administrativa | Presencial · periódica · con info desactualizada | Programada · con agenda definida |
| Validación del director | Solo firma física · sin registro de cuándo | **Firma digital + firma física — doble validación** |

---

#### Tabla 3 — Valor por usuario

| Usuario | Dolor principal | Lo que CareSignal resuelve | Resultado |
|---|---|---|---|
| **Cuidador** | Responsabilidad sin evidencia | Registro automático en 3 acciones | Su trabajo queda protegido por el sistema |
| **Supervisor** | Gestión reactiva · sin visibilidad | Dashboard en tiempo real + alertas automáticas | Pasa de reaccionar a anticipar |
| **Dueño / Director** | Riesgo legal sin defensa | Bitácora inmutable + doble validación documental | Evidencia lista ante queja, inspección o demanda |

---

#### Tabla 4 — El costo del riesgo vs. el costo de la solución

| Escenario de riesgo | Costo estimado | CareSignal 12 meses | Diferencia |
|---|---|---|---|
| Multa leve Art. 419 LGS | ~$234,620 MXN | $17,880 MXN | **13× el costo anual** |
| Multa grave Art. 420 LGS | hasta $703,860 MXN | $17,880 MXN | **39× el costo anual** |
| Clausura · 6 meses de ingresos | ~$1,920,000 MXN | $17,880 MXN | **107× el costo anual** |
| Honorarios de abogado defensor | $50,000–$150,000 MXN | $17,880 MXN | **3–8× el costo anual** |

**CareSignal cuesta menos del 0.5% del ingreso mensual de la residencia y genera la
evidencia que puede evitar o defender todos los escenarios anteriores.**

---

## Criterio 11 · Framework de ciberseguridad

### El contexto: datos sensibles de población vulnerable

Los datos que CareSignal gestiona — condición física, historial de atención, incidentes,
identidad de residentes — son **datos sensibles** bajo la LFPDPPP, categoría con
obligaciones reforzadas. El framework de ciberseguridad de CareSignal está alineado con
el **NIST Cybersecurity Framework (NIST CSF)** y con los controles de **ISO 27001**,
implementados a través de Google Cloud Platform. Opera en tres capas: diseño,
infraestructura y monitoreo activo.

### Alineación con NIST CSF — las 5 funciones

| Función NIST CSF | Descripción | Cómo CareSignal la implementa |
|---|---|---|
| **Identificar** | Conocer los activos y riesgos | Inventario de datos sensibles · clasificación LFPDPPP · evaluación de riesgo por rol |
| **Proteger** | Controles de acceso y cifrado | Firebase Security Rules · TLS 1.3 · AES-256 · acceso por rol · datos ficticios en demo |
| **Detectar** | Monitoreo de anomalías | Agente IA de ciberseguridad · análisis de bitácora cada 5 min · Cloud Audit Logs |
| **Responder** | Acción ante incidentes | Alertas automáticas al administrador · reporte de seguridad por turno |
| **Recuperar** | Continuidad y respaldo | Backup digital de todos los registros · sincronización Firestore · historial inmutable |

---

### Tabla 1 — Las tres capas del framework de ciberseguridad

| Capa | Qué protege | Mecanismo | Estado |
|---|---|---|---|
| **Diseño (Privacy by Design)** | Superficie de ataque y exposición de datos | Arquitectura cloud-ready · dominio puro · sin dependencias externas · datos ficticios en demo | v0.1.0 — listo para despliegue en Google Cloud Run |
| **Infraestructura (Google Cloud)** | Datos en tránsito y en reposo | TLS 1.3 · cifrado en reposo · Firebase Security Rules · acceso por rol · aislamiento por residencia | v1.0 producción |
| **Monitoreo activo (Agente IA)** | Integridad de la operación 24/7 | Agente de ciberseguridad vía Gemini API (Vertex AI) · análisis continuo de la bitácora | v0.2 roadmap |

---

### Tabla 2 — Privacy by Design: decisiones de arquitectura y su impacto en seguridad

| Decisión de diseño | Por qué se tomó | Impacto en ciberseguridad |
|---|---|---|
| **Arquitectura cloud-ready desde v0.1.0** | Diseñado para desplegarse en Google Cloud Run sin cambios de dominio ni UI | La ruta a producción segura no requiere rediseño — solo activar la capa de infraestructura |
| Capa de repositorio desacoplada | `localStorage` en demo se reemplaza por Firebase en producción con un solo cambio de capa | Ninguna lógica de negocio depende del mecanismo de almacenamiento |
| Sin APIs externas en demo | Evitar dependencias de terceros en el prototipo | Cero riesgo de fuga hacia analytics, CDNs o telemetría durante la fase de demo |
| Datos ficticios obligatorios en demo | Contrato §8 — ningún dato real en el MVP | Imposible exponer PII de residentes reales durante demostraciones o pruebas |
| Auditoría append-only | Trazabilidad inmutable por diseño | El historial no puede borrarse ni editarse desde la UI — en demo ni en producción |
| Dominio puro sin dependencias externas | Arquitectura limpia y portable | Código de reglas de negocio aislado · testeable · no expuesto a la red |

**El MVP está listo para desplegarse en Google Cloud Run.** La infraestructura de
seguridad de producción se activa en ese paso — sin rediseñar nada. La ausencia de IA
en v0.1.0 fue una decisión de privacidad: ningún dato de residente alimenta un modelo
externo hasta que exista consentimiento informado y arquitectura de anonimización.

---

### Tabla 3 — Infraestructura de producción: controles de seguridad Google Cloud

| Control | Tecnología | Qué ataque mitiga |
|---|---|---|
| Cifrado en tránsito | TLS 1.3 (Cloud Run + Firebase) | Intercepción de datos en red (MITM) |
| Cifrado en reposo | AES-256 (Firestore + BigQuery) | Acceso físico no autorizado al almacenamiento |
| Acceso por rol | Firebase Security Rules | Un cuidador no puede ver datos de otra residencia |
| Aislamiento por residencia | Reglas de Firestore por tenant | Filtración de datos entre clientes (data leakage) |
| Autenticación | Firebase Auth (MFA disponible) | Acceso no autorizado con credenciales robadas |
| Auditoría de acceso | Cloud Audit Logs | Detecta accesos anómalos a datos de producción |
| Certificaciones de la plataforma | ISO 27001 · SOC 2 Type II · GDPR | Cumplimiento normativo demostrable ante inspección |

---

### Tabla 4 — Agente de IA de ciberseguridad: monitoreo activo vs. controles pasivos

| Capacidad | Control pasivo tradicional | Agente IA CareSignal (v0.2) |
|---|---|---|
| Detección de anomalías en la bitácora | Manual · revisión periódica | Automática · cada 5 minutos · 24/7 |
| Secuencias de eventos imposibles | No detectadas hasta auditoría | Detectadas en tiempo real vs. máquina de estados |
| Accesos fuera de horario | Log disponible · nadie lo revisa | Alerta inmediata al administrador |
| Verificación de configuración de seguridad | Manual · ocasional | Automática · reglas Firebase · permisos Cloud Run |
| Reporte de seguridad al director | No existe | Generado automáticamente por turno o por semana |
| Costo a 33 clientes | — | ~$8–10 USD/mes (Gemini Flash) |

---

### Tabla 5 — CareSignal vs. estándar de la industria en residencias (comparativa cruzada)

| Dimensión de seguridad | Residencia típica hoy | CareSignal v0.1.0 | CareSignal producción |
|---|---|---|---|
| Protección de datos de residentes | Papel · sin control | Cloud-ready · datos ficticios en demo | Cloud cifrado · aislado por residencia |
| Trazabilidad de acciones del personal | Sin registro | Bitácora inmutable · 20 tipos de evento | Bitácora + Cloud Audit Logs |
| Validación documental | Solo firma física | Firma física en impreso | Firma digital + firma física (doble validación) |
| Cumplimiento LFPDPPP | No verificable | Datos ficticios · sin PII real | Arquitectura de consentimiento + anonimización |
| Cumplimiento NOM-031-SSA3-2012 | Registros en papel | Registros automáticos imprimibles | Registros digitales + respaldo + firma |
| Detección de anomalías operativas | Ninguna | Motor temporal detecta retrasos | Agente IA monitorea continuamente |
| Marco normativo de referencia | — | LFPDPPP | LFPDPPP · ISO 27001 (Google Cloud) · SOC 2 |

---

### El argumento ante los jueces

> CareSignal no añadió seguridad como feature de marketing — la construyó como
> restricción de diseño. El MVP está listo para Google Cloud Run: activar la capa de
> infraestructura despliega TLS, cifrado, aislamiento por residencia y auditoría de
> accesos sin tocar una línea de dominio ni de UI. En v0.2, un agente de IA de
> ciberseguridad convierte la protección de datos de adultos mayores de un control pasivo
> en una capacidad activa y continua — el mismo estándar que hoy tienen las instituciones
> financieras y de salud de primer nivel.
