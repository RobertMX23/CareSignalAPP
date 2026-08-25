# RESUME — Estado actual y punto de reanudación

> Nota de continuidad para retomar el proyecto en una sesión nueva. La fuente de verdad
> sigue siendo el contrato congelado; este archivo solo describe **dónde estamos** y
> **qué sigue**. Autoridad: informativa (por debajo del contrato, `CLAUDE.md` y `docs/`).
>
> **Fecha de captura:** 2026-08-25 · **Posición:** build completo, track E en curso

---

## 1. Lo que ya está terminado

**El MVP del producto está completo.** Las ocho fases del protocolo de construcción
(C0–C8) cerraron con aprobación humana y el resultado se publicó como
`v0.1.0-workshop` con auditoría de calidad **PASS**.

| Chunk | Descripción | Estado |
|---|---|---|
| C0 | Andamiaje + `CLAUDE.md` | ✅ |
| C1 | Contrato, taxonomía, límites | ✅ Gate C1 |
| C2 | Máquina de estados + modelo de dominio | ✅ Gate C2 |
| C3 | Datos ficticios, repositorio, reloj simulado | ✅ Gate C3 |
| C4 | Shell + navegación (5 páginas) | ✅ Gate C4 |
| C5 | Flujo del cuidador | ✅ Gate C5 |
| C6 | Dashboard y ciclo de alerta del supervisor | ✅ Gate C6 |
| C7 | Motor temporal + escenarios deterministas | ✅ Gate C7 |
| C8 | QA, accesibilidad, release | ✅ Gate C8 · **PASS** |

Resultados de la auditoría: 20/20 pruebas de aceptación del contrato, 38/38 pruebas
automatizadas, cero hallazgos `blocker`, un hallazgo `high` corregido (accesibilidad de
teclado en diálogos), uno `medium` y uno `low` documentados en backlog.

**No hay que reconstruir nada del producto.** Cualquier función nueva requiere una
solicitud formal de cambio y una nueva versión del contrato (contrato §13).

## 2. Lo que está en curso: el track E

El trabajo activo es preparar la entrega para el concurso **WomenCISO 4 / MenCISO 1**
(innovación en IA y ciberseguridad). No es desarrollo de producto.

**Fechas:** registro el domingo 6 de septiembre · semifinalistas el viernes 11 ·
presentación en vivo el jueves 17. Formato de semifinal: 4 minutos de pitch más 4 de
preguntas.

| Fase | Contenido | Estado |
|---|---|---|
| **E0** | Higiene del repositorio: estado, árbol, generadores, índices | 🔄 en curso |
| E1 | Decisiones humanas: eje de seguridad, precios, equipo, GitHub | ⏭ siguiente |
| E2 | Contenido: seguridad, competencia, métricas, innovación, README | pendiente |
| E3 | Ensamblado: cerrar deck, publicar en GitHub, grabar video | pendiente |
| E4 | Preparación de semifinal | solo si avanza |

### El hallazgo que ordena el track E

La convocatoria es de **IA y ciberseguridad**, y el MVP no tiene ninguna de las dos —
el contrato prohíbe la IA de forma explícita (§5). Dos de los once criterios de
evaluación lo exigen directamente. El diagnóstico completo, con la tabla de los once
criterios y el plan de tareas, está en `docs/10-diagnostico-concurso.md`.

### Las cuatro decisiones pendientes (E1)

Bloquean buena parte del contenido de E2:

1. **Eje de ciberseguridad:** reposicionar sin tocar el producto, añadir controles
   demostrables (encadenamiento de hashes en la auditoría), o añadir IA. La opción de
   IA contradice el contrato y exige nueva versión.
2. **Precios** de los tres planes y unidad de cobro (por residencia o por plaza).
3. **Equipo:** individual o colectivo, y roles.
4. **Cuenta de GitHub** y nombre de la carpeta de entrega.

## 3. Inventario del repositorio

```
contract/       Línea base congelada — FUENTE DE VERDAD
docs/           00–06 documentación del producto · 07+ material de entrega
business/       Decks y material comercial (binarios)
tools/          Generadores de entregables (.docx, .pptx)
src/domain/     Dominio puro: taxonomy, types, rules, transitions
src/data/       Persistencia: seed, repository, demoClock, temporalEngine, resetDemo
src/features/   rounds · alerts · dashboard · demo
src/components/ Layout, navegación, sesión ficticia, badges
src/pages/      Las 5 páginas del contrato
tests/          6 archivos, 38 pruebas
```

## 4. Cómo verificar que todo sigue sano

```bash
npm install
npm run typecheck    # TypeScript estricto, incluye tests/
npm run test         # 38 pruebas
npm run build        # compilación de producción
npm run dev          # http://localhost:5173
```

## 5. Estado de git

Siete commits, uno por fase más la línea base. **Sin remoto configurado** — publicarlo
es parte de E3 y es requisito formal de la convocatoria.
