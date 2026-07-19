# CareSignal MVP
## Proyecto ejecutivo, contrato de producto y paquete de prompts congelados

**Versión de línea base:** `0.1.0-workshop-frozen`  
**Estado:** `FROZEN / BASELINE APPROVED FOR BUILD`  
**Fecha de emisión:** 18 de julio de 2026  
**Idioma:** Español (México)  
**Destino:** Google AI Studio Build, con revisión cruzada opcional en Claude y OpenAI  
**Tipo de artefacto:** Contrato de producto + proyecto ejecutivo + protocolo de construcción incremental  

---

## 0. Declaración de congelamiento

Este documento constituye la **fuente de verdad contractual** para construir el MVP de CareSignal durante el workshop. A partir de su aprobación:

1. El alcance funcional, la taxonomía, los estados, las entidades, las transiciones, las exclusiones y los criterios de aceptación quedan congelados.
2. Ningún modelo de IA, desarrollador o participante puede modificar esos elementos de manera implícita.
3. Toda propuesta fuera del alcance debe registrarse en el backlog y no implementarse en la versión `0.1.0-workshop`.
4. Toda modificación material requiere una solicitud de cambio, análisis de impacto, aprobación humana y nueva versión del contrato.
5. Los prompts de los chunks deben ejecutarse en orden. Cada chunk termina en un gate de revisión y no autoriza el siguiente automáticamente.
6. El producto resultante es un **MVP operacional de demostración**, no un sistema médico, un dispositivo de diagnóstico ni un servicio de emergencias.

### Jerarquía de autoridad

Cuando exista una contradicción, prevalece el artefacto ubicado más arriba:

1. Este contrato congelado.
2. `docs/00-product-contract.md`.
3. `docs/01-domain-taxonomy.yaml`.
4. `docs/02-state-machine.md`.
5. `src/domain/types.ts`.
6. `src/domain/rules.ts`.
7. `docs/04-acceptance-tests.md`.
8. Código de interfaz y componentes.
9. Sugerencias generadas por cualquier modelo de IA.

---

# 1. Resumen ejecutivo

## 1.1 Problema

Las residencias de adultos mayores y las agencias de cuidado pueden operar con rondas, verificaciones y escalaciones registradas mediante papel, mensajes, llamadas o memoria. Esto dificulta conocer en tiempo real:

- qué ronda está pendiente;
- quién es responsable;
- cuánto tiempo lleva retrasada;
- si la alerta fue aceptada;
- si alguien verificó al residente;
- cuál fue el resultado operacional;
- cuándo se resolvió y cerró el evento.

## 1.2 Solución MVP

CareSignal es una aplicación web de demostración que permite:

- programar y visualizar rondas;
- iniciar y completar una ronda;
- detectar rondas retrasadas o vencidas mediante un reloj simulado;
- crear alertas amarillas y rojas;
- asignar, reasignar y escalar alertas;
- iniciar una verificación;
- registrar el resultado operacional;
- resolver y cerrar el evento;
- conservar una bitácora auditable.

## 1.3 Hipótesis de valor

> Una plataforma sencilla para rondas, alertas y escalamiento puede reducir omisiones operativas y facilitar la coordinación de cuidadores y supervisores sin sustituir al personal ni realizar afirmaciones médicas.

## 1.4 Cliente y usuarios iniciales

**Cliente objetivo para validación:** residencia privada independiente de 20 a 60 residentes o agencia de cuidado domiciliario.  
**Usuarios del MVP:** cuidador, supervisor y administrador de demostración.  
**Pagador futuro probable:** residencia, agencia, asociación civil, municipio, aseguradora o patrocinador.  

## 1.5 Decisión que debe habilitar el workshop

Al terminar el workshop se debe decidir:

- `CONTINUE`: el flujo es entendible y merece un piloto de 30 días;
- `REVISE`: el problema es válido, pero el flujo requiere cambios antes del piloto;
- `STOP`: el prototipo no demuestra valor operacional suficiente.

---

# 2. Correlación con las cinco categorías estratégicas

## 2.1 Negocio

- Cliente: residencia o agencia de cuidado.
- Usuario: cuidador y supervisor.
- Dolor: rondas omitidas, alertas sin dueño, baja trazabilidad y coordinación fragmentada.
- Propuesta de valor: registrar, alertar, escalar y comprobar la respuesta.
- Resultado económico futuro a validar: menos omisiones, menor tiempo de respuesta y menor carga administrativa.

## 2.2 Estrategia de frontera

**Ahora:** rondas, alertas, escalamiento, auditoría y reloj simulado.  
**Después:** QR/NFC, notificaciones, portal familiar y base de datos.  
**Futuro:** sensores, wearables, detección de caídas, patrones de actividad e integraciones.  

La versión `0.1.0-workshop` no implementa sensores ni funciones médicas.

## 2.3 Situación actual

Proceso manual de referencia:

```text
Supervisor define las rondas
        ↓
Cuidador recibe instrucciones
        ↓
Realiza la visita
        ↓
Registra en papel, mensaje o memoria
        ↓
Supervisor revisa posteriormente
```

Puntos de fallo que el MVP debe representar:

- ronda no registrada;
- cambio de turno;
- mensaje perdido;
- alerta sin asignación;
- falta de escalamiento;
- ausencia de evidencia horaria.

## 2.4 Prioridades

**P0 obligatorias:** rondas, confirmación, vencimiento, alerta, responsable, escalamiento, verificación, resolución, cierre y auditoría.  
**P1 deseables:** filtros, tiempos de respuesta, resumen de turno, notas y simulador.  
**P2 posteriores:** mensajes externos, sensores, portal familiar, analítica, integraciones y hardware.

## 2.5 Plan de ejecución

El proyecto se construye en ocho chunks: contrato y taxonomía; máquina de estados y modelo de datos; datos ficticios; shell; cuidador; supervisor; simulación; QA y release.

---

# 3. Contrato de alcance del producto

## 3.1 Incluido

1. Dashboard del supervisor.
2. Vista móvil del cuidador.
3. Listado de residentes ficticios.
4. Rondas programadas.
5. Estados de ronda.
6. Alertas amarillas y rojas.
7. Asignación, aceptación, reasignación y escalamiento.
8. Incidentes de verificación.
9. Registro de fecha, hora y actor.
10. Bitácora auditable.
11. Reloj simulado.
12. Persistencia local.
13. Restablecimiento de datos.
14. Diseño responsive.
15. Accesibilidad básica.
16. Datos exclusivamente ficticios.

## 3.2 Fuera de alcance

