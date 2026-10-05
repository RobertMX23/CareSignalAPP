# 14 — Política de diseño UI · CareSignal MVP

> Documento normativo para desarrolladores frontend y diseñadores UX/UI.
> Aplica a toda la interfaz de `src/`. Ninguna pantalla nueva puede contradirlo
> sin una solicitud de cambio aprobada.
>
> Autoridad: por debajo del contrato congelado y de `docs/00-product-contract.md`;
> por encima del juicio individual de componente.
>
> **Referencias externas consultadas:** WCAG 2.2 (W3C Rec. 12 dic 2024),
> WAI-ARIA APG Patterns, IBM Carbon Design System, Material Design 3.

---

## 0. Auditoría vs. mejores prácticas — resumen ejecutivo

Comparación contra WCAG 2.2 (Level AA) y guías de sistemas de diseño de referencia.

| # | Criterio / práctica | Estado actual | Acción |
|---|---------------------|---------------|--------|
| 1 | **Contraste texto 4.5:1** (WCAG 1.4.3 AA) | No documentado — tokens sin ratio verificado | Añadir tabla §1.4 |
| 2 | **Contraste UI no-texto 3:1** (WCAG 1.4.11 AA) | No documentado | Añadir §1.4 |
| 3 | **Áreas de toque 24 px mín.** (WCAG 2.5.8 AA *nuevo en 2.2*) | ✅ Excedemos (44 px) | — |
| 4 | **Áreas de toque 44 px** (WCAG 2.5.5 AAA) | ✅ Ya cumplimos | — |
| 5 | **Foco visible** (WCAG 2.4.7 AA) | ✅ Implementado — `:focus-visible` global + `--color-focus` token | — |
| 6 | **Foco no oculto** (WCAG 2.4.11 AA *nuevo en 2.2*) | No cubierto | Añadir §4.3 |
| 7 | **Teclado completo** (WCAG 2.1.1 A) | Ausente del doc | Añadir §4.5 |
| 8 | **ARIA role por severidad** (WAI-ARIA APG Alert) | Incompleto — toasts rojos usan `role="status"` en vez de `role="alert"` | Corregir §4.4 |
| 9 | **Auto-dismiss sin pausa** (APG + WCAG 2.2.2 A) | Toast a 5 000 ms sin pausa en hover | Añadir regla §4.4 |
| 10 | **Color + texto/ícono dual** (WCAG 1.4.1 A) | ✅ Ya en política §1.3 | — |
| 11 | **Mensaje de error en texto** (WCAG 3.3.1 A) | Implícito en `.inline-banner--error`, no documentado | Añadir §5.5 |
| 12 | **Idioma de la página** `lang` (WCAG 3.1.1 A) | No cubierto en política | Añadir §5.1 |
| 13 | **Nomenclatura de tokens** (convención 3-nivel) | Plana/semántica — aceptable para MVP | Documentar §1.5 |

---

## 1. Tokens de color

Todos los colores **deben** referenciarse con variables CSS de `:root`.
**Nunca** hardcodear un valor hexadecimal en un componente nuevo.

### 1.1 Paleta base

| Token                   | Valor       | Uso                                      |
|-------------------------|-------------|------------------------------------------|
| `--color-bg`            | `#f7f4f0`   | Fondo de la aplicación                   |
| `--color-surface`       | `#ffffff`   | Tarjetas, paneles, tablas                |
| `--color-border`        | `#ddd3c5`   | Bordes estándar                          |
| `--color-border-light`  | `#ede6db`   | Separadores sutiles                      |
| `--color-text`          | `#231a0f`   | Texto principal                          |
| `--color-text-muted`    | `#6b5744`   | Etiquetas, metadatos, hints              |
| `--color-primary`       | `#1a6b5c`   | Acciones principales, nav activa         |
| `--color-primary-dark`  | `#124f44`   | Hover de primario, encabezado de marca   |
| `--color-primary-bg`    | `#e5f3f0`   | Fondo de áreas de contexto primario      |
| `--color-primary-bd`    | `#7dbfb4`   | Borde de áreas de contexto primario      |

### 1.2 Colores semánticos

Cada color semántico tiene tres variantes: texto/ícono (`main`), fondo (`-bg`), borde (`-bd`).
**Siempre** usar las tres juntas para un mismo estado; no mezclar, p. ej., fondo rojo con borde amarillo.

