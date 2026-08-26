# 10 — Diagnóstico y trazabilidad de la entrega

> Mapa entre lo que pide la **Guía Oficial de Entrega de Proyectos WomenCISO 4 /
> MenCISO 1** y lo que existe en este repositorio. Cada criterio apunta a su evidencia
> concreta o declara que falta.
>
> **Este archivo es la lista de verificación de la entrega.** Actualizar el estado
> conforme avancen las tareas.
>
> Última actualización: **25 de agosto de 2026**

---

## 1. La convocatoria

Concurso de innovación en **Inteligencia Artificial y Ciberseguridad**.

| Hito | Fecha | Días restantes al 25 de agosto |
|---|---|---|
| Registro de proyectos | domingo 6 de septiembre | **12** |
| Publicación de semifinalistas | viernes 11 de septiembre | 17 |
| Presentación en vivo | jueves 17 de septiembre | 23 |

Formato de semifinal: **4 minutos de pitch + 4 de preguntas**, presencial o virtual.

### El desalineamiento de fondo

La convocatoria es de IA y ciberseguridad. El MVP **no tiene ninguna de las dos**, y no
por descuido: el contrato congelado prohíbe explícitamente la IA dentro del producto
(§5). Dos de los once criterios lo exigen de forma directa — el 1 pide un problema
«alineado con IA y ciberseguridad» y el 11 pide un framework de seguridad.

**Decisión tomada (E1.1):** reposicionar el proyecto sobre el eje de *integridad de
evidencia y protección de datos de población vulnerable*, más implementar
**encadenamiento de hashes en la bitácora** para que sea verificable
criptográficamente. La ausencia de IA se declara como decisión de privacidad
argumentada, no como carencia.

## 2. Trazabilidad de los 11 criterios de evaluación

| # | Criterio | Estado | Evidencia en el repositorio |
|---|---|---|---|
| 1 | Definición del problema, alineado con IA y ciberseguridad | 🟡 Parcial | `docs/00-product-contract.md` §2 · `09-datos-mercado.md` · **falta** el eje de seguridad en el enunciado |
| 2 | Solución innovadora, viable y con impacto | 🟡 Parcial | `README.md` · `src/` completo · viabilidad probada; innovación por reforzar |
| 3 | Conocimiento del mercado: competidores, oportunidades, necesidades | 🟡 Parcial | `09-datos-mercado.md` §1–3 · **falta** análisis de competencia (T-E2.2) |
| 4 | Propuesta de valor: qué la hace única | 🟡 Parcial | Dossier §5 · depende del criterio 3 para afirmar unicidad |
| 5 | Progreso del producto: prototipo o demo | 🟢 Fuerte | `04-acceptance-tests.md` · 38 pruebas en `tests/` · `WORKSHOP_DEMO_SCRIPT.md` · escenarios en `src/features/demo/` |
| 6 | Comunicación clara, visual y segura | 🟢 Fuerte | `business/` · `08-entregables.md` · **falta** el video |
| 7 | Trabajo en equipo: roles y colaboración | 🔴 Ausente | **Nada.** Decidido (E1.3): proyecto individual declarado, con el historial de 8 fases como evidencia de método |
| 8 | Innovación y creatividad | 🔴 Débil | `06-event-map.md` · protocolo de gates en `CHANGELOG.md` · **falta** nombrarlo como innovación (T-E2.4) |
| 9 | Factibilidad técnica y financiera | 🟡 Parcial | Técnica: `package.json`, build y pruebas · Financiera: **faltan precios** (E1.2) |
| 10 | Valor al usuario y al dueño | 🟡 Parcial | Dossier §4–5 · **falta** cuantificación (T-E2.3) |
| 11 | **Framework de ciberseguridad** | 🔴 Ausente | **Nada.** Es el hueco más grave por ser criterio explícito. Tarea T-E2.1 |

**Resumen:** 2 fuertes · 6 parciales · 3 débiles o ausentes.

## 3. Trazabilidad de los entregables obligatorios

| Entregable | Estado | Dónde está / qué falta |
|---|---|---|
| Presentación final (PDF, PPTX o enlace) | 🟡 Casi | `business/CareSignal_Pitch_Inversionistas.pptx` — 13 láminas, **4 con marcadores pendientes**; falta exportar a PDF |
| Video de presentación o demo | 🔴 No existe | Guion base en `WORKSHOP_DEMO_SCRIPT.md`; falta guion de 4 min y grabación |
| Desarrollo técnico (código, documentación) | 🟢 Fuerte | `src/`, `tests/`, `docs/00–09`, `contract/`, `CHANGELOG.md` |
| Repositorio personal de GitHub | 🔴 No existe | 8 commits **locales**, sin remoto configurado |
| README con objetivo, herramientas y resultado | 🟡 Adaptable | `README.md` es de producto; falta versión breve con esos tres apartados |
| Entrega por fork y Pull Request | 🔴 No iniciado | Requiere la estructura de la sección 4 |