- medición de pulso;
- sensores o wearables;
- detección de fallecimientos;
- diagnóstico o recomendación médica;
- expediente clínico;
- medicamentos;
- llamadas al 911;
- WhatsApp, SMS o correo;
- geolocalización;
- reconocimiento facial;
- inteligencia artificial dentro del producto;
- cámaras;
- pagos;
- autenticación real;
- backend;
- base de datos remota;
- APIs externas;
- información personal real.

## 3.3 No objetivos

El MVP no pretende:

- demostrar eficacia clínica;
- sustituir cuidadores, enfermeros o supervisores;
- ser utilizado como único medio de emergencia;
- operar en producción;
- cumplir todavía todos los requisitos regulatorios de una solución comercial;
- calcular vidas salvadas;
- validar hardware médico.

---

# 4. Usuarios, permisos y responsabilidades

## 4.1 Caregiver

Puede:

- consultar sus rondas;
- iniciar una ronda;
- completar una ronda;
- solicitar apoyo;
- aceptar una alerta asignada;
- iniciar verificación cuando corresponda;
- registrar un resultado permitido.

No puede:

- modificar taxonomía;
- cerrar una alerta sin resolución;
- borrar auditoría;
- alterar el reloj del demo salvo que también tenga rol de administrador de demostración.

## 4.2 Supervisor

Puede:

- observar el dashboard;
- reconocer alertas;
- asignar y reasignar;
- escalar;
- iniciar verificación;
- registrar resultado;
- resolver;
- cerrar;
- consultar auditoría.

## 4.3 Demo admin

Puede:

- cambiar el usuario ficticio activo;
- controlar el reloj simulado;
- ejecutar escenarios;
- restablecer los datos.

No representa una función administrativa comercial real.

---

# 5. Taxonomía congelada del dominio

## 5.1 Entidades

| Término canónico | Definición contractual |
|---|---|
| `resident` | Persona ficticia asociada con rondas y alertas. No contiene diagnóstico. |
| `staff_member` | Usuario ficticio con rol, turno y disponibilidad. |
| `round` | Actividad operacional programada para verificar o asistir a un residente. |
| `alert` | Señal operacional que requiere asignación, atención y verificación. |
| `incident` | Registro formal abierto cuando una alerta entra en proceso de verificación. |
| `audit_event` | Registro inmutable de una acción o transición con actor y hora. |

## 5.2 Roles

- `caregiver`
- `supervisor`
- `demo_admin`

## 5.3 Tipos de ronda

- `routine_check`
- `hydration_check`
- `mobility_assistance`
- `meal_assistance`
- `custom_operational_check`

Estas categorías son operativas y ficticias. No son indicaciones médicas.

## 5.4 Estados de ronda

- `scheduled`
- `due`
- `in_progress`
- `completed`
- `overdue`
- `cancelled`

## 5.5 Estados de alerta

- `open`
- `acknowledged`
- `assigned`
- `escalated`
- `in_verification`
- `resolved`
- `closed`

## 5.6 Severidad de alerta

- `yellow`
- `red`

## 5.7 Estados de incidente

- `open`
- `verification_in_progress`
- `resolved`
- `closed`

## 5.8 Disponibilidad del personal

- `available`
- `busy`
- `off_shift`

## 5.9 Estado visual derivado del residente

- `green`: no existen rondas vencidas ni alertas activas relevantes.
- `yellow`: existe retraso inicial o alerta amarilla activa.
- `red`: existe ronda vencida crítica o alerta roja no resuelta.

El color es un estado operacional derivado. No es un diagnóstico y no se almacena como fuente primaria.

## 5.10 Diferencia entre alerta e incidente

- La alerta comunica que existe una condición operacional que requiere atención.
- El incidente documenta la verificación, el resultado y el cierre formal.
- Una alerta puede existir antes de que se abra un incidente.
- La versión MVP puede crear el incidente al iniciar la verificación.

## 5.11 Diferencia entre resolver y cerrar

- `resolved`: existe un resultado de verificación válido.
- `closed`: el resultado fue revisado y el ciclo administrativo terminó.
- Toda alerta cerrada debe haber sido resuelta.
- Cerrar no elimina la auditoría ni el historial.

## 5.12 Sinónimos ambiguos prohibidos en el código

No usar como estados o entidades alternativas:

- paciente;
- emergencia médica;
- diagnóstico;
- evento clínico;
- visita médica;
- muerte detectada;
- monitor cardíaco;
- expediente;
- alarma finalizada.

En texto de interfaz se permite “evento que requiere verificación”.

---

# 6. Reglas de negocio congeladas

1. Una ronda pertenece a un residente.
2. Una ronda puede tener cero o un cuidador asignado.
3. Una ronda vencida puede originar una alerta.
4. Una misma ronda no puede tener dos alertas activas simultáneas.
5. Una alerta puede tener cero o un responsable activo.
6. Toda reasignación conserva el responsable anterior en la auditoría.
7. Toda transición registra actor, fecha y hora.
8. Una alerta resuelta requiere resultado de verificación.
9. Una alerta cerrada debe haber sido resuelta.
10. El estado visual del residente se calcula a partir de rondas y alertas.
11. Una ronda completada no puede vencerse posteriormente.
12. Una ronda cancelada no genera alerta.
13. Corregir el origen de una alerta no la cierra automáticamente.
14. Una transición inválida debe devolver un error controlado.
15. Los componentes de interfaz no acceden directamente a `localStorage`.
16. La capa de repositorio es la única responsable de persistencia.
17. Toda acción material produce un `AuditEvent`.
18. La auditoría no puede editarse desde la interfaz del MVP.

---

# 7. Máquina de estados congelada

## 7.1 Round

```text
scheduled → due
due → in_progress
due → overdue
in_progress → completed
scheduled → cancelled
due → cancelled
```

Transiciones prohibidas destacadas:

```text
completed → overdue
cancelled → due
completed → in_progress
overdue → completed sin iniciar/verificar la acción correspondiente
```

## 7.2 Alert

```text
open → acknowledged
open → assigned
acknowledged → assigned
assigned → escalated
assigned → in_verification
escalated → assigned
escalated → in_verification
in_verification → resolved
resolved → closed
```

Transiciones prohibidas destacadas:

```text
closed → open
resolved → assigned
open → closed
assigned → closed
in_verification → closed
```

## 7.3 Incident

```text
open → verification_in_progress
verification_in_progress → resolved
resolved → closed
```

---

# 8. Modelo de datos mínimo congelado

## 8.1 Resident

```ts
interface Resident {
  id: string;
  displayName: string;
  room: string;
  monitoringFrequency: string;
  notes?: string;
  isActive: boolean;
}
```