| Estado   | Token main          | Token bg              | Token bd              | Cuando usar                              |
|----------|---------------------|-----------------------|-----------------------|------------------------------------------|
| Rojo     | `--color-red`       | `--color-red-bg`      | `--color-red-bd`      | Alerta roja, acción de peligro, error    |
| Amarillo | `--color-yellow`    | `--color-yellow-bg`   | `--color-yellow-bd`   | Alerta amarilla, advertencia             |
| Verde    | `--color-green`     | `--color-green-bg`    | `--color-green-bd`    | Completado, residente sin alertas, éxito |
| Gris     | `--color-gray`      | `--color-gray-bg`     | `--color-gray-bd`     | Cancelado, historial, estado inactivo    |
| Info     | `--color-info`      | `--color-info-bg`     | `--color-info-bd`     | Informativo, estado "acknowledged"       |

### 1.6 Tokens de interacción

| Token                   | Valor                                         | Uso                                   |
|-------------------------|-----------------------------------------------|---------------------------------------|
| `--color-focus`         | `#1a6b5c`                                     | Outline de foco (WCAG 2.4.7)          |
| `--focus-ring`          | `0 0 0 3px rgba(26,107,92,.35)`               | Box-shadow complementario al outline  |
| `--color-disabled`      | `#b0a89e`                                     | Texto de controles deshabilitados     |
| `--color-disabled-bg`   | `#f0ece7`                                     | Fondo de controles deshabilitados     |

### 1.7 Escala de espaciado (base 4 px)

| Token          | Valor  | Equivalente rem |
|----------------|--------|-----------------|
| `--space-1`    | 4 px   | 0.25 rem        |
| `--space-2`    | 8 px   | 0.5 rem         |
| `--space-3`    | 12 px  | 0.75 rem        |
| `--space-4`    | 16 px  | 1 rem           |
| `--space-5`    | 20 px  | 1.25 rem        |
| `--space-6`    | 24 px  | 1.5 rem         |
| `--space-8`    | 32 px  | 2 rem           |
| `--space-10`   | 40 px  | 2.5 rem         |
| `--space-12`   | 48 px  | 3 rem           |

### 1.8 Escala tipográfica

| Token          | Valor     | Equivalente px |
|----------------|-----------|----------------|
| `--text-xs`    | 0.75 rem  | 12 px          |
| `--text-sm`    | 0.875 rem | 14 px          |
| `--text-md`    | 1 rem     | 16 px (base)   |
| `--text-lg`    | 1.125 rem | 18 px          |
| `--text-xl`    | 1.25 rem  | 20 px          |
| `--text-2xl`   | 1.5 rem   | 24 px          |

### 1.9 Escala de border radius

| Token           | Valor    | Uso                                      |
|-----------------|----------|------------------------------------------|
| `--radius-sm`   | 4 px     | Badges, chips pequeños                   |
| `--radius-md`   | 8 px     | Tarjetas internas, inputs, botones       |
| `--radius-lg`   | 12 px    | Tarjetas principales, modales            |
| `--radius-pill` | 999 px   | Pills de estado, badges de nav           |

### 1.10 Elevación y sombras

| Token          | Valor                                    | Uso                     |
|----------------|------------------------------------------|-------------------------|
| `--shadow-sm`  | `0 1px 3px rgba(35,26,15,.08)`           | Tarjetas, inputs activos|
| `--shadow-md`  | `0 4px 12px rgba(35,26,15,.12)`          | Modales, dropdowns      |
| `--shadow-lg`  | `0 8px 24px rgba(35,26,15,.16)`          | Overlays, toasts        |

### 1.11 Motion

| Token                | Valor                          | Uso                               |
|----------------------|--------------------------------|-----------------------------------|
| `--duration-fast`    | 100 ms                         | Hover, toggle pequeño             |
| `--duration-base`    | 200 ms                         | Transiciones de estado estándar   |
| `--easing-standard`  | `cubic-bezier(.2,0,0,1)`       | Curva estándar Material M3        |

### 1.3 Regla de accesibilidad

El color nunca es el único diferenciador. Toda señal de color **debe** ir acompañada de
texto o ícono. Esta regla está en el contrato congelado (§ mock-up constraints) y es
verificada en la auditoría QA.

