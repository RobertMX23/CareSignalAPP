# Prompt para generar el Mock-Up de CareSignal (5 ejes estratégicos)

> Prompt listo para pegar en una herramienta de IA de diseño/build (Google AI Studio
> Build, Figma AI, v0, etc.). Está anclado al contrato congelado
> `contract/CareSignal_MVP_..._FROZEN.md` y a `docs/01-domain-taxonomy.yaml`. Genera dos
> artefactos: **(A)** las 5 pantallas del MVP y **(B)** un lienzo estratégico de los 5
> ejes. Idioma de salida: **español (México)**.
>
> Reglas duras que el mock-up NO puede violar: es un **MVP operacional de demostración,
> no un dispositivo médico**; **datos 100% ficticios**; sin lenguaje clínico; toda
> pantalla muestra los avisos "MVP operacional, no dispositivo médico" y "Datos
> ficticios"; usar solo la taxonomía congelada (nombres en inglés) y la frase de
> interfaz permitida "evento que requiere verificación".

---

## PROMPT (copiar desde aquí)

```text
Eres diseñador de producto senior. Crea un MOCK-UP navegable y de alta fidelidad para
"CareSignal", un MVP web operacional de demostración para residencias de adultos
mayores. Estilo: minimalista, profesional, alta legibilidad, botones grandes, buen
contraste, responsive (desktop + móvil). NO dependas solo del color: acompaña cada
estado con texto e ícono. Paleta sobria con acentos Google (azul, rojo, amarillo,
verde). Español (México).

RESTRICCIONES INVIOLABLES
- Es un MVP OPERACIONAL DE DEMOSTRACIÓN. NO es dispositivo médico, ni diagnóstico, ni
  servicio de emergencias.
- Datos 100% FICTICIOS. Sin nombres reales, sin diagnósticos, sin datos clínicos.
- Cada pantalla muestra, visibles: "MVP operacional, no dispositivo médico" y
  "Datos ficticios".
- Vocabulario CONGELADO (usar tal cual, en inglés, como estados/etiquetas técnicas):
  Roles: caregiver, supervisor, demo_admin.
  Entidades: resident, staff_member, round, alert, incident, audit_event.
  Tipos de ronda: routine_check, hydration_check, mobility_assistance,
    meal_assistance, custom_operational_check.
  Estados de ronda: scheduled, due, in_progress, completed, overdue, cancelled.
  Estados de alerta: open, acknowledged, assigned, escalated, in_verification,
    resolved, closed.
  Severidad: yellow, red. Estado derivado del residente (nunca "diagnóstico"):
    green, yellow, red.
- PROHIBIDO usar: paciente, emergencia médica, diagnóstico, evento clínico, visita
  médica, muerte detectada, monitor cardíaco, expediente, alarma finalizada.
  En texto de interfaz, para el concepto de alerta usa "evento que requiere verificación".

ARTEFACTO A — LAS 5 PANTALLAS DEL MVP
Diseña estas cinco pantallas con datos ficticios coherentes (10 residentes, 3
cuidadores, 1 supervisor):

1) SupervisorDashboardPage — panorama general: residentes en green/yellow/red, rondas
   próximas y vencidas, alertas abiertas y sin asignar, verificaciones en progreso,
   tiempo mediano de respuesta y alertas escaladas. Tarjetas resumen + lista.
2) CaregiverRoundsPage (vista móvil) — rondas del turno del cuidador activo con: hora,
   habitación, residente, tipo, estado, prioridad, retraso y acciones permitidas
   (Iniciar ronda, Completar ronda, Solicitar apoyo, Abrir detalle, Aceptar alerta).
   Orden: rojas → amarillas → en progreso → próximas → completadas.
3) ResidentDetailPage — solo datos operativos ficticios: nombre, habitación,
   frecuencia, última ronda, próxima ronda, historial del día, alertas activas.
4) AlertDetailPage — residente, habitación, ronda de origen, hora programada, retraso,
   severidad, estado, responsable actual, historial de asignaciones y una LÍNEA DE
   TIEMPO AUDITABLE (audit_event con actor + fecha/hora).
5) DemoControlPage — cambiar usuario ficticio, avanzar reloj simulado (+1, +5, +15
   min), ejecutar escenarios y restablecer el demo.

Elementos globales en todas: encabezado "CareSignal", selector de usuario ficticio,
indicador de rol, hora simulada, navegación responsive (Dashboard, Mis rondas,
Residentes, Alertas, Control de demo), botón "Restablecer demo", y los dos avisos.

Muestra el FLUJO principal de extremo a extremo: una ronda pasa de próxima → amarilla →
roja → genera alert (sin duplicar) → assigned → sin respuesta → escalated → in_verification
→ resultado operacional → resolved → closed, con la auditoría visible. Regla: no se
puede cerrar sin resolver, ni resolver sin resultado de verificación.

ARTEFACTO B — LIENZO ESTRATÉGICO (one-pager, 5 columnas)
Un tablero visual tipo "Construye tu Estrategia" con 5 columnas para CareSignal:
1) Negocio — caso de negocio y drivers: cliente (residencia/agencia 20–60 residentes),
   usuarios (cuidador, supervisor), dolor (rondas omitidas, alertas sin dueño, baja
   trazabilidad); drivers de negocio, de tecnología y de entorno/regulación.
2) Estrategia de Frontera — Ahora (rondas, alertas, escalamiento, auditoría, reloj
   simulado) · Después (QR/NFC, notificaciones, portal familiar, base de datos) ·
   Futuro (sensores, wearables, patrones) — dejando claro que v0.1.0 NO incluye
   funciones médicas.
3) Situación Actual — flujo manual (papel/mensajes/memoria) y puntos de fallo (ronda no
   registrada, cambio de turno, mensaje perdido, alerta sin asignación, falta de
   escalamiento, sin evidencia horaria); tecnologías y regulaciones a considerar.
4) Prioridades — análisis de GAP y P0/P1/P2: P0 (rondas, vencimiento, alerta,
   responsable, escalamiento, verificación, resolución, cierre, auditoría), P1
   (filtros, tiempos, resumen de turno, notas, simulador), P2 (mensajería externa,
   sensores, portal familiar, analítica, integraciones).
5) Plan de Ejecución — construcción por 8 chunks con gates (C1…C8), estado actual y
   criterio de decisión del piloto (CONTINUE / REVISE / STOP).

ENTREGABLES
- Wireframes/mockups de alta fidelidad de las 5 pantallas (desktop y móvil).
- El lienzo estratégico de 5 columnas en una sola vista.
- Un flujo clickable que recorra el escenario principal en < 5 minutos.
- Nota al pie en cada lámina: "MVP operacional, no dispositivo médico · Datos ficticios".
```

---

## Notas de uso

- Si la herramienta permite adjuntar contexto, sube también
  `docs/01-domain-taxonomy.yaml` y `docs/02-state-machine.md` para forzar consistencia.
- El mock-up es solo visual; **no** sustituye la implementación gated (Chunks 3–8). No
  introducir entidades, estados ni transiciones nuevas: eso requiere solicitud formal de
  cambio (contrato §13).
