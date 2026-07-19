# 05 — Limitaciones conocidas y exclusiones — CareSignal MVP

> Fuente de verdad derivada del contrato congelado (§3.2, §3.3, §9). Este documento
> declara explícitamente qué NO hace el MVP y por qué. Estado: Chunk 8 / release
> `v0.1.0-workshop` (revisado; las exclusiones fundamentales no cambiaron desde el
> Chunk 1, ver también `docs/04-acceptance-tests.md` §4 para hallazgos de QA).

## 1. Naturaleza del producto

CareSignal v0.1.0-workshop es un **MVP operacional de demostración**. No es un
dispositivo médico, ni un sistema de diagnóstico, ni un servicio de emergencias. Su
objetivo es demostrar un **flujo operacional** (rondas → alertas → escalamiento →
verificación → resolución → cierre → auditoría), no eficacia clínica.

Cada pantalla debe mostrar de forma visible:

- **"MVP operacional, no dispositivo médico"**
- **"Datos ficticios"**

## 2. Exclusiones médicas (nunca implementar en esta línea base)

- No mide pulso ni signos vitales.
- No usa sensores, wearables ni cámaras.
- No detecta caídas ni fallecimientos.
- No emite diagnósticos ni recomendaciones médicas.
- No gestiona expedientes clínicos ni medicamentos.
- No muestra condiciones médicas de los residentes.

Las categorías de ronda son **operativas y ficticias**, no indicaciones médicas. El
estado visual del residente (`green`/`yellow`/`red`) es un **estado operacional
derivado**, no un diagnóstico.

## 3. Exclusiones técnicas (fuera de alcance v0.1.0)

- Sin backend, base de datos remota ni APIs externas.
- Sin autenticación real ni secretos.
- Sin inteligencia artificial dentro del producto.
- Sin geolocalización ni reconocimiento facial.
- Sin llamadas al 911, WhatsApp, SMS, correo ni notificaciones externas.
- Sin pagos.
- Sin datos personales reales — únicamente datos ficticios.

## 4. Limitaciones de la demostración

- La persistencia es local (`localStorage`); los datos viven en el navegador y pueden
  restablecerse con el control de demo.
- El paso del tiempo lo controla un **reloj simulado determinista**; no se usan esperas
  reales para producir rondas vencidas.
- El "cambio de usuario" es una selección de usuario ficticio, no un inicio de sesión.
- El MVP no está endurecido para producción ni cumple todavía requisitos regulatorios
  de una solución comercial.
- **Una ronda `overdue` es terminal** en la máquina de estados congelada (§7): no
  existe una transición de vuelta a `completed`/`in_progress`. Por eso, un residente
  cuya ronda quedó vencida seguirá mostrándose en **rojo** aunque su alerta asociada
  se resuelva y se cierre por completo — el color depende de la ronda, no solo de la
  alerta. Es el comportamiento esperado del modelo actual, no un error; una futura
  versión podría introducir una forma explícita de "reabrir"/reemplazar la ronda
  vencida (backlog v0.2).
- En teléfonos muy angostos (~375 px), la tabla de "Mis rondas" (8 columnas) requiere
  desplazamiento horizontal notable; es usable pero no ideal (backlog v0.2, ver
  `docs/04-acceptance-tests.md` §4).

## 5. No objetivos

El MVP no pretende demostrar eficacia clínica, sustituir personal, ser el único medio
de emergencia, operar en producción, calcular vidas salvadas ni validar hardware
médico.

## 6. Gobierno

Cualquier función listada aquí como excluida solo puede incorporarse mediante una
**solicitud formal de cambio** con análisis de impacto, aprobación humana y una nueva
versión del contrato (contrato §13). Las ideas se registran en **Backlog v0.2**
(contrato §20); nunca se implementan silenciosamente.