### Estructura del video pitch (4 minutos)

| Bloque | Duración | Estado |
|---|---|---|
| Introducción: quién eres y qué haces | 15 s | 🔴 No existe |
| Pitch: problema, solución, valor | 1 min | 🟡 Hay material base |
| Demo del prototipo | 2 min | 🟡 Guion de 3 min, requiere recorte |
| Modelo de negocio | 45 s | 🔴 Bloqueado por precios (E1.2) |

## 4. Estructura de entrega objetivo

Lo que pide la guía en el repositorio oficial de la cohorte:

```
/proyectos-finales
  /nombre-apellido            ← pendiente de confirmar (E1.4)
    README.md                 ← objetivo · herramientas · resultado
    presentacion.pdf          ← desde business/*.pptx
    video.mp4                 ← o enlace
    /codigo                   ← el proyecto
```

Entrega mediante fork del repositorio oficial y Pull Request.

**Repositorios oficiales:** la guía indica uno para WomenCISO Gen 4 y otro para
MenCISO Gen 1, ambos bajo la cuenta `lorenabravo-design` en GitHub. Confirmar cuál
corresponde antes de hacer el fork.

## 5. Estado del plan de entrega

| Fase | Contenido | Estado |
|---|---|---|
| **E0** | Higiene del repositorio | ✅ **Completa** — commit `f9173c6` |
| **E1** | Decisiones humanas | 🔄 3 de 4 tomadas · 1 pendiente (GitHub) |
| **E2** | Contenido | ⏭ siguiente |
| **E3** | Ensamblado | pendiente |
| **E4** | Semifinal | solo si avanza |

### E1 — decisiones

| # | Decisión | Estado |
|---|---|---|
| E1.1 | Eje de IA y ciberseguridad | ✅ IA como funciones integrables en v0.2 (roadmap); arquitectura event-driven ya las soporta; criterio 11 cubierto por hash-chaining en auditoría |
| E1.2 | Precios y unidad de cobro | ✅ 3 planes por residencia: Esencial $1,490 · Profesional $3,490 · Institucional $6,990 (MXN/mes) |
| E1.3 | Equipo | ✅ Proyecto individual · Roberto García como Fundador / Product Owner / Arquitecto / UX |
| E1.4 | Cuenta de GitHub y nombre de carpeta | ⏳ **Pendiente** — bloquea toda la entrega |

### E2 — tareas de contenido

| Tarea | Cubre criterio | Estado |
|---|---|---|
| E2.1 · Documento de seguridad + solicitud de cambio para los hashes | 11, y refuerza 1 y 8 | ⏭ siguiente |
| E2.2 · Análisis de competencia | 3 y 4 | pendiente |
| E2.3 · Cuantificación de valor | 10 | pendiente |
| E2.4 · Reencuadre de innovación | 8 | pendiente |
| E2.5 · README de entrega | entregable | pendiente |

### E3 — ensamblado

| Tarea | Estado | Depende de |
|---|---|---|
| E3.1 · Cerrar el deck y exportar a PDF | pendiente | E1.2, E2.1, E2.2 |
| E3.2 · Publicar en GitHub y abrir el Pull Request | pendiente | E1.4 |
| E3.3 · Grabar el video de 4 minutos | pendiente | E1.2 |

## 6. Riesgos de la entrega

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Sin repositorio en GitHub al 6 de septiembre | **No hay participación** | E3.2 es mecánico; no dejarlo para el final |
| El video es la tarea de mayor plazo | Entrega incompleta | Tener el guion listo temprano aunque se grabe tarde |
| Los criterios 7 y 11 siguen en cero | Penalización directa en dos de once criterios | E2.1 y la declaración de equipo cierran ambos en días |
| Precios sin definir | Bloquea video, deck y escenario comercial | Decisión E1.2, solo depende de ti |
| El proyecto compite fuera del eje de la convocatoria | Desventaja estructural | Reposicionamiento de E2.1; la decisión ya está tomada |

## 7. Fuente

Guía Oficial de Entrega de Proyectos WomenCISO 4 y MenCISO 1, Fundación WomenCISO &
MenCISO IAP. Fechas verificadas contra el calendario 2026: el 6 de septiembre cae en
domingo y el 11 en viernes, coincidiendo con lo indicado en la guía.