### 1.4 Ratios de contraste obligatorios (WCAG 1.4.3 y 1.4.11 — Level AA)

| Tipo de elemento | Ratio mínimo | Notas |
|------------------|--------------|-------|
| Texto normal (< 18 pt / 14 pt negrita) | **4.5:1** | Aplica a todo el cuerpo de texto |
| Texto grande (≥ 18 pt o ≥ 14 pt negrita) | **3:1** | Encabezados h1/h2, `.summary-card__value` |
| Componentes UI (bordes de inputs, botones, iconos gráficos) | **3:1** | WCAG 1.4.11 — non-text contrast |
| Texto deshabilitado / decorativo | Sin requisito | Solo si `disabled` real o puramente decorativo |

**Combinaciones verificadas de nuestra paleta:**

| Combinación de tokens | Ratio aprox. | Estado |
|-----------------------|--------------|--------|
| `--color-text` (#231a0f) sobre `--color-surface` (#fff) | ~17:1 | ✅ |
| `--color-text` sobre `--color-bg` (#f7f4f0) | ~15:1 | ✅ |
| `--color-text-muted` (#6b5744) sobre `--color-surface` | ~5.5:1 | ✅ |
| `#ffffff` sobre `--color-primary` (#1a6b5c) | ~5.8:1 | ✅ |
| `--color-red` (#b3261e) sobre `--color-red-bg` (#fce9e8) | ~4.6:1 | ✅ |
| `--color-yellow` (#92680a) sobre `--color-yellow-bg` (#fff3d0) | ~5.9:1 | ✅ |
| `--color-green` (#1a6b3c) sobre `--color-green-bg` (#e3f3e8) | ~6.1:1 | ✅ |

> Verificar con [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
> o la herramienta de Figma antes de agregar cualquier combinación nueva.

### 1.5 Convención de nomenclatura de tokens

Seguimos un modelo **2 niveles** (adecuado para MVP sin librería de componentes):

- **Nivel 1 — Primitivo:** valor exacto, no se usa directamente en componentes.
  Ejemplo: `--color-red` = `#b3261e` (definido en `:root`).
- **Nivel 2 — Semántico:** combina primitivo + rol. Ya implementados: `--color-red-bg`,
  `--color-red-bd`, etc.

En proyectos futuros con design system completo (Material M3, Carbon), se agrega
**Nivel 3 — Componente:** `--button-primary-bg`, `--badge-danger-text`, etc.
Para v0.x del MVP no es necesario.

---

## 2. Tipografía

| Nivel            | Familia    | Tamaño   | Peso | Uso                                   |
|------------------|------------|----------|------|---------------------------------------|
| Cuerpo base      | Nunito     | 16 px    | 400  | Párrafos, valores de campo            |
| Etiqueta muted   | Nunito     | 0.85 rem | 600  | `dt`, columnas de tabla, session-field |
| Hint / nota      | Nunito     | 0.9 rem  | 400  | Descripción de campo, `.hint`          |
| Encabezado h1/h2 | Nunito     | default  | 700  | Título de página, sección             |
| Marca (header)   | Nunito     | 1.5 rem  | 700  | `.app-header__title`                  |
| Valor destacado  | Nunito     | 1.75 rem | 700  | `.summary-card__value` (KPIs)         |
| Reloj grande     | Nunito     | 1.5 rem  | 600  | `.clock-indicator--large`             |

**Reglas:**
- No introducir fuentes externas adicionales sin aprobación.
- `line-height` de cuerpo = 1.5 — no reducir para hacer caber más contenido.
- `letter-spacing` en encabezados de tabla (`th`): `0.06em` para mejorar legibilidad
  de texto en mayúsculas.

---

## 3. Iconos y símbolos

### 3.1 Estrategia actual (MVP)

El MVP usa caracteres Unicode y emoji como iconos. No hay librería de SVG externa
(decisión de contrato: evitar dependencias innecesarias).

### 3.2 Inventario de iconos en uso

| Símbolo | Uso                               | Componente / clase            |
|---------|-----------------------------------|-------------------------------|
| `!`     | Severidad amarilla                | `SeverityBadge` — `yellow`    |
| `⛔`    | Severidad roja                    | `SeverityBadge` — `red`       |
| `⚠️`   | Toast de alerta creada (yellow)   | `ToastContainer`              |
| `🔴`   | Toast de alerta creada (red)      | `ToastContainer`              |
| `⬆️`   | Toast de alerta escalada          | `ToastContainer`              |
| `•`     | Punto de timeline (CSS `::before`)| `.timeline li`                |

### 3.3 Reglas para iconos nuevos

1. **Unicode primero.** Preferir un carácter Unicode estándar o emoji si existe y no
   causa ambigüedad de pantalla cruzada.
2. **Nunca ícono solo.** Siempre acompañar el ícono de texto (`aria-label` o texto visible).
   Los íconos solos se marcan con `aria-hidden="true"` y el texto adyacente lleva el significado.
3. **Consistencia semántica.** Los íconos de alerta roja y amarilla deben ser los mismos
   en toda la app; no usar símbolos distintos por contexto.
4. **SVG propio admitido en capas futuras (L-03+)** para íconos de app shell (PWA).
   Debe vivir en `public/` o `src/assets/`; no inline en componentes.

---

## 4. Eventos de clic e interacciones

### 4.1 Áreas de toque mínimas

Toda superficie interactiva debe cumplir **44 × 44 px** de área de activación (WCAG 2.5.5).
Esto ya está garantizado en:
- `.button` → `min-height: 44px`
- `.app-nav__link` → `min-height: 44px`
- `select` → `min-height: 44px`

Un componente nuevo que no respete esto es un defecto de accesibilidad.

### 4.2 Variantes de botón y cuándo usarlas

| Clase CSS             | Aspecto                     | Usar para                                    | No usar para                        |
|-----------------------|-----------------------------|----------------------------------------------|-------------------------------------|
| `.button`             | Teal sólido, texto blanco   | Acción principal de la pantalla (1 por vista)| Cancelar, descartar, links inline   |
| `.button--secondary`  | Superficie + borde gris     | Acciones secundarias, cancelar               | Acción principal                    |
| `.button--danger`     | Fondo rojo tenue + texto rojo | Acciones destructivas o irreversibles       | Acciones normales (evita alarma)    |
| `.button--small`      | Misma semántica, 38 px alt  | Tablas, filas de acción (`.row-actions`)     | Áreas donde cabe el tamaño estándar |
| `.link-button`        | Sin fondo, texto subrayado  | Descartar banners inline, acciones inline    | Acción principal o peligrosa        |

**Regla de una acción primaria:** cada pantalla o modal debe tener **máximo un** `.button`
sin modificador visible al mismo tiempo. Si hay dos acciones iguales de peso, una debe
ser `.button--secondary`.

### 4.3 Estados de interacción obligatorios

| Estado   | Requerido en                 | Implementación                        |
|----------|------------------------------|---------------------------------------|
| `:hover` | `.button`, `.summary-card--link`, `.app-nav__link` | Ya en CSS global |
| `:focus-visible` | Todo elemento interactivo | Ver reglas de foco a continuación |
| Cargando / deshabilitado | Cuando una acción tarda o no está disponible | `disabled` attr + opacidad o texto de estado |

**Reglas de foco (WCAG 2.4.7 AA + 2.4.11 AA nuevo en WCAG 2.2):**

1. **Nunca** eliminar `outline` sin reemplazarlo por un indicador con contraste ≥ 3:1
   respecto al estado sin foco (WCAG 2.4.13 AAA; como objetivo deseable).
2. Preferir `:focus-visible` sobre `:focus` para no mostrar el ring en clics de ratón.
3. El componente enfocado **no debe quedar completamente oculto** por elementos fijos
   (header, toast container). Si el toast tiene `z-index: 1000`, el scroll debe dejar
   visible el borde del elemento enfocado (WCAG 2.4.11 — Level AA).
4. El `nav-toggle` y el menú de navegación móvil deben ser accesibles por teclado
   (Tab para abrir, Escape para cerrar).

**✅ Implementado (E5/benchmark):** `src/index.css` define globalmente:
```css
:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
  box-shadow: var(--focus-ring);
}
```
El token `--color-focus` (#1a6b5c) y `--focus-ring` garantizan contraste ≥ 3:1 (WCAG 2.4.7 AA).

### 4.4 Feedback post-acción (patrón inline-banner)

Después de una acción del usuario que muta estado se muestra:
- **Éxito:** `.inline-banner.inline-banner--success` con texto descriptivo + botón `.link-button` "Cerrar".
- **Error:** `.inline-banner.inline-banner--error` con mensaje de error + botón `.link-button` "Cerrar".

El banner se coloca inmediatamente antes del área de acción que lo originó.
No usar `alert()` del navegador salvo para confirmaciones destructivas
(`window.confirm` — ya implementado con manejo explícito en E2E tests).

### 4.5 Notificaciones push (toasts — L-01)

Los toasts del `ToastContainer` son el canal de **notificación pasiva** (eventos del
motor temporal). No sustituyen al inline-banner de confirmación de acción directa.

| Propiedad   | Valor        | Fuente |
|-------------|--------------|--------|
| Posición    | `fixed`, esquina inferior derecha | — |
| Máximo visible | 3 simultáneos (los más recientes encima) | — |
| Auto-dismiss | 5 000 ms | — |
| Dismiss manual | botón `×` en cada toast | WCAG 2.2.2 A |
| Colores     | `.toast--yellow` / `.toast--red` (tokens semánticos) | — |
| ARIA yellow | `role="status"`, `aria-live="polite"`, `aria-atomic="false"` | WAI-ARIA APG Alert |
| ARIA red    | `role="alert"`, `aria-live="assertive"` | WAI-ARIA APG Alert |

**Corrección detectada (brecha #8):** los toasts de severidad `red` deben usar
`role="alert"` con `aria-live="assertive"` porque representan una condición urgente.
Los `yellow` continúan con `role="status"` / `polite`. Esta distinción está pendiente
de implementar en `ToastContainer.tsx`.

**Riesgo auto-dismiss (brecha #9 — APG + WCAG 2.2.2):**
> *"avoid designing alerts that disappear automatically"* — WAI-ARIA APG Alert Pattern.

WCAG 2.2.2 (Level A) exige que el contenido en movimiento/desaparición sea pausable.
Como mitigación mínima, el auto-dismiss **debe pausarse** mientras el cursor/foco
esté sobre el toast (`:hover` / `:focus-within`). Implementar con `clearTimeout` en
`mouseenter`/`focusin` y reiniciar en `mouseleave`/`focusout`.

### 4.6 Navegación por teclado (WCAG 2.1.1 — Level A)

Todo flujo funcional debe ser completable **sin ratón**. Reglas mínimas:

| Elemento          | Comportamiento esperado                                |
|-------------------|--------------------------------------------------------|
| Botones / links   | Activables con `Enter` y `Space`                       |
| Selects / inputs  | Navegables con flechas y Tab                           |
| Modales           | `Tab` cicla dentro del modal; `Escape` cierra          |
| Nav móvil         | `Tab` para abrir; `Escape` para cerrar; foco retorna al botón de apertura |
| Toasts            | `×` accesible por teclado; no deben atrapar el foco    |

Ningún componente nuevo puede bloquear el foco ("keyboard trap", WCAG 2.1.2)
salvo los modales, donde el foco debe permanecer dentro hasta el cierre.

---

## 5. Política de texto (copy)

### 5.1 Idioma, tono y atributo `lang` (WCAG 3.1.1 — Level A)

- **Idioma:** español (México) en toda la UI visible.
- **Atributo `lang`:** el documento HTML raíz debe declarar `lang="es-MX"` (WCAG 3.1.1).
  Actualmente: `<html lang="es">` en `index.html` — aceptable; mejorar a `"es-MX"`
  al refactorizar el shell.
- **Tono:** operacional, directo. Sin dramatismo, sin lenguaje clínico.
- **Persona gramatical:** segunda persona formal ("Seleccione", "Ingrese") o
  infinitivo ("Completar ronda", "Asignar").

### 5.2 Vocabulario prohibido (contrato § 6 / CLAUDE.md)

Las siguientes palabras están **prohibidas** en todo texto de interfaz, etiquetas,
mensajes de error y notificaciones:

`paciente`, `emergencia médica`, `diagnóstico`, `evento clínico`, `visita médica`,
`muerte detectada`, `monitor cardíaco`, `expediente`, `alarma finalizada`.

Para referirse al concepto de una alerta que requiere atención, usar **solo:**
> "evento que requiere verificación"

### 5.3 Avisos obligatorios en pantalla

Toda pantalla debe mostrar de forma visible:
1. **"MVP operacional, no dispositivo médico"** — banner superior `.banner--notice`.
2. **"Datos ficticios"** — badge `.badge--fictional` en el encabezado.

### 5.5 Mensajes de error (WCAG 3.3.1 — Level A)

Cuando una acción falla, el error **debe** describirse en texto — no solo con color rojo.

- Usar `.inline-banner.inline-banner--error` con mensaje descriptivo del problema.
- El texto del error debe ser específico: ❌ "Error" → ✅ "No se puede cerrar: la alerta
  no está resuelta".
- Los campos de formulario con error deben usar `aria-describedby` apuntando al mensaje
  de error, o `aria-invalid="true"`.

### 5.4 Etiquetas de estado (internacionalización UI)

Los estados técnicos se guardan en inglés (`scheduled`, `open`, etc.).
La UI los muestra siempre en español. El mapeo canónico está en:
- `src/domain/taxonomy.ts` (estados)
- `src/components/StatusBadge.tsx` y `SeverityBadge.tsx` (etiquetas de UI)

No redefinir etiquetas ad-hoc en páginas individuales.

---

## 6. Inventario de componentes CSS

Referencia rápida. Ver `src/index.css` para valores exactos.

| Clase                   | Tipo        | Descripción                                 |
|-------------------------|-------------|---------------------------------------------|
| `.button`               | Acción      | Botón primario (teal)                       |
| `.button--secondary`    | Acción      | Botón secundario (gris)                     |
| `.button--danger`       | Acción      | Botón destructivo (rojo tenue)              |
| `.button--small`        | Modificador | Reduce altura a 38 px                       |
| `.button-row`           | Layout      | Fila de botones con gap                     |
| `.link-button`          | Acción      | Acción inline (sin borde/fondo)             |
| `.badge`                | Indicador   | Píldora de estado genérica                  |
| `.badge--fictional`     | Aviso       | "Datos ficticios"                           |
| `.badge--role-*`        | Indicador   | Color por rol                               |
| `.status-badge`         | Estado      | Estado con color semántico (ronda/alerta)   |
| `.status-badge--{color}`| Modificador | `green` / `yellow` / `red`                 |
| `.summary-card`         | Contenedor  | Tarjeta KPI                                 |
| `.summary-card--{color}`| Modificador | Fondo semántico en tarjeta                  |
| `.summary-card--link`   | Modificador | Tarjeta clicable con hover                  |
| `.data-table`           | Tabla       | Tabla con filas de color semántico          |
| `.row-red/yellow/green` | Modificador | Color de fila en tabla                      |
| `.detail-list`          | Layout      | Grid `dt/dd` de dos columnas                |
| `.filter-bar`           | Layout      | Barra de filtros                            |
| `.inline-banner`        | Feedback    | Mensaje de resultado de acción              |
| `.inline-banner--success/error` | Modificador | Verde o rojo semántico               |
| `.modal-overlay`        | Overlay     | Fondo semitransparente de modal             |
| `.modal`                | Contenedor  | Tarjeta de modal (max 480 px)               |
| `.timeline`             | Lista       | Línea de tiempo auditable                   |
| `.toast-container`      | Notificación| Contenedor fixed de toasts                  |
| `.toast--yellow/red`    | Modificador | Color semántico de toast                    |
| `.hint`                 | Texto       | Nota aclaratoria en muted                   |
| `.banner--notice`       | Aviso       | Banner superior de aviso del sistema        |

---

## 7. Reglas de extensión

1. **Nuevo componente:** antes de crear una clase nueva, verificar que no existe una ya
   en este inventario que cubra el caso.
2. **Nuevo token de color:** solo si no existe uno semántico apropiado. Documentarlo
   en esta sección y en `:root` de `index.css`.
3. **Ícono nuevo:** documentarlo en la tabla § 3.2.
4. **Texto de interfaz nuevo:** verificar contra § 5.2 (vocabulario prohibido) antes de
   hacer commit.
5. **Modificaciones de accesibilidad:** cualquier cambio que reduzca el área de toque
   por debajo de 44 px o elimine un `role`/`aria-*` requiere aprobación explícita.
