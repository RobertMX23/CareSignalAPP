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

> _pendiente_

---

## Criterio 7 · Trabajo en equipo: roles y colaboración

> _pendiente_

---

## Criterio 8 · Innovación y creatividad

> _pendiente_

---

## Criterio 9 · Factibilidad técnica y financiera

> _pendiente_

---

## Criterio 10 · Valor al usuario y al dueño

> _pendiente_

---

## Criterio 11 · Framework de ciberseguridad

> _pendiente_
