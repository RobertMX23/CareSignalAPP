# Memo ejecutivo — CareSignal MVP

**Para:** Comité Directivo / inversionista ángel [nombre por confirmar]
**De:** Panel integrado (gestión de proyecto, costos, producto, mercado), por encargo de Roberto García, Fundador
**Fecha:** 15 de octubre de 2026
**Asunto:** Estado, costo, valor y mercado de CareSignal; decisiones de esta semana
**Clasificación:** Confidencial, uso interno. MVP operacional, no dispositivo médico. Datos ficticios.

## 1. Resumen ejecutivo

El producto base (v0.1.0-workshop) está terminado y aprobado: 20 de 20 pruebas de aceptación y cero hallazgos bloqueantes. El riesgo principal es comercial: no existen clientes, pilotos ni testimonios; la tracción es de producto, no de mercado. La oportunidad principal es un hueco confirmado: los sistemas competidores administran expedientes, pero ninguno modela el ciclo de ronda operativa con estados formales. El costo actual de nube es marginal (estimado en cero a pocos dólares al mes; no hay facturación real que lo confirme). El próximo hito es cerrar la capa L-03 (aplicación instalable) y obtener tres pilotos antes del 30 de noviembre de 2026.

## 2. Estado de entrega (Gestión de proyecto)

**Completado:** las 8 fases del producto con aprobación humana; 59 pruebas automatizadas (corte al 4 de octubre); integración continua con revisión de accesibilidad; acceso con cuenta Google; Firebase Hosting en línea; materiales comerciales (presentación, dossier, guion).

**Capas de demostración (Fase E5):** el panel recibió el contexto con las cuatro capas pendientes; el repositorio indica otra cosa.

| Capa | Estado |
|---|---|
| L-01 Avisos (toasts) | Aprobada, 4 oct 2026 |
| L-02 Métricas | Aprobada, 4 oct 2026 |
| L-03 App instalable (PWA) | En desarrollo; meta: Lighthouse ≥ 80 |
| L-04 Calendario | Aprobada, 5 oct 2026 |

**Deuda técnica priorizada:**
1. Permisos (IAM) del despliegue de Cloud Functions, aún pendientes.
2. Video de 4 minutos sin grabar (guion listo).
3. `docs/RESUME.md` desactualizado (corte 4 oct).
4. Protección de ramas bloqueada por plan gratuito con repositorio privado.

## 3. Análisis de costos (Analista de costos)

> **Advertencia:** no hay cifras de facturación reales. Lo siguiente es estimación del panel con tarifas públicas de lista, a validar contra la consola de facturación. Costos mensuales en USD; adopción temprana = 50 residencias, ~1,000 usuarios/mes.

| Servicio | Hoy (demo, 0 usuarios) | 6 meses (adopción temprana) | 12 meses (adopción temprana) |
|---|---|---|---|
| Hosting (alojamiento web) | 0 | 0–2 | 1–5 |
| Auth (acceso con Google) | 0 | 0 | 0–5 |
| Firestore (base de datos) | 0 | 3–10 | 8–25 |
| Functions (lógica en servidor) | 0 | 0–3 | 2–8 |
| **Total mensual** | **≈ 0** | **≈ 5–15** | **≈ 10–40** |

**Umbral de alerta:** tope de USD 25/mes con avisos al 50 % y 90 % en Facturación de Google Cloud. **Optimización:** limitar lecturas en tiempo real y consolidar consultas de Firestore. **Lectura de negocio:** a precio Esencial ($1,490 MXN/mes por residencia, no validado con clientes), 50 residencias facturarían $74,500 MXN/mes; la nube es un costo menor frente a soporte y ventas.

## 4. Valor del producto y cartera v0.2 (Producto)

**Propuesta diferencial:** cubre el ciclo completo ronda → retraso → alerta → escalación → verificación → cierre, con bitácora que no se puede editar y acceso por rol. Declara sus límites: no es dispositivo médico, no detecta caídas, no sustituye personal.

**Brechas:** sin datos reales ni clientes; la función de inteligencia artificial figura solo como hoja de ruta; los precios carecen de validación; la persistencia en nube necesita respaldo contractual (ver propuesta formal).

