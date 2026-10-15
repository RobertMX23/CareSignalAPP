# Guía de contribución — CareSignal MVP

> Léela completa antes de escribir tu primera línea de código.  
> Fuente de verdad del producto: `contract/` y `CLAUDE.md`.  
> Datos ficticios · MVP operacional, no dispositivo médico.

---

## 1. Configurar el ambiente de desarrollo

### Requisitos
- Node.js 20+
- npm 10+
- Git

### Setup inicial
```bash
git clone https://github.com/RobertMX23/CareSignalAPP.git
cd CareSignalAPP
npm install
npm run dev          # http://localhost:5173
```

### Verificar que todo funciona
```bash
npm run typecheck    # TypeScript estricto — debe terminar sin errores
npm run test         # 38 pruebas unitarias — debe dar 38/38
npm run test:e2e     # 13 pruebas E2E — requiere que dev server esté corriendo
npm run build        # compilación de producción
```

---

## 2. Estructura del proyecto

```
src/domain/       Dominio puro: types, taxonomy, rules, transitions
                  ← NUNCA toques esto sin una aprobación explícita del PM
src/data/         Persistencia: seed, repository, demoClock, resetDemo
src/features/     rounds · alerts · incidents · dashboard · demo
src/components/   Componentes compartidos: Layout, nav, badges
src/pages/        Páginas de la app (una por ruta)
tests/            Pruebas unitarias (Vitest)
e2e/              Pruebas E2E (Playwright)
docs/             Documentación técnica y de producto
contract/         Contrato congelado — FUENTE DE VERDAD (no editar)
```

---

## 3. Reglas que nunca se rompen

Estas reglas vienen del contrato congelado (§6 y §9). No son negociables:

1. **Sin `any` en TypeScript** — el compilador está en modo strict.
2. **Los componentes UI nunca tocan `localStorage` directamente** — solo el repository layer.
3. **La lógica de negocio vive en `src/domain/`**, no en componentes.
4. **El audit es append-only** — nunca edites ni borres `AuditEvent`.
5. **El status del residente (`green`/`yellow`/`red`) se deriva, nunca se persiste.**
6. **Toda transición de estado registra actor + timestamp + `AuditEvent`.**
7. **Transiciones inválidas retornan un error controlado**, nunca corrompen el estado.
8. **Sin features fuera de scope** — si tienes una idea, abre un Issue con label `feature` y espera aprobación.

### Términos prohibidos en código, estados y entidades
`paciente`, `emergencia médica`, `diagnóstico`, `evento clínico`, `visita médica`,
`muerte detectada`, `monitor cardíaco`, `expediente`, `alarma finalizada`.

---

## 4. Flujo de trabajo con Git

### Convención de branches
```
feature/descripcion-corta     ← nueva funcionalidad
fix/descripcion-del-bug       ← corrección de bug
docs/descripcion              ← solo documentación
test/descripcion              ← solo pruebas
chore/descripcion             ← configuración, dependencias
```

### Ramas permanentes y promoción (B-07a)

```
feature/* ─PR─► master ─ff-only─► demo ─ff-only─► production
```

| Rama | Entorno | Deploy |
|---|---|---|
| `master` | Demo QA (quality gate) | canal `qa` del site de producción |
| `demo` | Demo público para jurados (congelado) | site `caresignal-demo` |
| `production` | Producción (beta) | site `caresignal-mvp-2026`, canal `live` |

- Nunca push directo a estas tres ramas; todo entra a `master` por PR (squash).
- `demo` y `production` solo avanzan por **fast-forward**; si no lo es, detente y pregunta.
- Un `hotfix/*` nace de `production` y se re-integra a `master` el mismo día.
- Rollback: revertir con PR o restaurar la versión anterior en Firebase Hosting.
- Detalle completo y reglas: `docs/20-contrato-ramas-cicd.md`.

### Convención de commits
```
feat: descripción de la nueva funcionalidad
fix: descripción del bug corregido
docs: descripción del cambio de documentación
test: descripción de pruebas agregadas/corregidas
chore: descripción de cambio de configuración
refactor: descripción de refactor (sin cambio de comportamiento)
```

Ejemplos:
```
feat: agregar filtro por severidad en lista de alertas
fix: corregir estado overdue cuando ronda ya estaba completada
test: agregar caso E2E para flujo de escalada de alerta
```

### Flujo completo de un PR
```
1. Crea tu branch desde master actualizado
   git checkout master && git pull
   git checkout -b feature/mi-feature

2. Trabaja en tu branch — commits pequeños y descriptivos

3. Antes de abrir el PR:
   npm run typecheck   ← debe pasar sin errores
   npm run test        ← 38/38
   npm run build       ← debe compilar limpio

4. Abre el PR hacia master en GitHub
   - Llena el template completo
   - Asigna a Roberto García como reviewer

5. El CI corre automáticamente (E2E Tests)
   - Si falla: revisa el log, corrige, push a la misma branch

6. Espera la aprobación del reviewer antes de hacer merge
   - NO hagas merge tú mismo si eres el autor del PR
```

---

## 5. Pruebas

### Unitarias (Vitest)
```bash
npm run test              # correr todas
npm run test -- --watch   # modo watch
```
- Viven en `tests/`
- Cubren: domain rules, transitions, repository, demoClock
- Toda nueva función de dominio debe tener prueba unitaria

### E2E (Playwright)
```bash
npm run test:e2e          # requiere dev server corriendo (npm run dev)
npm run test:e2e:ui       # modo visual con UI de Playwright
npm run test:e2e:debug    # modo debug paso a paso
```
- Viven en `e2e/`
- Cubren los flujos principales de cada rol
- Si modificas un flujo de UI, verifica que los E2E sigan pasando

---

## 6. Roles y permisos en el proyecto

| Rol | Puede |
|---|---|
| **Roberto García (PM/Arquitecto)** | Aprobar PRs, hacer merge a master, aprobar cambios de scope |
| **Developer** | Crear branches, abrir PRs, corregir código de la app |
| **QA Tester** | Abrir Issues, comentar en PRs, verificar fixes |

---

## 7. ¿Tienes dudas o quieres proponer algo?

- **Bug encontrado** → Issue con template `Bug Report`
- **Nueva funcionalidad** → Issue con template `Feature Request` + esperar aprobación del PM
- **Cambio de scope o contrato** → Habla directamente con el PM — requiere change request formal (contrato §13)
- **Pregunta técnica** → Comenta en el Issue o PR correspondiente