## 8.2 StaffMember

```ts
interface StaffMember {
  id: string;
  displayName: string;
  role: 'caregiver' | 'supervisor' | 'demo_admin';
  shift: string;
  availability: 'available' | 'busy' | 'off_shift';
  isActive: boolean;
}
```

## 8.3 Round

```ts
interface Round {
  id: string;
  residentId: string;
  assignedStaffId?: string;
  type: RoundType;
  scheduledAt: string;
  dueAt: string;
  startedAt?: string;
  completedAt?: string;
  status: RoundStatus;
  completionNote?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 8.4 Alert

```ts
interface Alert {
  id: string;
  roundId: string;
  residentId: string;
  severity: 'yellow' | 'red';
  status: AlertStatus;
  assignedStaffId?: string;
  createdAt: string;
  acknowledgedAt?: string;
  escalatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  verificationOutcome?: VerificationOutcome;
  resolutionNote?: string;
}
```

## 8.5 Incident

```ts
interface Incident {
  id: string;
  alertId: string;
  residentId: string;
  status: IncidentStatus;
  openedAt: string;
  verificationStartedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  outcome?: VerificationOutcome;
  notes?: string;
}
```

## 8.6 AuditEvent

```ts
interface AuditEvent {
  id: string;
  entityType: 'round' | 'alert' | 'incident' | 'resident' | 'staff_member';
  entityId: string;
  action: string;
  actorId: string;
  previousState?: string;
  nextState?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
```

## 8.7 Convenciones

- Identificadores: cadenas estables.
- Fechas: ISO 8601.
- TypeScript: modo estricto.
- Prohibido usar `any`.
- No duplicar información derivable.
- No persistir el estado de color del residente.
- Implementar `deriveResidentStatus()` como función pura.
- Toda transición devuelve el nuevo estado, el `AuditEvent` o un error controlado.

---

# 9. Arquitectura técnica congelada

```text
React + TypeScript estricto
        ↓
Capa de dominio pura
        ↓
Repositorio local
        ↓
localStorage
        ↓
Datos ficticios + reloj simulado
```

## 9.1 Restricciones técnicas

- Sin backend.
- Sin autenticación real.
- Sin APIs externas.
- Sin secretos.
- Sin conexión a servicios médicos.
- Evitar dependencias innecesarias.
- La lógica de negocio no debe vivir dentro de componentes visuales.
- La interfaz consume funciones de dominio y repositorio.

## 9.2 Estructura objetivo

```text
caresignal-mvp/
├─ docs/
│  ├─ 00-product-contract.md
│  ├─ 01-domain-taxonomy.yaml
│  ├─ 02-state-machine.md
│  ├─ 03-data-model.md
│  ├─ 04-acceptance-tests.md
│  └─ 05-known-limitations.md
├─ src/
│  ├─ domain/
│  │  ├─ types.ts
│  │  ├─ taxonomy.ts
│  │  ├─ rules.ts
│  │  └─ transitions.ts
│  ├─ data/
│  │  ├─ seed.ts
│  │  ├─ repository.ts
│  │  ├─ demoClock.ts
│  │  └─ resetDemo.ts
│  ├─ features/
│  │  ├─ rounds/
│  │  ├─ alerts/
│  │  ├─ incidents/
│  │  └─ dashboard/
│  ├─ components/
│  ├─ pages/
│  ├─ App.tsx
│  └─ main.tsx
├─ tests/
├─ README.md
├─ WORKSHOP_DEMO_SCRIPT.md
└─ CHANGELOG.md
```

---

# 10. Datos ficticios requeridos

- 10 residentes ficticios.
- 3 cuidadores.
- 1 supervisor.
- 3 turnos.
- 20 rondas.
- 5 alertas de demostración.
- Incidentes coherentes.
- Eventos de auditoría coherentes.

## Escenarios obligatorios

1. Residente sin alertas.
2. Ronda próxima.
3. Ronda amarilla por retraso.
4. Ronda roja vencida.
5. Alerta sin asignar.
6. Alerta asignada.
7. Alerta escalada.
8. Verificación en progreso.
9. Incidente resuelto.
10. Ronda completada.

---

# 11. Pantallas congeladas

## 11.1 SupervisorDashboardPage

Debe mostrar:

- residentes verdes, amarillos y rojos;
- rondas próximas y vencidas;
- alertas abiertas y sin asignar;
- verificaciones en progreso;
- tiempo mediano de respuesta;
- alertas escaladas.

## 11.2 CaregiverRoundsPage

Debe mostrar:

- rondas del turno del cuidador activo;
- hora;
- habitación;
- residente;
- tipo;
- estado;
- prioridad;
- retraso;
- acciones permitidas.

## 11.3 ResidentDetailPage

Debe mostrar únicamente datos operativos ficticios:

- nombre;
- habitación;
- frecuencia;
- última ronda;
- próxima ronda;
- historial del día;
- alertas activas.

## 11.4 AlertDetailPage

Debe mostrar:

- residente;
- habitación;
- ronda origen;
- hora programada;
- retraso;
- severidad;
- estado;
- responsable actual;
- historial de asignaciones;
- línea de tiempo auditable.

## 11.5 DemoControlPage

Debe permitir:

- cambiar usuario ficticio;
- avanzar 1, 5 o 15 minutos;
- ejecutar escenarios;
- restablecer el demo.

---

# 12. Criterios de aceptación de release

La versión recibe `PASS` cuando:

1. El cuidador puede completar una ronda.
2. Una ronda vencida genera una alerta.
3. No se crean alertas activas duplicadas por la misma ronda.
4. Una alerta puede aceptarse.
5. Una alerta puede reasignarse y conserva historial.
6. Una alerta puede escalarse.
7. Puede iniciarse una verificación.
8. No puede cerrarse sin resolución.
9. No puede resolverse sin resultado.
10. Una alerta resuelta puede cerrarse.
11. Toda acción conserva auditoría.
12. El estado del residente se deriva correctamente.
13. Puede cambiarse el usuario ficticio.
14. Los datos persisten tras refrescar.
15. El demo puede restablecerse.
16. La vista funciona en ancho móvil.
17. La navegación básica funciona con teclado.
18. Los estados incluyen texto o iconos además del color.
19. Las transiciones inválidas son rechazadas.
20. El escenario principal se completa en menos de cinco minutos.
21. No existen datos reales.
22. No existen afirmaciones médicas.
23. La aplicación muestra el aviso “MVP operacional, no dispositivo médico”.
24. La versión queda identificada como `CareSignal MVP v0.1.0-workshop`.

---

# 13. Gobierno de cambios

## 13.1 Cambios que requieren nueva versión del contrato

- nueva entidad;
- nuevo rol;
- nuevo estado;
- nueva transición;
- cambio de significado de un término;
- incorporación de backend;
- autenticación real;
- integración externa;
- sensor o wearable;
- dato clínico;
- afirmación médica;
- cambio de criterios de aceptación;
- eliminación de auditoría;
- cambio de jerarquía de fuentes de verdad.

## 13.2 Flujo de cambio

```text
Solicitud de cambio
        ↓
Justificación y evidencia
        ↓
Impacto en alcance, datos, seguridad y pruebas
        ↓
Decisión humana
        ↓
Nueva versión del contrato
        ↓
Actualización de artefactos dependientes
        ↓
Implementación
```

## 13.3 Estados de solicitud

- `proposed`
- `under_review`
- `approved`
- `rejected`
- `deferred_to_backlog`
- `implemented`

## 13.4 Regla de no sobrescritura

La versión congelada no se edita silenciosamente. Una modificación aprobada crea una nueva versión, por ejemplo `0.1.1` o `0.2.0`, con changelog y trazabilidad.

---

# 14. Plan de workshop

| Sesión | Duración | Resultado |
|---|---:|---|
| Negocio | 45 min | Problema, usuario, comprador, resultado |
| Frontera | 30 min | Ahora, después y futuro |
| Situación actual | 30 min | Flujo manual y puntos de fallo |
| Prioridades | 30 min | P0, P1, P2 y exclusiones |
| Diseño | 60 min | Arquitectura y pantallas |
| Construcción | 120 min | Prototipo navegable |
| Red team | 45 min | Casos extremos y fallas |
| Integración y demo | 60 min | Release y decisión |

---

# 15. Paquete de prompts congelados

## PROMPT 0 — Instrucción maestra permanente

```text
Eres el arquitecto principal de producto, UX y desarrollo full-stack
del proyecto CareSignal MVP.

OBJETIVO DEL PRODUCTO

CareSignal es una aplicación web de demostración para residencias de
adultos mayores. Ayuda a cuidadores y supervisores a:

1. consultar rondas programadas;
2. confirmar que una ronda fue realizada;
3. detectar rondas retrasadas u omitidas;
4. generar y asignar alertas;
5. escalar alertas no atendidas;
6. registrar la verificación;
7. medir el tiempo de respuesta;
8. conservar una bitácora auditable.

PROPÓSITO DEL WORKSHOP

Construir un MVP navegable y evaluable con cuidadores, enfermeros y
directores de residencias. El MVP debe demostrar el flujo operacional,
no eficacia médica.

USUARIOS

1. Cuidador:
   - consulta sus rondas;
   - inicia una ronda;
   - completa una ronda;
   - solicita apoyo;
   - acepta una alerta;
   - registra una verificación.

2. Supervisor:
   - observa el estado general;
   - identifica rondas vencidas;
   - asigna y reasigna alertas;
   - escala eventos;
   - verifica tiempos de respuesta;
   - cierra incidentes.

3. Administrador de demostración:
   - cambia el usuario activo;
   - reinicia los datos;
   - controla el reloj simulado.

ALCANCE ESTRICTO DEL MVP

Incluye exclusivamente:

- dashboard de supervisor;
- vista móvil del cuidador;
- listado de residentes ficticios;
- rondas programadas;
- rondas pendientes, en progreso, completadas y vencidas;
- alertas amarillas y rojas;
- asignación, aceptación, escalamiento y cierre;
- incidentes de verificación;
- registro de fecha, hora y responsable;
- reloj simulado para la demostración;
- persistencia local;
- reinicio de datos ficticios;
- diseño responsive;
- accesibilidad básica.

FUERA DE ALCANCE

No implementar:

- medición de pulso;
- sensores;
- wearables;
- diagnóstico;
- detección de fallecimientos;
- expediente clínico;
- medicamentos;
- recomendaciones médicas;
- llamadas al 911;
- WhatsApp;
- SMS;
- geolocalización;
- reconocimiento facial;
- inteligencia artificial dentro del producto;
- pagos;
- autenticación real;
- base de datos remota;
- APIs externas;
- cámaras;
- datos reales.

REGLAS DE SEGURIDAD Y COMUNICACIÓN

- Utiliza únicamente residentes y trabajadores ficticios.
- No presentes CareSignal como dispositivo médico.
- No afirmes que salva vidas, detecta enfermedades o sustituye al personal.
- Utiliza la expresión “evento que requiere verificación”.
- No muestres diagnósticos ni condiciones médicas.
- No uses datos personales reales.
- Toda acción material debe quedar en la bitácora.
- Una alerta nunca debe cerrarse sin resultado de verificación.

TECNOLOGÍA

- Aplicación web.
- React.
- TypeScript estricto.
- Diseño responsive.
- Estado local.
- localStorage para persistencia del MVP.
- Sin backend para la versión 0.1.
- Sin autenticación real.
- Sin servicios externos.
- Sin secretos.
- Evita dependencias innecesarias.

FUENTES DE VERDAD

Cuando existan, estos archivos serán autoritativos:

1. docs/00-product-contract.md
2. docs/01-domain-taxonomy.yaml
3. docs/02-state-machine.md
4. src/domain/types.ts
5. src/domain/rules.ts
6. docs/04-acceptance-tests.md

No cambies términos, estados, transiciones o reglas definidos en estos
archivos sin:

1. identificar el conflicto;
2. explicar la modificación;
3. actualizar el changelog;
4. recibir aprobación explícita.

MODO DE TRABAJO

Trabaja incrementalmente por chunks.

Antes de modificar archivos:

1. inspecciona el estado actual;
2. identifica qué archivos serán afectados;
3. presenta un plan breve;
4. conserva las funciones existentes.

Después de cada chunk:

1. indica los archivos creados o modificados;
2. resume lo implementado;
3. ejecuta las validaciones disponibles;
4. reporta errores y limitaciones;
5. muestra cómo probar el resultado;
6. detente y espera el siguiente chunk.

No avances automáticamente hacia otra fase.
No agregues funciones no solicitadas.
No rediseñes componentes funcionales sin necesidad.
Realiza cambios mínimos y trazables.
```

---

## CHUNK 1 — Contrato, taxonomía y límites

```text
CHUNK 1 — CONTRATO, TAXONOMÍA Y LÍMITES DEL DOMINIO

Basándote en las instrucciones maestras, crea únicamente los siguientes
archivos:

1. docs/00-product-contract.md
2. docs/01-domain-taxonomy.yaml
3. docs/05-known-limitations.md
4. CHANGELOG.md

No construyas todavía componentes React.
No crees todavía pantallas.
No agregues backend.

La taxonomía debe incluir como mínimo:

ROLES
- caregiver
- supervisor
- demo_admin

ENTIDADES
- resident
- staff_member
- round
- alert
- incident
- audit_event

TIPOS DE RONDA
- routine_check
- hydration_check
- mobility_assistance
- meal_assistance
- custom_operational_check

Aclara que son categorías operativas ficticias y no indicaciones médicas.

ESTADOS DE UNA RONDA
- scheduled
- due
- in_progress
- completed
- overdue
- cancelled

ESTADOS DE UNA ALERTA
- open
- acknowledged
- assigned
- escalated
- in_verification
- resolved
- closed

SEVERIDAD DE ALERTA
- yellow
- red

ESTADOS DE INCIDENTE
- open
- verification_in_progress
- resolved
- closed

DISPONIBILIDAD DEL PERSONAL
- available
- busy
- off_shift

ESTADO VISUAL DERIVADO DEL RESIDENTE
- green
- yellow
- red

Define que el estado del residente es derivado y no un diagnóstico:
- green: no existen rondas vencidas ni alertas abiertas;
- yellow: existe retraso inicial o alerta amarilla;
- red: existe ronda vencida crítica o alerta roja no resuelta.

Incluye:
1. definición precisa de cada término;
2. sinónimos prohibidos o ambiguos;
3. diferencia entre alerta e incidente;
4. diferencia entre resolver y cerrar;
5. reglas de creación de alertas;
6. reglas de escalamiento;
7. reglas de auditoría;
8. exclusiones médicas;
9. alcance y no alcance;
10. criterios para considerar estable la taxonomía.

REGLAS MÍNIMAS
- Una ronda pertenece a un residente.
- Una ronda puede estar asignada a un cuidador.
- Una ronda vencida puede originar una alerta.
- Una misma ronda no puede generar dos alertas activas simultáneas.
- Una alerta puede tener cero o un responsable activo.
- Toda reasignación conserva al responsable anterior en la auditoría.
- Toda transición registra actor, fecha y hora.
- Una alerta resuelta requiere resultado de verificación.
- Una alerta cerrada debe haber sido resuelta previamente.
- El estado visual del residente se calcula a partir de rondas y alertas.

SALIDA ESPERADA
1. Muestra una tabla con entidades y definiciones.
2. Muestra la máquina conceptual de estados.
3. Enumera posibles ambigüedades.
4. Confirma que no se creó código de interfaz.
5. Detente.

No avances al modelo de datos.
```

### Gate C1

Aprobar sólo cuando alerta e incidente sean distintos, los colores sean derivados, no exista lenguaje médico y no se hayan agregado funciones.

---

## CHUNK 2 — Máquina de estados y modelo de datos

```text
CHUNK 2 — MÁQUINA DE ESTADOS Y MODELO DE DATOS

Usa docs/01-domain-taxonomy.yaml como fuente de verdad.
No cambies los nombres aprobados.
No construyas todavía las pantallas.

Crea:
1. docs/02-state-machine.md
2. docs/03-data-model.md
3. src/domain/types.ts
4. src/domain/taxonomy.ts
5. src/domain/rules.ts
6. src/domain/transitions.ts

MODELO MÍNIMO

Define tipos TypeScript estrictos para:

Resident
- id
- displayName
- room
- monitoringFrequency
- notes
- isActive

StaffMember
- id
- displayName
- role
- shift
- availability
- isActive

Round
- id
- residentId
- assignedStaffId
- type
- scheduledAt
- dueAt
- startedAt
- completedAt
- status
- completionNote
- createdAt
- updatedAt

Alert
- id
- roundId
- residentId
- severity
- status
- assignedStaffId
- createdAt
- acknowledgedAt
- escalatedAt
- resolvedAt
- closedAt
- verificationOutcome
- resolutionNote

Incident
- id
- alertId
- residentId
- status
- openedAt
- verificationStartedAt
- resolvedAt
- closedAt
- outcome
- notes

AuditEvent
- id
- entityType
- entityId
- action
- actorId
- previousState
- nextState
- timestamp
- metadata

CONVENCIONES
- IDs como cadenas estables.
- Fechas en ISO 8601.
- Campos opcionales claramente tipados.
- No usar any.
- No duplicar información derivable.
- No guardar el color del residente como dato permanente.
- Crear una función deriveResidentStatus().
- Crear validadores de transiciones.
- Crear funciones puras sin dependencias de interfaz.
- Toda transición válida debe producir AuditEvent.
- Las transiciones inválidas deben devolver error controlado.

MÁQUINA DE ESTADOS

Round:
scheduled → due
due → in_progress
due → overdue
in_progress → completed
scheduled → cancelled
due → cancelled

Alert:
open → acknowledged
open → assigned
acknowledged → assigned
assigned → escalated
assigned → in_verification
escalated → assigned
escalated → in_verification
in_verification → resolved
resolved → closed

Incident:
open → verification_in_progress
verification_in_progress → resolved
resolved → closed

No permitas:
- completed → overdue;
- closed → open;
- resolved → assigned;
- cerrar una alerta sin resolución;
- resolver sin resultado de verificación.

SALIDA ESPERADA
1. Archivos creados.
2. Diagrama textual de estados.
3. Tabla de transiciones válidas.
4. Tabla de transiciones bloqueadas.
5. Decisiones de modelado.
6. Confirmación de TypeScript estricto.
7. Detente.

No generes todavía la interfaz.
```

### Gate C2

Aprobar sólo cuando el código compila, no usa `any`, la taxonomía no cambió y las transiciones prohibidas están controladas.

---

## CHUNK 3 — Datos ficticios y persistencia

```text
CHUNK 3 — DATOS FICTICIOS Y PERSISTENCIA LOCAL

Utiliza sin modificar:
- docs/01-domain-taxonomy.yaml
- docs/02-state-machine.md
- src/domain/types.ts
- src/domain/rules.ts
- src/domain/transitions.ts

Crea:
1. src/data/seed.ts
2. src/data/repository.ts
3. src/data/demoClock.ts
4. src/data/resetDemo.ts

DATOS FICTICIOS

Genera:
- 10 residentes ficticios;
- 3 cuidadores;
- 1 supervisor;
- 3 turnos;
- 20 rondas;
- 5 alertas de demostración;
- incidentes y eventos de auditoría coherentes.

No utilices nombres de personas reales.
No utilices diagnósticos.
No utilices información clínica.

ESCENARIOS QUE DEBEN EXISTIR
1. Residente sin alertas.
2. Ronda próxima.
3. Ronda amarilla por retraso.
4. Ronda roja vencida.
5. Alerta sin asignar.
6. Alerta asignada.
7. Alerta escalada.
8. Verificación en progreso.
9. Incidente resuelto.
10. Ronda completada.

REPOSITORIO LOCAL

Implementa una capa de repositorio para:
- listar;
- consultar por ID;
- guardar;
- actualizar;
- reiniciar;
- persistir en localStorage;
- migrar o limpiar datos incompatibles;
- conservar auditoría.

No permitas que los componentes React accedan directamente a localStorage.
Toda interacción debe pasar por repository.ts.

RELOJ DE DEMOSTRACIÓN

Crea un reloj simulado que permita:
- avanzar un minuto;
- avanzar cinco minutos;
- avanzar quince minutos;
- restablecer la hora inicial.

El reloj debe ser determinista.
No uses esperas reales para demostrar rondas vencidas.

SALIDA ESPERADA
1. Inventario de datos generados.
2. Diagrama de acceso a datos.
3. Explicación del reloj.
4. Validación de integridad referencial.
5. Confirmación de que no se creó interfaz.
6. Detente.
```

### Gate C3

Aprobar sólo cuando todos los identificadores referenciados existen, la auditoría es coherente, el reloj es determinista y no existe acceso directo a `localStorage` desde UI.

---

## CHUNK 4 — Shell y navegación

```text
CHUNK 4 — SHELL DE LA APLICACIÓN Y NAVEGACIÓN

Construye la estructura visual del MVP sin implementar todavía toda la
lógica operacional.

Crea una aplicación React + TypeScript responsive.

PÁGINAS
1. SupervisorDashboardPage
2. CaregiverRoundsPage
3. ResidentDetailPage
4. AlertDetailPage
5. DemoControlPage

NAVEGACIÓN
- Dashboard
- Mis rondas
- Residentes
- Alertas
- Control de demo

ELEMENTOS GLOBALES
- encabezado con nombre CareSignal;
- selector de usuario ficticio;
- indicador de rol;
- hora simulada;
- navegación responsive;
- botón para restablecer demo;
- indicador visible de “Datos ficticios”;
- aviso “MVP operacional, no dispositivo médico”.

DISEÑO
- profesional;
- sencillo;
- alta legibilidad;
- botones grandes;
- contraste adecuado;
- compatible con computadora y móvil;
- no depender exclusivamente del color;
- acompañar estados con texto e íconos;
- evitar gráficas decorativas;
- evitar animaciones innecesarias.

RESTRICCIONES
- No agregues login real.
- No agregues backend.
- No agregues APIs.
- No agregues funciones médicas.
- No agregues nuevas entidades.
- No modifiques la máquina de estados.
- No implementes todavía automatización temporal completa.

SALIDA ESPERADA
1. Aplicación compilable.
2. Navegación funcional.
3. Pantallas con datos del repositorio.
4. Relación de componentes.
5. Instrucciones para probar.
6. Captura textual del flujo.
7. Detente.
```

### Gate C4

Aprobar sólo cuando compila, las cinco páginas existen, la navegación funciona y la UI no altera reglas del dominio.

---

## CHUNK 5 — Flujo del cuidador

```text
CHUNK 5 — FLUJO OPERACIONAL DEL CUIDADOR

Implementa exclusivamente el flujo del cuidador.

PÁGINA MIS RONDAS

Debe mostrar:
- rondas del turno del cuidador activo;
- hora programada;
- habitación;
- residente;
- tipo de ronda;
- estado;
- prioridad;
- tiempo de retraso;
- acciones permitidas.

ORDEN
1. Alertas o rondas rojas.
2. Rondas amarillas.
3. Rondas en progreso.
4. Rondas próximas.
5. Rondas completadas.

ACCIONES
- Iniciar ronda.
- Completar ronda.
- Solicitar apoyo.
- Abrir detalle.
- Aceptar alerta asignada.

COMPLETAR RONDA

Solicita:
- confirmación;
- nota opcional corta;
- resultado operacional:
  - completed_without_issue
  - assistance_requested
  - supervisor_verification_required

No uses categorías clínicas.

SOLICITAR APOYO

Debe:
1. crear o actualizar una alerta;
2. asignar severidad;
3. registrar al cuidador;
4. generar AuditEvent;
5. mostrar confirmación;
6. evitar alertas duplicadas.

EXPERIENCIA

Un cuidador debe completar una ronda normal en un máximo de tres acciones
después de abrirla.

RESTRICCIONES
- No cambies la taxonomía.
- No implementes el dashboard completo del supervisor.
- No agregues campos clínicos.
- No uses notificaciones externas.

PRUEBAS MANUALES
1. Iniciar ronda.
2. Completar ronda.
3. Solicitar ayuda.
4. Intentar completar dos veces.
5. Intentar una transición inválida.
6. Cambiar de cuidador.
7. Refrescar y conservar datos.

SALIDA ESPERADA
- archivos modificados;
- flujo implementado;
- transiciones utilizadas;
- pruebas realizadas;
- errores encontrados;
- instrucciones de demo;
- detente.
```

### Gate C5

Aprobar sólo cuando una ronda normal se completa en tres acciones o menos, se evita duplicidad y las transiciones inválidas no corrompen datos.

---

## CHUNK 6 — Dashboard y flujo del supervisor

```text
CHUNK 6 — DASHBOARD, ALERTAS Y ESCALAMIENTO

Implementa exclusivamente el flujo del supervisor.

DASHBOARD

Muestra:
- residentes en verde;
- residentes en amarillo;
- residentes en rojo;
- rondas próximas;
- rondas vencidas;
- alertas abiertas;
- alertas sin asignar;
- verificaciones en progreso;
- tiempo mediano de respuesta;
- alertas escaladas.

LISTA DE ALERTAS

Filtros:
- severidad;
- estado;
- responsable;
- residente;
- turno;
- asignadas/no asignadas.

DETALLE DE ALERTA

Debe mostrar:
- residente;
- habitación;
- ronda de origen;
- hora programada;
- tiempo de retraso;
- severidad;
- estado;
- responsable actual;
- historial de asignaciones;
- línea de tiempo auditable.

ACCIONES DEL SUPERVISOR
- reconocer;
- asignar;
- reasignar;
- escalar;
- iniciar verificación;
- registrar resultado;
- resolver;
- cerrar.

RESULTADOS DE VERIFICACIÓN
- resident_confirmed_ok
- assistance_provided
- caregiver_support_required
- supervisor_follow_up_required
- false_alert
- other_operational_result

No utilices diagnósticos.

REGLAS
- No cerrar sin resolver.
- No resolver sin resultado.
- Toda reasignación genera auditoría.
- Una alerta no asignada debe ser claramente visible.
- Un evento escalado debe conservar su historial.
- El color del residente debe recalcularse automáticamente.
- Los errores deben mostrarse de manera comprensible.

SALIDA ESPERADA
1. Dashboard funcional.
2. Flujo completo de alerta.
3. Auditoría visible.
4. Pruebas de transiciones.
5. Instrucciones de demostración.
6. Detente.
```

### Gate C6

Aprobar sólo cuando el ciclo de alerta funciona de principio a fin, la auditoría es visible y no puede cerrarse sin resultado.

---

## CHUNK 7 — Motor temporal y escenarios

```text
CHUNK 7 — MOTOR DE TIEMPO Y ESCENARIO DE DEMOSTRACIÓN

Integra el reloj de demostración con las rondas y alertas.

REGLAS TEMPORALES DEL MVP
- Antes de scheduledAt: scheduled.
- Desde scheduledAt hasta dueAt: due.
- Después de dueAt sin iniciar: overdue.
- Retraso inicial: alerta yellow.
- Retraso superior al umbral crítico del demo: alerta red.
- Una ronda completada no puede vencerse.
- Una ronda cancelada no genera alerta.
- No crear más de una alerta activa por ronda.
- Al corregirse el origen, la alerta no se cierra automáticamente;
  requiere verificación humana.

CONTROLES DE DEMO
- avanzar 1 minuto;
- avanzar 5 minutos;
- avanzar 15 minutos;
- ejecutar “Escenario ronda omitida”;
- ejecutar “Escenario alerta escalada”;
- ejecutar “Escenario resolución completa”;
- reiniciar datos.

ESCENARIO PRINCIPAL
1. Mostrar una ronda próxima.
2. Avanzar el reloj.
3. Convertirla en amarilla.
4. Avanzar nuevamente.
5. Convertirla en roja.
6. Generar la alerta.
7. Asignarla a un cuidador.
8. No responder.
9. Escalar al supervisor.
10. Iniciar verificación.
11. Registrar resultado.
12. Resolver.
13. Cerrar.
14. Mostrar la auditoría y el tiempo total.

La demostración completa debe poder realizarse en menos de cinco minutos.

SALIDA ESPERADA
- motor temporal implementado;
- escenarios reproducibles;
- confirmación de no duplicidad;
- pruebas realizadas;
- instrucciones paso a paso;
- detente.
```

### Gate C7

Aprobar sólo cuando los escenarios son deterministas, reproducibles y la demostración dura menos de cinco minutos.

---

## CHUNK 8 — QA y release

```text
CHUNK 8 — QA, ACCESIBILIDAD Y RELEASE V0.1.0

No agregues nuevas funciones.

Audita el MVP completo contra:
- docs/00-product-contract.md
- docs/01-domain-taxonomy.yaml
- docs/02-state-machine.md
- docs/04-acceptance-tests.md

Crea o actualiza:
1. docs/04-acceptance-tests.md
2. docs/05-known-limitations.md
3. README.md
4. CHANGELOG.md
5. tests correspondientes
6. WORKSHOP_DEMO_SCRIPT.md

PRUEBAS OBLIGATORIAS
1. Completar una ronda.
2. Generar alerta al vencer.
3. Evitar alerta duplicada.
4. Aceptar alerta.
5. Reasignar alerta.
6. Escalar alerta.
7. Iniciar verificación.
8. Impedir cierre sin resolución.
9. Resolver con resultado.
10. Cerrar correctamente.
11. Conservar auditoría.
12. Derivar estado del residente.
13. Cambiar de usuario.
14. Persistir al refrescar.
15. Restablecer el demo.
16. Usar la aplicación en ancho móvil.
17. Navegar con teclado.
18. Mostrar etiquetas además de colores.
19. Rechazar transiciones inválidas.
20. Completar el escenario principal en menos de cinco minutos.

CLASIFICA HALLAZGOS
- blocker;
- high;
- medium;
- low;
- backlog.

CORRIGE ÚNICAMENTE
- errores blocker;
- errores high;
- incumplimientos del contrato;
- problemas que impidan la demostración.

No incorpores mejoras medium o low; regístralas en backlog.

RELEASE

Marca la versión como:
CareSignal MVP v0.1.0-workshop

El README debe incluir:
- problema;
- alcance;
- usuarios;
- arquitectura;
- instalación;
- ejecución;
- reinicio;
- demo;
- pruebas;
- limitaciones;
- exclusiones médicas;
- próximos pasos.

SALIDA FINAL
1. Resultado PASS o FAIL.
2. Matriz de criterios de aceptación.
3. Errores abiertos.
4. Lista de archivos.
5. Guion de demo.
6. Backlog v0.2.
7. Confirmación de que no se añadieron funciones fuera del alcance.
```

### Gate C8

El release sólo se acepta con `PASS`, sin errores `blocker`, sin errores `high` que impidan la demostración y sin expansión de alcance.

---

# 16. Prompts de control

## 16.1 Reparación controlada

```text
MODO REPARACIÓN CONTROLADA

No rediseñes la aplicación.
No agregues funciones.
No cambies el modelo de datos.
No cambies la taxonomía.
No reescribas archivos no relacionados.

Problema observado:
[PEGAR AQUÍ EL ERROR O DESCRIBIR EL COMPORTAMIENTO]

Realiza:
1. reproduce o localiza el problema;
2. identifica la causa raíz;
3. enumera los archivos estrictamente afectados;
4. aplica el cambio mínimo;
5. conserva interfaces públicas existentes;
6. ejecuta las pruebas relacionadas;
7. verifica que no aparecieron regresiones;
8. registra la corrección en CHANGELOG.md.

Al terminar, informa:
- causa raíz;
- corrección;
- archivos modificados;
- pruebas ejecutadas;
- resultado;
- riesgos restantes.
```

## 16.2 Guardia contra expansión de alcance

```text
DETÉN LA EXPANSIÓN DE ALCANCE.

Compara el cambio propuesto contra docs/00-product-contract.md.

No implementes:
- sensores;
- pulso;
- diagnóstico;
- IA;
- backend;
- autenticación;
- WhatsApp;
- pagos;
- expediente clínico;
- nuevas entidades.

Revierte únicamente los cambios fuera de alcance, conserva lo que ya
cumple el contrato y registra las ideas descartadas en “Backlog futuro”.

No continúes hasta confirmar que el MVP vuelve a estar dentro del alcance.
```

## 16.3 Solicitud formal de cambio

```text
MODO SOLICITUD DE CAMBIO

No implementes todavía el cambio.

Cambio propuesto:
[DESCRIBIR CAMBIO]

Analiza:
1. problema que resuelve;
2. evidencia disponible;
3. elementos congelados afectados;
4. archivos afectados;
5. impacto en taxonomía;
6. impacto en estados y transiciones;
7. impacto en modelo de datos;
8. impacto en seguridad y privacidad;
9. impacto en pruebas;
10. impacto en workshop y calendario;
11. alternativas que no requieren cambiar el contrato;
12. recomendación: approve, reject o defer_to_backlog.

Genera una propuesta de versión y un changelog preliminar.
Detente y espera decisión humana.
```

## 16.4 Reanudación desde gate

```text
MODO REANUDACIÓN DESDE GATE

Gate aprobado: [C1–C8]

1. Inspecciona los artefactos generados hasta el gate.
2. Confirma que cumplen el contrato congelado.
3. Reporta desviaciones antes de modificar archivos.
4. Ejecuta exclusivamente el siguiente chunk autorizado.
5. No avances al chunk posterior.
6. Al terminar, entrega evidencia de pruebas y detente.
```

## 16.5 Red team cruzado

```text
MODO RED TEAM DEL MVP

No modifiques código en la primera respuesta.

Evalúa el proyecto contra:
- contrato congelado;
- taxonomía;
- máquina de estados;
- modelo de datos;
- criterios de aceptación.

Busca:
1. estados imposibles;
2. transiciones faltantes o peligrosas;
3. alertas duplicadas;
4. pérdida de auditoría;
5. conflictos de asignación;
6. datos huérfanos;
7. acciones sin permisos;
8. dependencia exclusiva del color;
9. lenguaje médico indebido;
10. funciones fuera del alcance;
11. fallas de persistencia;
12. escenarios que no pueden restablecerse.

Clasifica hallazgos en blocker, high, medium, low y backlog.
Propón correcciones mínimas y detente.
```

---

# 17. Handoffs entre modelos

## Gemini → Claude

Entregar:

- contrato;
- taxonomía;
- modelo de datos;
- lista de archivos;
- flujo implementado;
- capturas o descripción del prototipo;
- hallazgos abiertos.

Claude revisa accesibilidad, complejidad del flujo y riesgos de adopción sin cambiar la línea base.

## Claude → OpenAI

Entregar:

- hallazgos clasificados;
- cambios sugeridos;
- evidencia de cada problema;
- alternativas mínimas.

OpenAI compara los hallazgos contra contrato y criterios de aceptación; sólo autoriza correcciones contractuales o bloqueantes.

## Regla de integración

El modelo integrador no acepta una sugerencia por ser “mejor práctica” si modifica alcance congelado. Debe justificarla como corrección de incumplimiento o enviarla al backlog.

---

# 18. WBS resumida

| ID | Entregable | Dependencia | Gate |
|---|---|---|---|
| 1.0 | Contrato y taxonomía | Ninguna | C1 |
| 2.0 | Estados y modelo de datos | 1.0 | C2 |
| 3.0 | Datos, repositorio y reloj | 2.0 | C3 |
| 4.0 | Shell y navegación | 3.0 | C4 |
| 5.0 | Flujo del cuidador | 4.0 | C5 |
| 6.0 | Flujo del supervisor | 5.0 | C6 |
| 7.0 | Simulación determinista | 6.0 | C7 |
| 8.0 | QA y release | 7.0 | C8 |

---

# 19. Riesgos principales del MVP

| Riesgo | Tratamiento en v0.1.0 |
|---|---|
| Expansión de alcance | Contrato congelado y guard prompt |
| Estados inconsistentes | Máquina de estados y validadores puros |
| Alertas duplicadas | Regla de unicidad por ronda activa |
| Pérdida de trazabilidad | AuditEvent obligatorio |
| Datos clínicos accidentales | Datos ficticios y exclusiones explícitas |
| Dificultad de demo | Reloj determinista y escenarios predefinidos |
| Lógica dentro de UI | Capa de dominio separada |
| Persistencia inconsistente | Repositorio único y reset controlado |
| Fatiga visual | Texto e iconos, no sólo color |
| Cambio no autorizado por IA | Jerarquía de autoridad y gates |

---

# 20. Backlog permitido, no autorizado para v0.1.0

- QR o NFC para confirmar rondas;
- notificaciones internas;
- portal familiar;
- reportes de turno;
- exportación CSV/PDF;
- backend;
- autenticación;
- multi-residencia;
- configuración avanzada de turnos;
- integración con software de residencias;
- sensores y wearables;
- botón físico;
- comunicaciones externas;
- analítica avanzada;
- reglas configurables;
- aplicación móvil nativa.

---

# 21. Guion mínimo de demostración

1. Abrir el dashboard y mostrar los estados actuales.
2. Seleccionar una ronda próxima.
3. Avanzar el reloj hasta estado amarillo.
4. Avanzar hasta estado rojo.
5. Mostrar la alerta creada sin duplicidad.
6. Asignar al cuidador.
7. Simular falta de respuesta.
8. Escalar al supervisor.
9. Iniciar verificación.
10. Registrar resultado operacional.
11. Resolver.
12. Cerrar.
13. Mostrar auditoría completa.
14. Mostrar tiempo total de respuesta.
15. Restablecer el demo.

---

# 22. Registro de aprobación

| Campo | Valor |
|---|---|
| Línea base | `CareSignal MVP 0.1.0-workshop-frozen` |
| Decisión | Pendiente de aprobación humana |
| Aprobador | ______________________________ |
| Fecha | ______________________________ |
| Condiciones | ______________________________ |
| Gate de inicio | C0 / Autorización para ejecutar Prompt 0 y Chunk 1 |

## Declaración de aprobación

> Apruebo este documento como contrato de alcance y fuente de verdad para construir CareSignal MVP v0.1.0-workshop. Todo cambio material deberá seguir el procedimiento de control de cambios y producir una nueva versión.

---

# 23. Cierre

La línea base queda preparada para utilizarse de forma incremental en Google AI Studio Build. El orden obligatorio es:

```text
Prompt 0
  ↓
Chunk 1 → Gate C1
  ↓
Chunk 2 → Gate C2
  ↓
Chunk 3 → Gate C3
  ↓
Chunk 4 → Gate C4
  ↓
Chunk 5 → Gate C5
  ↓
Chunk 6 → Gate C6
  ↓
Chunk 7 → Gate C7
  ↓
Chunk 8 → Gate C8 / Release
```