**Cartera v0.2 que NO requiere cambio al contrato:**
1. Cerrar L-03 (aplicación instalable) con Lighthouse ≥ 80.
2. Resolver permisos de Functions y activar alertas de presupuesto.
3. Guion de piloto guiado con datos ficticios y encuesta de disposición a pagar.
4. Grabar y publicar el video de 4 minutos.
5. Reverificar el dato de 85 % de sector privado (2018) y actualizar `RESUME.md`.

**Propuesta de cambio formal (§13):** versión 0.3.0 que formalice acceso con cuenta Google, persistencia en Firestore y operación multirresidencia. El contrato v0.1.0 excluye autenticación real y base remota; hoy el código ya los usa. Las funciones de inteligencia artificial requerirían una propuesta posterior y separada.

## 5. Mercado y posicionamiento (Investigación de mercado)

Las cifras provienen de `docs/09-datos-mercado.md` (verificado el 26 de agosto de 2026).

- **Mercado total (TAM):** USD 25.6 mil millones en cuidados de largo plazo en México (Grand View Research, 2025) frente a USD 20.6 mil millones en mercado geriátrico (IMARC Group, 2025). Son firmas privadas y discrepan; no son datos oficiales.
- **Mercado alcanzable (SAM):** ~1,100–1,300 residencias privadas formales (DENUE, 2025). DENUE registra 1,297 establecimientos; INEGI (2020) cita ~1,500 centros. Son metodologías distintas y hay informalidad no cuantificada.
- **Mercado capturable (SOM):** 50–200 residencias en 3–5 años (estimación del panel).
- **Competidores:** Cronos Care (México, +50 residencias activas) y GERIGES (España, versión México), ambos de expediente y administración; ninguno publica precios (búsqueda web, 26 ago 2026). Su cobertura se limita a lo detectable públicamente.
- **Señal de adopción:** el registro de residencias creció 18 % de 2024 a 2025 (DENUE, cálculo propio), y Cronos Care demuestra que ya se compra software en el segmento.
- **Ventana de oportunidad:** la NOM-031-SSA3-2012 sigue vigente, pero la CNDH supervisó 58 de ~1,500 centros (CNDH, 2020): la norma legitima la compra, no la fuerza. La ventana existe mientras nadie ocupe el ciclo de ronda operativa; su duración es juicio del panel.

## 6. Matriz de riesgos

| # | Riesgo | Prob. | Impacto | Acción mitigante | Dueño |
|---|---|---|---|---|---|
| 1 | **Alto.** Sin validación comercial: cero pilotos | 70 % | Alto | Conseguir 3 pilotos o cartas de intención antes del 30 nov 2026 | R. García |
| 2 | **Alto.** Código en nube fuera del contrato v0.1.0 | 60 % | Alto | Presentar cambio formal v0.3.0 antes del 31 oct 2026 | R. García |
| 3 | **Medio.** Dependencia de una sola persona | 50 % | Alto | Documentar decisiones (ADR vigentes) y sumar un colaborador técnico en el primer trimestre de 2027 | Comité |
| 4 | **Medio.** Precios sin validar | 60 % | Medio | 5 entrevistas con direcciones de residencias | Asesor comercial |
| 5 | **Bajo.** Permisos de Functions pendientes | 40 % | Bajo | Asignar rol de despliegue y repetir el flujo | R. García |

## 7. Decisiones requeridas del Comité Directivo

1. Aprobar la solicitud de cambio formal v0.3.0 (acceso Google, Firestore, multirresidencia). **Dueño:** Roberto García. **Fecha:** 31 oct 2026.
2. Fijar tope de gasto en nube de USD 25/mes con alertas. **Dueño:** Roberto García. **Fecha:** 20 oct 2026.
3. Autorizar la búsqueda de 3 residencias piloto con datos ficticios. **Dueño:** Presidente del Comité. **Fecha:** 30 nov 2026.
4. Aprobar entrevistas para validar precios. **Dueño:** Asesor comercial (por designar). **Fecha:** 15 dic 2026.
5. Cerrar la puerta de aprobación L-03 y grabar el video. **Dueño:** Roberto García. **Fecha:** 6 nov 2026.

---
*Datos por completar:* facturación real de Google Cloud, fecha del demo, nombre del inversionista.
