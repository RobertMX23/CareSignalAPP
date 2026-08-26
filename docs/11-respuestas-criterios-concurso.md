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
cuidadores por turno. Esas funciones están diseñadas para v0.2, sobre **BigQuery ML /
Vertex AI**. La decisión de excluirlas de v0.1.0 fue deliberada: primero la estructura
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

---

## Criterio 3 · Conocimiento del mercado

### El mercado

México registra entre **1,297 y 1,500 residencias de cuidado de adultos mayores** según
la fuente (DENUE 2025 / INEGI 2020), más una informalidad no cuantificada. El 85% son
privadas. El sector crece al 18% interanual — impulsado por el envejecimiento acelerado
de la población: de 17.1 millones de personas mayores hoy a más de 20 millones en 2030
(CONAPO).

El segmento comprador es la **dirección de la residencia privada**: una operación con
presión familiar, riesgo reputacional y obligaciones normativas bajo la NOM-031-SSA3-2012
— y sin herramientas digitales específicas para su operación.

### El hueco competitivo

Las soluciones existentes caen en una de tres categorías, ninguna resuelve el problema
completo:

| Categoría | Ejemplos | Limitación |
|---|---|---|
| Software de expediente clínico | PointClickCare, MatrixCare | Diseñados para clínicas/hospitales, costosos, en inglés, requieren infraestructura |
| Hojas de cálculo / papel | — | Sin tiempo real, sin alertas, sin trazabilidad |
| Apps genéricas de gestión de tareas | Trello, WhatsApp | No modelan el dominio: sin estados de ronda, sin escalación, sin auditoría |

**CareSignal es el único MVP que modela el ciclo operativo completo de una residencia
en español, sin instalación, sin hardware adicional y con auditoría integrada.**

### La necesidad validada por la norma

La NOM-031-SSA3-2012 exige expediente por residente, programa de trabajo y manuales
técnico-administrativos. La CNDH supervisó menos del 4% de los centros durante la
pandemia — lo que significa que el riesgo de inspección es bajo pero la consecuencia es
máxima (clausura, como el caso del Asilo Santa Sofía en SLP, mayo 2025). CareSignal
responde exactamente a ese perfil de riesgo: bajo costo de adopción, alta cobertura ante
el evento de baja probabilidad y consecuencia grave.

---

## Criterio 4 · Propuesta de valor

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

Las funciones de IA planificadas para v0.2, sobre **BigQuery ML / Vertex AI**:

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

### Factibilidad financiera

**Modelo de ingresos:** SaaS B2B, suscripción mensual por residencia.

| Plan | Precio | Mercado objetivo |
|---|---|---|
| Esencial | $1,490 MXN/mes | Residencias pequeñas (hasta 25 residentes) |
| Profesional | $3,490 MXN/mes | Residencias medianas (hasta 75 residentes) |
| Institucional | $6,990 MXN/mes | Cadenas y residencias grandes |

**Escenario conservador — 3% de penetración** (DENUE 2025: ~1,100 residencias privadas):

| Métrica | Valor |
|---|---|
| Clientes | ~33 residencias |
| Ingreso mensual (mix Esencial/Profesional) | ~$80,000 MXN/mes |
| Ingreso anual | ~$960,000 MXN (~$48,000 USD) |
| Costo infraestructura Google Cloud | ~$37–62 USD/mes |
| Margen bruto estimado | **>95%** |

El modelo es rentable desde el primer cliente — Cloud Run escala a cero cuando no hay
tráfico y no genera costo fijo.

---

## Criterio 10 · Valor al usuario y al dueño

> _pendiente_

---

## Criterio 11 · Framework de ciberseguridad

> _pendiente_
