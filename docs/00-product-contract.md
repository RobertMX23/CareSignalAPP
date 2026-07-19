# 00 — Contrato de producto — CareSignal MVP

> **Fuente de verdad derivada.** Este archivo resume y operacionaliza el contrato
> congelado `contract/CareSignal_MVP_Proyecto_Ejecutivo_Contrato_v0.1.0_FROZEN.md`
> (línea base `0.1.0-workshop-frozen`). En cualquier conflicto, prevalece el contrato
> congelado. Posición en la jerarquía de autoridad: **#2**.
>
> Estado: **Chunk 1 / Gate C1**. Solo documentación. No se ha creado código React.

---

## 1. Qué es CareSignal

CareSignal es una **aplicación web de demostración** para residencias de adultos
mayores y agencias de cuidado. Permite a cuidadores y supervisores programar y
visualizar rondas, iniciarlas y completarlas, detectar rondas retrasadas o vencidas
mediante un **reloj simulado**, generar alertas amarillas y rojas, asignar/reasignar/
escalar, iniciar una verificación, registrar un resultado operacional, resolver y
cerrar el evento, y conservar una **bitácora auditable**.

Es un **MVP operacional de demostración**:

- **NO** es un dispositivo médico.
- **NO** es un sistema de diagnóstico.
- **NO** es un servicio de emergencias.

Toda pantalla debe mostrar el aviso **"MVP operacional, no dispositivo médico"** y un
indicador visible **"Datos ficticios"**.

## 2. Problema e hipótesis de valor

Las residencias operan rondas, verificaciones y escalaciones con papel, mensajes,
llamadas o memoria. No se sabe en tiempo real qué ronda está pendiente, quién es
responsable, cuánto lleva retrasada, si la alerta fue aceptada, si alguien verificó al
residente, cuál fue el resultado, ni cuándo se resolvió y cerró.

> **Hipótesis:** una plataforma sencilla de rondas, alertas y escalamiento puede
> reducir omisiones operativas y facilitar la coordinación de cuidadores y
> supervisores **sin** sustituir al personal ni realizar afirmaciones médicas.

Cliente objetivo de validación: residencia privada de 20 a 60 residentes o agencia de
cuidado domiciliario. Usuarios del MVP: cuidador, supervisor y administrador de demo.

## 3. Usuarios, permisos y responsabilidades

### 3.1 `caregiver` (cuidador)

Puede: consultar sus rondas; iniciar una ronda; completar una ronda; solicitar apoyo;
aceptar una alerta asignada; iniciar verificación cuando corresponda; registrar un
resultado permitido.

No puede: modificar la taxonomía; cerrar una alerta sin resolución; borrar auditoría;
alterar el reloj del demo (salvo que también tenga rol `demo_admin`).

### 3.2 `supervisor`

Puede: observar el dashboard; reconocer alertas; asignar y reasignar; escalar; iniciar
verificación; registrar resultado; resolver; cerrar; consultar auditoría.

### 3.3 `demo_admin` (administrador de demostración)

Puede: cambiar el usuario ficticio activo; controlar el reloj simulado; ejecutar
escenarios; restablecer los datos. No representa una función administrativa comercial
real.

## 4. Alcance incluido (v0.1.0-workshop)

Dashboard del supervisor; vista móvil del cuidador; listado de residentes ficticios;
rondas programadas y sus estados; alertas amarillas y rojas; asignación, aceptación,
reasignación y escalamiento; incidentes de verificación; registro de fecha, hora y
actor; bitácora auditable; reloj simulado; persistencia local; restablecimiento de
datos; diseño responsive; accesibilidad básica; datos exclusivamente ficticios.

## 5. Fuera de alcance (NO implementar en v0.1.0)

Medición de pulso; sensores o wearables; detección de fallecimientos; diagnóstico o
recomendación médica; expediente clínico; medicamentos; llamadas al 911; WhatsApp, SMS
o correo; geolocalización; reconocimiento facial; inteligencia artificial dentro del
producto; cámaras; pagos; autenticación real; backend; base de datos remota; APIs
externas; información personal real.

Toda propuesta fuera de alcance se registra en **Backlog v0.2** (contrato §20) y no se
implementa. Cualquier nueva entidad, rol, estado, transición, cambio de significado, o
alguno de los elementos anteriores, requiere **solicitud formal de cambio** y una nueva
versión del contrato (contrato §13).

## 6. No objetivos

El MVP no pretende: demostrar eficacia clínica; sustituir cuidadores, enfermeros o
supervisores; ser usado como único medio de emergencia; operar en producción; cumplir
todos los requisitos regulatorios de una solución comercial; calcular vidas salvadas;
ni validar hardware médico.

## 7. Reglas de negocio congeladas (contrato §6)

1. Una ronda pertenece a un residente.
2. Una ronda puede tener cero o un cuidador asignado.
3. Una ronda vencida puede originar una alerta.
4. Una misma ronda no puede tener dos alertas activas simultáneas.
5. Una alerta puede tener cero o un responsable activo.
6. Toda reasignación conserva al responsable anterior en la auditoría.
7. Toda transición registra actor, fecha y hora.
8. Una alerta resuelta requiere resultado de verificación.
9. Una alerta cerrada debe haber sido resuelta previamente.
10. El estado visual del residente se calcula a partir de rondas y alertas (derivado).
11. Una ronda completada no puede vencerse posteriormente.
12. Una ronda cancelada no genera alerta.
13. Corregir el origen de una alerta no la cierra automáticamente.
14. Una transición inválida debe devolver un error controlado.
15. Los componentes de interfaz no acceden directamente a `localStorage`.
16. La capa de repositorio es la única responsable de persistencia.
17. Toda acción material produce un `audit_event`.
18. La auditoría no puede editarse desde la interfaz del MVP.

## 8. Reglas de seguridad y comunicación

- Utilizar únicamente residentes y trabajadores **ficticios**.
- No presentar CareSignal como dispositivo médico.
- No afirmar que salva vidas, detecta enfermedades o sustituye al personal.
- En texto de interfaz, usar la expresión **"evento que requiere verificación"**.
- No mostrar diagnósticos ni condiciones médicas.
- No usar datos personales reales.
- Toda acción material queda en la bitácora.
- Una alerta nunca se cierra sin resultado de verificación.

## 9. Exclusiones médicas

CareSignal no diagnostica, no monitorea signos vitales, no detecta caídas ni
fallecimientos y no emite recomendaciones clínicas. Las categorías de ronda
(`routine_check`, `hydration_check`, `mobility_assistance`, `meal_assistance`,
`custom_operational_check`) son **operativas y ficticias**, no indicaciones médicas. El
estado visual del residente (`green`/`yellow`/`red`) es un **estado operacional
derivado**, no un diagnóstico, y no se almacena como fuente primaria.

## 10. Criterios para considerar estable la taxonomía (Gate C1)

- `alert` e `incident` están definidos como conceptos distintos.
- Los colores del residente son **derivados**, no persistidos.
- No existe lenguaje médico ni sinónimos prohibidos.
- No se agregaron funciones, entidades, roles, estados ni transiciones fuera de la
  taxonomía congelada.
- No se creó código de interfaz en este chunk.
