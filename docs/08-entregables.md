# 08 — Índice de entregables

> Registro de todo el material producido: qué existe, dónde vive, cómo se regenera y
> cuál es la versión vigente. **Consultar este archivo antes de crear un entregable
> nuevo** — es probable que ya exista o que baste con regenerarlo.
>
> Autoridad: informativa. No altera el contrato congelado.

---

## 1. Documentación del producto (`docs/`)

| Archivo | Contenido | Autoridad |
|---|---|---|
| `00-product-contract.md` | Contrato de producto operacionalizado | #2 |
| `01-domain-taxonomy.yaml` | Vocabulario congelado | #3 |
| `02-state-machine.md` | Transiciones válidas y bloqueadas | #4 |
| `03-data-model.md` | Modelo de datos y decisiones de modelado | — |
| `04-acceptance-tests.md` | Matriz de las 20 pruebas obligatorias | #7 |
| `05-known-limitations.md` | Exclusiones médicas y técnicas | — |
| `06-event-map.md` | Mapa event-driven: 20 eventos, 8 políticas | — |
| `07-mockup-prompt.md` | Prompt de diseño anclado al contrato | — |
| `08-entregables.md` | Este archivo | — |
| `09-datos-mercado.md` | Cifras de mercado con fuente y fecha | — |
| `10-diagnostico-concurso.md` | Diagnóstico contra la convocatoria | — |
| `RESUME.md` | Estado actual y punto de reanudación | — |

## 2. Material comercial (`business/`)

Los binarios de presentación viven en `business/`, fuera de la raíz, para no mezclarse
con el código del producto.

### Generados por script — regenerables

| Archivo | Qué es | Regenerar con |
|---|---|---|
| `CareSignal_Dossier_Ejecutivo.docx` | Dossier de ~4,250 palabras: raíz del problema, avatares B2B/B2C, mercado, propuesta de valor, estado del producto y dos anexos | `npm run docs:dossier` |
| `CareSignal_Pitch_Inversionistas.pptx` | Deck de 13 láminas con notas del orador; cuatro marcadas como pendientes | `npm run docs:deck` |
| `CareSignal_Lamina_Apertura.pptx` | Lámina de apertura suelta, 16:9 | `npm run docs:lamina` |

Los tres a la vez: `npm run docs:all`

### Producidos a mano — no regenerables por script

| Archivo | Qué es | Estado |
|---|---|---|
| `CareSignal_Sales_Deck.pptx` | Deck de venta a residencias (13 láminas) | Vigente |
| `CareSignal_Pitch_Ejecutivo.pptx` | Pitch ejecutivo | Anterior |
| `CareSignal_Resumen_Ejecutivo_v3.pptx` | Resumen ejecutivo, versión 3 | Vigente de esa línea |
| `CareSignal_Resumen_Ejecutivo_v2.pptx` | Versión previa | Superado por v3 |
| `CareSignal_en_Casa_MiniDeck.pptx` | Concepto de línea B2C — **requiere contrato v0.2** | Concepto |

> **Pendiente:** `CareSignal_Resumen_Ejecutivo_v3.pdf` sigue en la raíz del repositorio;
> estaba bloqueado por un visor abierto al reorganizar. Moverlo a `business/`.

## 3. Páginas publicadas

Material publicado como página web. **Estas direcciones no viven en ningún otro sitio
del repositorio** — si se pierden, hay que regenerar el contenido desde cero.

| Página | Contenido |
|---|---|
| Mapa de eventos | Modelo event-driven completo |
| Avatar de cliente y propuesta de valor | Dolores del comprador y de los usuarios |
| Problemática de raíz | Causa raíz B2B y B2C con datos de mercado |
| Infografía vertical | Versión larga del argumento ejecutivo |
| Lámina 16:9 | Versión condensada para deck |
| Lámina de apertura | El pitch en una frase |
| Escenario Villa Serena | Recorrido del avatar B2B con el modelo de negocio |
| Diagnóstico del concurso | Los 11 criterios y el plan de tareas |
| Plan de ejecución | Fases E0–E4 |

> Las direcciones completas están en el historial de la conversación donde se
> publicaron. Conviene copiarlas aquí en cuanto se recuperen.

## 4. Guiones y material de presentación

| Recurso | Dónde | Uso |
|---|---|---|
| Guion de demo de taller | `WORKSHOP_DEMO_SCRIPT.md` | Demostración larga del producto |
| Guion de demo de venta, 3 min | Conversación | Pendiente de volcar a archivo |
| Guion de video, 4 min | **No existe** | Tarea E3.3 |
| Notas del orador | Dentro del `.pptx` del deck | Una por lámina |

## 5. Reglas para material nuevo

1. **Nunca contradice el contrato congelado.** Una lámina que promete una función
   inexistente es un defecto.
2. **Repite los límites del producto:** no es dispositivo médico, no detecta caídas, no
   sustituye personal.
3. **Toda cifra lleva fuente y fecha**, tomada de `09-datos-mercado.md`.
4. **Si es regenerable, su generador va en `tools/`** — no en un directorio temporal.
5. **Se registra en este índice** al crearse.
