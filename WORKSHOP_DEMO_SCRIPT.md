# CareSignal MVP — Guion de demo (workshop)

> Antes de empezar: `npm install && npm run dev`, abrir `http://localhost:5173`.
> Recordar en voz alta al público: **"MVP operacional, no dispositivo médico"** y
> **"todos los datos son ficticios"** — ambos avisos están siempre visibles en pantalla.

## Parte A — Recorrido rápido (2 min)

1. **Dashboard del supervisor** (pestaña por defecto).
   - Señalar las tarjetas: residentes en verde/amarillo/rojo, rondas próximas/
     vencidas, alertas abiertas/sin asignar/escaladas, verificaciones en progreso,
     tiempo mediano de respuesta.
   - Bajar a la tabla de residentes: cada uno con su estado derivado (texto + ícono,
     no solo color).
2. **Mis rondas** — cambiar el "Usuario ficticio" del encabezado a un cuidador
   (p. ej. Diego Franco) y mostrar cómo la lista se reordena: rojas primero,
   luego amarillas, en progreso, próximas, completadas.
3. **Residentes** y **Alertas** — abrir el detalle de una alerta roja para mostrar la
   línea de tiempo auditable y el historial de asignaciones.
4. **Control de demo** — mostrar el reloj simulado y explicar que nunca se usan
   esperas reales.

## Parte B — Escenario principal con los botones de escenario (bajo 1 minuto)

En **Control de demo**, siempre operando sobre la misma ronda fija (`round-01`,
Marta Ibáñez, empieza en verde):

1. Pulsar **"Escenario: ronda omitida"** → el reloj salta justo después del
   vencimiento; la ronda queda `overdue` y aparece una alerta amarilla.
2. Pulsar **"Escenario: alerta escalada"** → el reloj avanza hasta superar el
   umbral crítico (la alerta pasa a roja), se asigna a un cuidador y se escala al
   supervisor.
3. Pulsar **"Escenario: resolución completa"** → se inicia la verificación (se crea
   el incidente), se registra un resultado, se resuelve y se cierra. El mensaje
   final muestra el tiempo total del ciclo.
4. Desplazarse a "Últimos eventos de auditoría" para mostrar el rastro completo, o
   abrir la alerta desde **Alertas** para ver su línea de tiempo dedicada.

Repetir cualquiera de los tres botones no duplica nada — útil si alguien pregunta
"¿y si lo presiono dos veces?".

## Parte C — El mismo ciclo, a mano (para audiencias técnicas, ~3 min)

Si se quiere mostrar que no hay magia detrás de los botones, repetir el ciclo
manualmente sobre otra ronda vencida ya presente en la semilla (p. ej. Elena Vidal,
alerta roja escalada) desde **Alertas → alert-03**:

1. **Iniciar verificación** → se crea el incidente.
2. **Registrar resultado y resolver** → elegir un resultado operacional (p. ej.
   "Se brindó asistencia") — ninguno de los 6 resultados es una categoría clínica.
3. **Cerrar** → alerta e incidente quedan cerrados en el mismo paso.

Y del lado del cuidador, en **Mis rondas** con un cuidador que tenga una ronda
`due` (p. ej. Valeria Núñez / Antonio Salas):

1. **Iniciar ronda**.
2. **Completar ronda** → confirmar con una nota corta y un resultado operacional.

Ronda normal completa en **3 acciones o menos** desde que aparece en la lista.

## Parte D — Restablecer y cerrar (30 s)

- Pulsar **"Restablecer demo"** (encabezado o Control de demo) y confirmar en el
  diálogo. Todo vuelve exactamente a la semilla original: 10 residentes, 20 rondas,
  5 alertas, 2 incidentes.
- Recargar la página (F5) antes de restablecer, si se quiere demostrar que los
  datos persisten en el navegador entre sesiones.

## Notas para el presentador

- El reloj y los escenarios son deterministas: cualquier persona que siga estos
  pasos ve siempre el mismo resultado.
- Si alguien pregunta por qué un residente sigue en rojo después de resolver su
  alerta: es porque su ronda de origen quedó `overdue` (vencida), y ese estado es
  terminal en el modelo actual — el color depende de la ronda, no solo de la
  alerta. Ver `docs/05-known-limitations.md`.
- Duración total de la Parte A + Parte B: bajo 5 minutos, cumpliendo el límite del
  contrato para el escenario principal.
