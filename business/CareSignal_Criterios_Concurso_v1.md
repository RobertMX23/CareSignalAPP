CareSignal
Respuestas a los 11 Criterios de Evaluación
WomenCISO 4 / MenCISO 1 — Concurso de Innovación en IA y Ciberseguridad
Agosto 2026  ·  Roberto García  ·  Fundador y Líder de Proyecto  ·  robertogarciaits@gmail.com  ·  linkedin.com/in/robertogarciaits  ·  844 588 1313
&quot;MVP operacional, no dispositivo médico  ·  Datos ficticios&quot;
Criterio 1 · Definición del problema, alineado con IA y ciberseguridad
El problema
17.1 millones de personas mayores de 60 años viven en México (CONAPO, 2025). Más de 1,297 residencias de cuidado operan en el país (DENUE, 2025), el 85% privadas, creciendo al +18% interanual. La mayoría opera con registros en papel o en hojas de cálculo. Cuando una ronda se retrasa, nadie lo sabe hasta que es demasiado tarde.
El resultado: adultos mayores sin trazabilidad operativa. En un informe de la CNDH se documentaron condiciones de abandono, falta de personal y deficiencias operativas en residencias — consecuencia de no contar con sistemas de gestión operativa que garanticen que el cuidado ocurrió, en el momento correcto, con la persona correcta. La NOM-031 exige registros permanentes y cualquier inspección, queja o demanda puede llegar sin aviso. Una multa bajo la Ley General de Salud puede superar los $234,000 MXN — y eso es solo la primera.
Contexto internacional — escala global del problema
⚠ Nota: Se estima (fuentes: US Census Bureau, Statistics Japan, Destatis, UN World Population Prospects 2022). Datos no verificados directamente — declarar ante jueces.
País / Región
Se estima personas 65+
% de población
Fuente de referencia
México
17.1 millones (60+)
12.8 %
CONAPO 2025 ✅ verificado
Estados Unidos
~57 millones
~17 %
US Census Bureau 2023
Japón
~36 millones
~29 %
Statistics Japan 2023
Alemania
~18 millones
~22 %
Destatis 2023
América Latina (65+)
~65 millones
—
CEPAL / ONU 2024 ✅ verificado
Global (total mundial)
~771 millones
~10 %
UN World Population Prospects 2022
Proyección global 2050
~1,600 millones
~16 %
UN World Population Prospects 2022
Por qué ahora — ventana de oportunidad 2026
Fuerza
Dato clave
Implicación
Crecimiento del sector
+18% interanual (DENUE 2024→2025)
Más residencias sin herramientas digitales
NOM-031 sin fiscalización real
Menos del 4% supervisadas (CNDH, 2020)
Quien llega digitalizado llega protegido
Envejecimiento acelerado
17.1 M hoy → 20 M+ en 2030 (CONAPO)
Demanda crece más rápido que la oferta
Alineación con IA y Ciberseguridad
Ciberseguridad: Los datos de adultos mayores son datos sensibles bajo la LFPDPPP. Hoy viven en cuadernos, WhatsApp y correos sin cifrar. CareSignal los estructura y protege con arquitectura sobre Google Cloud Run + Firebase, cifrado TLS y acceso por rol.
Inteligencia Artificial: La bitácora de 20 tipos de evento que genera CareSignal es el insumo exacto para alertas predictivas, detección de anomalías y optimización de asignación. Funciones diseñadas para v0.2 sobre BigQuery ML · Gemini API. En v0.1.0 se excluyen por privacidad: primero la estructura de datos correcta.
Criterio 2 · Solución innovadora, viable y con impacto
La solución
CareSignal digitaliza el ciclo operativo completo de una ronda: programación → ejecución → detección de retrasos → alertas → escalación → verificación → cierre. No es un formulario — es un sistema de trazabilidad operativa con una máquina de estados que impide transiciones inválidas.
Por qué es viable
Sin fricción de adopción: funciona en el navegador, sin instalación, en el mismo teléfono que ya tiene el cuidador.
Costo predecible: modelo por residencia, no por plaza. Sin sorpresas para el comprador.
Respaldo normativo: la NOM-031-SSA3-2012 exige registros administrativos. CareSignal los genera como subproducto natural de la operación.
Operación manual vs. CareSignal
⚠ Nota: Estimados de referencia; no datos medidos en campo
Actividad
Modo manual
Con CareSignal
Registrar una ronda
4–6 min · planilla en papel
~1 min · 3 acciones en pantalla
Detectar ronda atrasada
Al final del turno o nunca
Automático en tiempo real
Escalar alerta al supervisor
Llamada o búsqueda física
Inmediato, trazable, con actor registrado
Preparar reporte del turno
20–30 min de transcripción
Generado como subproducto de la operación
Una residencia de 50 residentes realiza ~450 rondas por semana. A 5 min de overhead manual, son ~37 horas semanales de registro sin valor operativo. Con CareSignal baja a menos de 8 horas — y el registro es auditable.
Innovación frente a competidores reales
Lo que los competidores cubren
Lo que ninguno cubre
Lo que CareSignal agrega
Expediente de residente
Rondas con estados formales
Programación → retraso detectado automáticamente
Control de medicamentos
Alertas por incumplimiento
Alerta automática con timestamp y actor
Facturación y cobros
Escalación trazable
Escalación con historial de propietario de alerta
Portal familiar
Auditoría inmutable del turno
Bitácora append-only: 20 tipos de evento
Criterio 3 · Conocimiento del mercado
Dimensión y crecimiento del mercado
Indicador
Valor actual
Proyección
Fuente
Personas 60+ en México
17.1 M (12.8%)
~28 M en 2040 · ~33 M en 2050
CONAPO / INAPAM
Personas 65+ en LatAm
~65 millones
~138 M en 2050 (18.9%)
CEPAL / OPS
Dependencia de cuidados LatAm
~8 millones
Se triplica hacia 2050
BID / OPS
Déficit de cuidadores LatAm
3 M hoy vs. 14 M necesarios
Brecha de 11 M
BID
Cuidado no remunerado MX
26.3% del PIB
—
INEGI (ENUT)
Mercado geriátrico MX
USD 20.6 B
USD 37.6 B en 2034 (CAGR 6.7%)
IMARC Group ⚠
Long-Term Care MX
USD 25.6 B
USD 43.9 B en 2033 (CAGR 6.6%)
Grand View Research ⚠
Residencias privadas MX
~1,297–1,500
+18% interanual
DENUE 2025 / INEGI
⚠ Nota: IMARC Group y Grand View Research son firmas privadas de investigación de mercado, no fuentes oficiales.
TAM / SAM / SOM — dos líneas de mercado
Nivel
Línea
Estimación
Lógica
TAM
Cuidados y tecnología geriátrica MX + LatAm
Decenas de miles de millones USD
LTC solo en MX supera USD 25 B
SAM B2B
Residencias privadas formales en México con capacidad SaaS
~1,100–1,300 residencias
DENUE 2025 · segmento con presupuesto y NOM-031
SAM B2C
Familias mexicanas con cuidado activo de adulto mayor
~2M familias
CONAPO 2025 · hijos que coordinan cuidado a distancia
SOM
Captura realista en 3–5 años (ciclo B2B + freemium B2C)
50–200 residencias + 5,000–20,000 familias
Pilotos B2B + autoservicio freemium B2C
Revenue potencial del SOM — precios sweet-spot
Escenario
Residencias
Plan promedio
MRR estimado
Pesimista
25–35
Esencial ($1,990/mes)
~$50k–$70k MXN/mes
Equilibrado ⭐
80–120
Profesional ($3,990/mes) — sweet spot
~$319k–$479k MXN/mes
Positivo
180–250
Mix Profesional + Institucional ($8,490)
~$717k–$997k MXN/mes
⚠ Nota: Freemium $0 no genera MRR directo — reduce CAC y acelera conversión a planes pagos. Margen bruto estimado &gt; 80%.
Análisis de competencia — mercado mexicano (agosto 2026)
Competidor
Origen
Presencia MX
Enfoque
Precio publicado
Cronos Care
México
+50 residencias activas
Residentes, medicamentos, personal, pagos
No
GERIGES
España (localiz. MX)
Versión .com/mx/
Expediente clínico, PAI/PIA, medicación, turnos
No
StoriiCare
EE.UU.
Sin confirmar en MX
EHR, eMAR, IA integrada, EVV GPS
No
Papel / hoja de cálculo
—
Predominante
—
—
CareSignal
México
MVP listo para Cloud Run
Ciclo operativo de ronda con máquina de estados
✅ Freemium $0 + 3 planes ($1,990–$8,490)
El hueco confirmado: Cronos Care y GERIGES son sistemas de expediente y administración. Ninguno modela el ciclo operativo de la ronda con estados formales, alertas automáticas ni escalación trazable. CareSignal es el único con precio publicado y el único específicamente diseñado para ese ciclo.
Criterio 4 · Propuesta de valor
&quot;CareSignal es la única plataforma de trazabilidad operativa diseñada específicamente para residencias de adultos mayores en México: en español, sin instalación, con auditoría inmutable, doble validación documental y lista para Google Cloud Run.&quot;
Diferenciadores frente a competidores reales
Diferenciador
Cronos Care
GERIGES
CareSignal
Rondas con máquina de estados
❌
❌
✅
Alerta automática por retraso
❌
❌
✅
Escalación con actor registrado
❌
❌
✅
Auditoría inmutable append-only
❌
❌
✅
Precio publicado
❌
❌
✅
Alineado con NOM-031 operativa
⚠ Parcial
⚠ Parcial
✅
Qué compra la residencia — tres cosas concretas
Tranquilidad ante la familia: cuando preguntan &quot;¿qué pasó a las 3 am con mi mamá?&quot;, CareSignal tiene la respuesta en segundos.
Protección ante una inspección: la NOM-031 exige registros. CareSignal los genera como subproducto de la operación diaria — sin trabajo extra.
Control operativo en tiempo real: el supervisor ve el retraso en el momento en que ocurre, no una hora después.
Por qué no es sustituible por lo que ya tienen
WhatsApp: sin estados auditables, sin historial inmutable, sin reportes.
Hoja de cálculo: no detecta retrasos en tiempo real ni escala alertas automáticamente.
Sistema clínico hospitalario: cuesta 5–10× más, requiere capacitación extensa, diseñado para hospitales no para residencias.
Criterio 5 · Progreso del producto: prototipo o demo
Estado del MVP
CareSignal v0.1.0-workshop es un MVP funcional completo, construido en 8 fases con aprobación humana en cada gate, con auditoría de calidad PASS
Métrica
Resultado
Fases de construcción completadas
8 de 8 ✅
Pruebas de aceptación del contrato
20 de 20 ✅
Pruebas automatizadas
38 de 38 ✅
Hallazgos blocker
0
Hallazgos high
1, corregido antes del release
Paquete de producción
~225 KB JS (~68 KB comprimido)
Qué puede hacer hoy mismo — en menos de 5 minutos
Todo sin instalación, sin cuenta, sin conexión a internet.
Criterio 6 · Comunicación clara, visual y segura
Claridad para el usuario final
Tres acciones máximo para completar una ronda normal — sin menús profundos.
Semáforo visual (verde/amarillo/rojo) para el estado de cada residente.
Avisos obligatorios: &quot;MVP operacional, no dispositivo médico&quot; y &quot;Datos ficticios&quot;.
Accesibilidad de teclado verificada en QA C8 — navegación completa sin ratón (WCAG 2.1 AA).
Documentación en tres niveles
Nivel
Documento
Para quién
Ejecutivo
README.md — executive summary
Juez, inversionista
Operativo
WORKSHOP_DEMO_SCRIPT.md — guion de demo de 5 min
Evaluador técnico
Técnico
docs/00 al docs/10 — contrato, taxonomía, máquina de estados, pruebas
Desarrollador, auditor
Seguridad en la comunicación
Sin datos reales: la aplicación opera exclusivamente con datos ficticios generados por el sistema.
Cifrado en tránsito y reposo: arquitectura de producción en Google Cloud Run + Firebase, TLS, sin canales inseguros.
Material comercial versionado: deck y dossier en el repositorio — no circulan en canales no controlados.
Criterio 7 · Trabajo en equipo: roles y colaboración
Estructura del equipo — 5 roles requeridos
Roberto García lidera el proyecto en calidad de Fundador y Líder de Proyecto. La complejidad del MVP — dominio formal, contrato congelado, pruebas de aceptación y material comercial — exige cinco roles diferenciados:
Rol
Responsabilidad
Evidencia en el repositorio
Líder / Product Owner
Visión, contrato, aprobación de cada fase
contract/ · CHANGELOG.md
Arquitecto de software
Dominio, máquina de estados, modelo de datos
src/domain/ · docs/00–03
Desarrollador full-stack
React + TypeScript · motor temporal · escenarios
src/ · tests/
QA / Auditor de calidad
20 pruebas de aceptación · 38 automatizadas
docs/04 · tests/
Diseñador de UX
Flujos de cuidador y supervisor · accesibilidad
src/pages/ · src/components/
Gate reviews como colaboración estructurada
Práctica de equipo convencional
Equivalente en CareSignal
Definición de requisitos en equipo
Contrato congelado con taxonomía YAML y reglas explícitas
Revisión de arquitectura por pares
Gate C2: criterios formales antes de escribir UI
Code review
Gate reviews C3–C7: criterios de aceptación por fase en CHANGELOG.md
QA independiente
Gate C8: auditoría de 20 pruebas de contrato en rol separado
Retrospectiva de equipo
docs/05-known-limitations.md: hallazgos para versiones futuras
Evidencia por fase — quién hizo qué y cuándo
Fase
Rol ejercido
Entregable
Resultado
C1 · Contrato
Líder / Product Owner
Contrato v0.1.0, taxonomía YAML
✅ Gate C1 aprobado
C2 · Dominio
Arquitecto
types.ts, rules.ts, máquina de estados
✅ Gate C2 — compila, sin any
C3 · Datos
Desarrollador
Datos de semilla, repositorio, reloj
✅ Gate C3 — IDs coherentes
C4 · Shell
Desarrollador + UX
5 páginas, navegación, sesión
✅ Gate C4 — 5 páginas vivas
C5 · Cuidador
Desarrollador + UX
Flujo ronda en ≤ 3 acciones
✅ Gate C5 — sin duplicados
C6 · Supervisor
Arquitecto + Dev
Alerta → verificación → cierre
✅ Gate C6 — auditoría visible
C7 · Motor temporal
Arquitecto + Dev
Escenarios deterministas &lt; 5 min
✅ Gate C7 — reproducible
C8 · QA / Release
QA / Auditor
20/20 contrato · 38/38 auto · 0 blockers
✅ Gate C8 — PASS
Criterio 8 · Innovación y creatividad
Cuatro planos de innovación simultáneos
Plano
Tipo de innovación
Tipo de creatividad
En qué consiste
1. La solución
De producto + de acceso al mercado
Combinatoria
Trazabilidad de sectores regulados aplicada por primera vez al dominio de residencias MX
2. Integración de IA
De proceso — datos primero, inferencia después
Exploratoria
Bitácora de 20 tipos de evento como base para modelos predictivos en BigQuery ML
3. Ciberseguridad activa
Tecnológica — seguridad continua vs. pasiva
Transformacional
Agente IA de ciberseguridad que convierte el cifrado en monitoreo activo 24/7
4. Arquitectura event-driven
Tecnológica — vanguardia en sector monolítico
Combinatoria
Principios CNCF / Google Cloud Framework aplicados a un MVP de nicho con recursos mínimos
Funciones de IA planificadas — roadmap v0.2
Función de IA
Tipo de modelo
Problema que resuelve
Alertas predictivas
Supervisado
Anticipa riesgo por residente basado en histórico de rondas
Detección de anomalías
No supervisado
Detecta desviaciones del protocolo vs. máquina de estados
Optimización de asignación
Optimización
Minimiza tiempos de respuesta distribuyendo carga de cuidadores
Resumen ejecutivo de turno
Generativa
Genera el reporte de traspaso desde los eventos — sin transcripción
Plataforma: BigQuery ML · Gemini API (vía Vertex AI). La arquitectura ya está lista para recibirlas. No es especulación — es diseño presente.
Criterio 9 · Factibilidad técnica y financiera
Factibilidad técnica — evidencia del MVP
Evidencia
Detalle
Stack probado
React 18 + TypeScript estricto, Vite, sin dependencias no estándar
Build de producción
~225 KB JS (~68 KB comprimido) — carga en cualquier conexión
Pruebas automatizadas
38 pruebas, 0 fallos
Sin deuda técnica bloqueante
0 hallazgos blocker · 1 high corregido antes del release
Accesibilidad
WCAG 2.1 AA verificada en QA C8
Costos de infraestructura — Google Cloud (33 clientes)
Servicio
Uso estimado/mes
Costo USD/mes
Cloud Run (API FastAPI)
~5M solicitudes
~$15–25
Cloud Run (Worker Pub/Sub)
~200K eventos
~$5–10
Firestore
~6M lecturas · ~2M escrituras
~$15–25
Pub/Sub
~200K mensajes
~$1
BigQuery
~200 MB activos · ~50 GB consultas
&lt;$1
Firebase Auth
Hasta 10K usuarios activos
Gratis
Total estimado
~$37–62 USD/mes
Costos de agentes IA — Gemini API (33 clientes)
Agente / Modelo
Descripción
Costo estimado USD/mes
Agente de ciberseguridad
Monitoreo continuo · cada 5 min · 24/7 · ~8,640 ejecuciones/mes/residencia
~$8–10
Agente de soporte RAG
Chatbot admin + cuidador · ~15,000 consultas/mes a 33 clientes
~$3–5
Modelos operativos v0.2
Alertas predictivas · anomalías · asignación · BigQuery ML
~$18–22
Total IA
~$29–37 USD/mes
Factibilidad financiera — modelo de ingresos y margen
Plan
Precio MXN/mes
Mercado objetivo
Esencial
$1,490
Residencias pequeñas (hasta 25 residentes)
Profesional
$3,490
Residencias medianas (hasta 75 residentes)
Institucional
$6,990
Cadenas y residencias grandes
Escenario conservador 3% de penetración (~33 residencias): Ingreso mensual ~$80,000 MXN · Infraestructura total ~$66–99 USD/mes · Margen bruto &gt;97%. El modelo es rentable desde el primer cliente.
Roadmap de versiones
Versión
Plazo
Qué incluye
Hito clave
v0.1.0 ✅
Agosto 2026
MVP demo · localStorage · 38 pruebas · 0 blockers
Concurso WomenCISO/MenCISO
v1.0
Q1 2027
Google Cloud Run + Firebase · auth real · multi-tenant · WebSockets
Primer cliente de pago
v0.2
Q3 2027
Agentes IA · BigQuery ML · agente ciberseg. 24/7
IA en producción con datos reales
Criterio 10 · Valor al usuario y al dueño
Los tres usuarios — dolor y solución
Usuario
Dolor principal
Lo que CareSignal resuelve
Resultado
Cuidador
Responsabilidad sin evidencia · transcripción al final del turno · miedo a la queja
Registro en 3 acciones desde el teléfono · el sistema lo protege
Su trabajo queda documentado con actor, hora y resultado
Supervisor
Gestión reactiva · sin visibilidad en tiempo real · rondas atrasadas que nadie avisa
Dashboard en tiempo real · alertas automáticas · un clic para asignar
Pasa de reaccionar a anticipar
Dueño / Director
Riesgo legal sin evidencia · inspecciones sin registros · demandas sin defensa
Bitácora inmutable · doble validación documental · registros automáticos NOM-031
Evidencia lista ante queja, inspección o demanda civil
La sincronía entre turnos — el momento de mayor riesgo
El cambio de turno es el instante de mayor riesgo operativo: toda la información del turno saliente debe transferirse al entrante sin perderse ni olvidarse.
Qué se necesita transferir
Sin CareSignal
Con CareSignal
Rondas pendientes o incompletas
El cuidador lo menciona de memoria — se olvida
Dashboard en tiempo real — visibles desde el primer segundo
Alertas activas y su estado
Anotado en cuaderno o dicho de palabra
Bitácora con actor, hora y última acción
Cuidados programados
Lista en papel o grupo de WhatsApp
Motor temporal — agenda sin transcripción
Novedades de cada residente
Transmisión verbal — depende de quien esté
Accesible por residente — sin buscar cuadernos
Control documental — del papel sin gestión a la doble validación
Elemento
Sin CareSignal
Con CareSignal
Formato de registro
Papel o cuaderno sin versión controlada
Estandarizado · imprimible desde el sistema
Respaldo del registro
Solo el papel — si se pierde, se pierde
Copia digital inmutable con mismo timestamp
Localización de registro histórico
Búsqueda manual en archivos físicos
Búsqueda en sistema — segundos
Revisión administrativa
Presencial · periódica · con info desactualizada
Programada · con agenda definida
Validación del director
Solo firma física · sin registro de cuándo
Firma digital + firma física — doble validación
Riesgo potencial — casos reales y marco sancionatorio
Caso
Fecha
Consecuencia
Asilo Santa Sofía, SLP
Mayo 2025
Clausura definitiva · 10 residentes rescatados · intervención de la Fiscalía estatal
Casa de reposo, CDMX
Diciembre 2024
Denuncia pública viral · investigación abierta
&quot;La Aldea de los Abuelos&quot;, SLP
Mayo 2025
Inspección solicitada · exposición mediática
El costo del riesgo vs. el costo de la solución
Escenario de riesgo
Costo estimado
CareSignal 12 meses
Diferencia
Multa leve Art. 419 LGS
~$234,620 MXN
$17,880 MXN
13× el costo anual
Multa grave Art. 420 LGS
hasta $703,860 MXN
$17,880 MXN
39× el costo anual
Clausura · 6 meses de ingresos
~$1,920,000 MXN
$17,880 MXN
107× el costo anual
Honorarios de abogado defensor
$50,000–$150,000 MXN
$17,880 MXN
3–8× el costo anual
CareSignal cuesta menos del 0.5% del ingreso mensual de la residencia y genera la evidencia que puede evitar o defender todos los escenarios anteriores. UMA 2026 = $117.31/día (INEGI).
Criterio 11 · Framework de ciberseguridad
Los datos de residentes — condición física, historial, incidentes, identidad — son datos sensibles bajo la LFPDPPP. CareSignal alinea su framework con el NIST Cybersecurity Framework (NIST CSF) e ISO 27001, implementados a través de Google Cloud Platform, en tres capas: diseño, infraestructura y monitoreo activo.
Alineación con NIST CSF — las 5 funciones
Función NIST CSF
Descripción
Cómo CareSignal la implementa
Identificar
Conocer activos y riesgos
Inventario de datos sensibles · clasificación LFPDPPP · evaluación de riesgo por rol
Proteger
Controles de acceso y cifrado
Firebase Security Rules · TLS 1.3 · AES-256 · acceso por rol · datos ficticios en demo
Detectar
Monitoreo de anomalías
Agente IA ciberseguridad · análisis bitácora cada 5 min · Cloud Audit Logs
Responder
Acción ante incidentes
Alertas automáticas al administrador · reporte de seguridad por turno
Recuperar
Continuidad y respaldo
Backup digital · sincronización Firestore · historial inmutable
Las tres capas del framework
Capa
Qué protege
Mecanismo
Estado
Diseño (Privacy by Design)
Superficie de ataque y exposición de datos
Cloud-ready · dominio puro · datos ficticios · sin APIs externas
v0.1.0 — listo para Cloud Run
Infraestructura (Google Cloud)
Datos en tránsito y en reposo
TLS 1.3 · AES-256 · Firebase Rules · aislamiento por residencia
v1.0 producción
Monitoreo activo (Agente IA)
Integridad de la operación 24/7
Gemini API (Vertex AI) · análisis continuo de la bitácora
v0.2 roadmap
Controles de seguridad en producción — Google Cloud
Control
Tecnología
Ataque que mitiga
Cifrado en tránsito
TLS 1.3 (Cloud Run + Firebase)
Intercepción de datos en red (MITM)
Cifrado en reposo
AES-256 (Firestore + BigQuery)
Acceso físico no autorizado al almacenamiento
Acceso por rol
Firebase Security Rules
Un cuidador no puede ver datos de otra residencia
Aislamiento por residencia
Reglas de Firestore por tenant
Filtración entre clientes (data leakage)
Autenticación
Firebase Auth (MFA disponible)
Acceso con credenciales robadas
Auditoría de acceso
Cloud Audit Logs
Detecta accesos anómalos a datos de producción
Certificaciones
ISO 27001 · SOC 2 Type II · GDPR
Cumplimiento normativo demostrable ante inspección
Agente IA de ciberseguridad — monitoreo activo vs. control pasivo
Capacidad
Control pasivo tradicional
Agente IA CareSignal (v0.2)
Detección de anomalías en bitácora
Manual · revisión periódica
Automática · cada 5 minutos · 24/7
Secuencias imposibles de eventos
No detectadas hasta auditoría
Detectadas en tiempo real vs. máquina de estados
Accesos fuera de horario
Log disponible · nadie lo revisa
Alerta inmediata al administrador
Verificación de configuración
Manual · ocasional
Automática · reglas Firebase · permisos Cloud Run
Reporte de seguridad al director
No existe
Generado automáticamente por turno o semana
Costo a 33 clientes
—
~$8–10 USD/mes (Gemini Flash)
&quot;CareSignal no añadió seguridad como feature de marketing — la construyó como restricción de diseño. El MVP está listo para Google Cloud Run: activar la capa de infraestructura despliega TLS, cifrado, aislamiento y auditoría sin tocar una línea de dominio ni de UI.&quot;
Datos del proyecto y disclaimer
Dato
Valor
Proyecto
CareSignal v0.1.0-workshop
Líder
Roberto García — Fundador / Product Owner / Arquitecto / Desarrollador / QA / UX
Concurso
WomenCISO 4 / MenCISO 1 — Innovación en IA y Ciberseguridad
Fecha de entrega
Domingo 6 de septiembre de 2026
Repositorio
GitHub (pendiente de publicar — E3.2)
Stack
React 18 + TypeScript · Vite · Vitest · Google Cloud Run · Firebase · BigQuery
Fuentes de cifras
CONAPO · DENUE · BID · CEPAL · INEGI · IMARC Group · Grand View Research · LGS
MVP operacional, no dispositivo médico · Datos ficticios · No apto para uso clínico, diagnóstico ni emergencias
