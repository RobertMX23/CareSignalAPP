# CareSignal — 18-Month MVI Failure Thesis & Risk Governance v1

Sí, te entiendo. La línea inmobiliaria queda **fuera del MVP y fuera del modelo financiero de los próximos 18 meses**. La tratamos únicamente como una opción estratégica futura. El análisis correcto ahora es hacer lo contrario de un pitch optimista: construir la **tesis de fracaso de CareSignal**.

La pregunta sería:

> **¿Qué tendría que ocurrir para que CareSignal fracase aun cuando la visión de 5–20 años sea correcta?**

Esto permite fijar límites operativos, financieros y de producto antes de gastar capital. Es especialmente relevante porque Startup Genome encontró históricamente una asociación muy fuerte entre *premature scaling* y fracaso: startups que escalaron antes de validar tendían a levantar más capital, contratar equipos mayores y gastar más en adquisición antes de tener un modelo consistente.

Y el mercado actual aumenta la importancia de esa disciplina: KPMG describe el VC de 2026 como abundante en agregado pero **muy selectivo**, concentrado en ganadores percibidos, IA y compañías que demuestran crecimiento sostenible, unit economics y gobierno corporativo. México captó US$440.8M de VC en Q2 2026, pero una sola ronda de Plata representó US$405M; el headline de capital disponible puede esconder una enorme concentración.

# CareSignal — Failure Thesis del MVP longitudinal

| # | Razón por la que CareSignal podría fracasar | Argumento documentado / mecanismo económico | Daño potencial | Respuesta para los próximos 18 meses |
|---|---|---|---|---|
| **1** | **Levantar demasiado capital demasiado pronto** | Startup Genome identifica el *premature scaling* como uno de los patrones más destructivos: las startups inconsistentes levantaban más dinero, contrataban antes y gastaban más antes de validar. | Burn alto, estructura pesada, presión por crecer artificialmente | Los $15M MXN son **techo de modelación**, no objetivo obligatorio. Determinar el monto mediante presupuesto bottom-up y gates |
| **2** | **Valuación Pre-Seed artificialmente alta** | Una valuación muy adelantada a la evidencia obliga a justificar un salto aún mayor en la ronda siguiente | Down round, bloqueo de Seed, cap table tóxico | Valuación subordinada al milestone; evitar “marcar” valor por TAM, datos futuros o visión de 20 años |
| **3** | **Confundir capital levantado con creación de valor** | Tener cash no demuestra PMF. El mercado VC actual concentra capital en compañías con evidencia y sostenibilidad. | Creer que $15M invertidos = $X de enterprise value | Medir **capital → riesgo eliminado**, no capital → valuación |
| **4** | **Prometer ROI extraordinario al inversionista desde el Excel** | El valor futuro de una startup depende de ejecución, liquidez, siguientes rondas y salida; no existe un MOIC contractual implícito por tener una gran visión | Presión por crecer contra la realidad del mercado | Mostrar escenarios, nunca retornos prometidos |
| **5** | **Construir demasiadas líneas simultáneamente** | El desarrollo prematuro de productos, equipos y mercados es una forma clásica de scaling inconsistente. | Fragmentación de capital, equipo y aprendizaje | **Congelar Care Real Estate, Care Wallet, marketplace y otros negocios** durante la validación MVI |
| **6** | **Intentar convertir CareSignal en plataforma antes de tener una interacción útil** | Estudios de plataformas muestran tasas elevadas de fracaso por pricing incorrecto, falta de confianza, competencia y problemas para alcanzar masa crítica. | Construir ecosystem/APIs sin usuarios reales | Primero comprobar `Care Event → Signal → Action → History` |
| **7** | **Atacar B2B y B2C como dos startups independientes** | Las plataformas multisided enfrentan el problema clásico de “chicken-and-egg”; normalmente hay que secuenciar lados o subsidiar uno deliberadamente. | Doble CAC, doble GTM, doble producto | Un solo Core; **B2B como wedge** y B2C como prueba de reutilización del Core |
| **8** | **Que el problema exista pero nadie quiera pagar** | Necesidad social ≠ demanda económica. El tamaño de la care economy tampoco equivale al TAM de CareSignal | Producto utilizado pero sin negocio | Paid pilots antes de escalar; probar willingness-to-pay B2B y B2C |
| **9** | **Elegir al pagador equivocado** | Usuario, beneficiario y comprador pueden ser personas distintas en care | CAC alto, conversión baja | Identificar separadamente `user / beneficiary / buyer / approver` |
| **10** | **Ciclos de venta B2B demasiado largos** | Healthcare/digital health exige integración, gobernanza y prueba de ROI; presión sobre márgenes de proveedores eleva el escrutinio. | Burn antes de generar contratos | Pilotos pequeños y cobrables; time-to-value de semanas, no despliegues enormes |
| **11** | **B2C con CAC mayor que LTV** | Durante años múltiples modelos D2C migraron a B2B/B2B2C ante crecientes costos de adquisición. | Crecimiento destruye caja | No comprar crecimiento B2C hasta conocer retention, conversion y CAC |
| **12** | **Baja retención** | Sin recurrencia no existe SaaS sólido y tampoco existe historial longitudinal | Se destruyen simultáneamente revenue moat y data moat | Cohortes 30/90/180 días antes de escalar |
| **13** | **Muy pocos Care Events por persona** | Longitudinalidad requiere continuidad, no una descarga o un registro ocasional | Dataset ancho pero superficial | Medir events/person/month y active care days |
| **14** | **Creer que cantidad de datos = valor** | Los ecosistemas digitales obtienen valor de datos interoperables y confiables, no solamente acumulados; stewardship y control son fundamentales. | Data lake costoso sin utilidad | Priorizar calidad + temporalidad + contexto + consentimiento + utilidad |
| **15** | **Care Event Schema mal diseñado** | Si hogar y residencia requieren estructuras incompatibles, la tesis de homologación cae | El Core se divide en dos productos | Validar solamente **5–10 Care Events comunes** inicialmente |
| **16** | **La longitudinalidad no aporta valor al usuario** | Ésta sigue siendo una hipótesis nuestra, no evidencia del mercado | La principal tesis estratégica pierde fuerza | Probar explícitamente si continuidad y handoff reducen fricción o incertidumbre |
| **17** | **Consent Engine demasiado complejo** | La LFPDPPP vigente exige consentimiento, proporcionalidad, finalidad y mecanismos de revocación; datos sensibles requieren consentimiento expreso y escrito. | Abandono de onboarding | Diseñar minimum viable consent con scopes comprensibles |
| **18** | **Consent Engine demasiado débil** | La misma legislación exige finalidades concretas, minimización y obligaciones sobre tratamiento | Riesgo legal y reputacional | Privacy-by-design desde MVI |
| **19** | **Incidente de seguridad temprano** | En ecosistemas de información personal, confianza determina adopción; stewardship, privacidad y control por parte de los usuarios son centrales. | Daño reputacional potencialmente existencial | Security baseline antes de escalar dataset |
| **20** | **Deriva hacia producto clínico** | CareSignal puede cruzar accidentalmente desde coordinación hacia recomendaciones, diagnóstico o manejo clínico | Mayor regulación, liability y costos | Mantener frontera explícita de **non-clinical care coordination** durante MVI |
| **21** | **Interoperabilidad demasiado costosa** | Healthcare contiene muchos sistemas heterogéneos; interoperabilidad requiere diferentes enfoques según contexto. | Integraciones custom destruyen margen | Ninguna integración compleja antes de probar Core; APIs estándar posteriormente |
| **22** | **Usar IA antes de tener datos confiables** | En digital health el capital está premiando IA, pero también existen interrogantes sobre governance, integration y ROI. | Producto vistoso, poca utilidad y mayor riesgo | AI sólo donde reduzca una métrica operacional concreta |
| **23** | **Incumbente copia features** | Workflow e infrastructure captaron una parte significativa del funding de digital health y los incumbentes están agregando capacidades adyacentes. | Alerts/dashboard se commoditizan | No defender UI; defender schema + continuity + consent + history |
| **24** | **Competidor alcanza antes la capa longitudinal** | Capital ya está entrando a workflows y digital-health infrastructure; funding se concentra en ganadores. | Se cierra la ventana de categoría | Validar rápido el diferenciador cross-context, no construir 50 features |
| **25** | **Recesión o “capital winter”** | Geopolítica, inflación y selectividad siguen afectando VC; grandes cifras agregadas esconden concentración. | Imposibilidad de levantar Seed | Construir M18 sin asumir que “otra ronda llegará” |
| **26** | **Inflación/FX/cloud erosionan runway** | Una startup mexicana puede tener ingresos MXN y parte de infraestructura o proveedores denominados en USD | Burn superior al previsto | Reserva + sensitivity MXN/USD + arquitectura cloud austera |
| **27** | **Competencia baja precios** | En software, funcionalidad replicable tiende a commoditizarse | ARPU cae | El valor debe migrar de funciones a workflow crítico y switching cost |
| **28** | **Dependencia de subsidios para adquirir usuarios** | Plataformas pueden requerir subsidios iniciales para resolver chicken-and-egg, pero éstos tienen que conducir a una interacción sostenible. | Crecimiento que desaparece cuando termina el incentivo | Separar usuarios orgánicos de usuarios subsidiados |
| **29** | **Métricas de vanidad sustituyen evidencia** | Descargas, perfiles creados y millones de rows pueden crecer sin PMF | Falsa sensación de progreso | LACP, retention, paid conversion, Care Events útiles y Cross-Context LACP |
| **30** | **El founder persigue la visión de 20 años antes del milestone de seis meses** | Premature scaling incluye construir producto, equipo y monetización antes de que la etapa real de la startup lo justifique. | El proyecto pierde foco | La visión larga permanece en el strategy paper; el presupuesto financia sólo la siguiente prueba |

---

# La parte financiera más peligrosa

Hay una idea que conviene congelar:

> **Ni el ROI aspiracional del inversionista ni una valoración teórica del portfolio deben gobernar las decisiones operativas del MVI.**

El orden tiene que ser exactamente el contrario:

```text
EVIDENCE
   ↓
RISK REDUCTION
   ↓
ECONOMIC VALUE
   ↓
VALUATION
```

y nunca:

```text
VALUATION TARGET
   ↓
REQUIRED GROWTH
   ↓
FORCED EXPANSION
   ↓
BURN
```

La segunda ruta es la que puede “corromper” las finanzas corporativas en el sentido planteado: la compañía comienza a tomar decisiones para defender la valoración anterior en lugar de descubrir si el negocio realmente funciona.

---

# Qué significa entonces un buen ROI Pre-Seed

El inversionista puede aspirar a un retorno enorme. Eso es parte del venture capital.

El error sería convertir esa aspiración en:

> “CareSignal tiene que valer $3,000M dentro de cinco años porque necesitamos 20×.”

No.

El proyecto sólo controla:

```text
PRODUCT
+
CAPITAL EFFICIENCY
+
LEARNING VELOCITY
+
CUSTOMER EVIDENCE
+
EXECUTION
```

La valoración posterior será consecuencia del mercado.

---

# El nuevo KPI financiero que introduciría

Además de burn y runway:

# **Cost of Risk Reduction — CRR**

```text
CRR =
Capital consumed
───────────────
material hypotheses validated
```

Por ejemplo:

```text
$3M gastados
──────────────
6 riesgos críticos eliminados

= $500K / risk
```

No es un estándar contable.

Es una métrica interna de disciplina.

Nos obliga a preguntar:

> **¿Qué aprendimos por cada peso consumido?**

---

# Otro KPI: Learning Velocity

```text
LEARNING VELOCITY
=
validated / invalidated hypotheses
─────────────────────────────────
month
```

Porque durante Pre-Seed el producto principal de la empresa todavía es parcialmente:

> **evidencia.**

---

# Los límites financieros que pondría

Con el escenario actual de **$15M MXN**:

| Guardrail | Límite propuesto |
|---|---|
| Capital total | máximo modelado $15M |
| Reserva estratégica | **15% = $2.25M** |
| Real Estate | **$0** |
| Care Wallet | **$0** |
| expansión internacional | **$0** |
| adquisiciones | **$0** |
| AI experimental complejo | mínimo |
| crecimiento B2C pagado | sólo después de retention evidence |
| contratación | ligada a milestone |
| nuevas verticales | congeladas |
| Seed fundraising | empezar antes de runway crítico |

Especialmente:

# **Care Real Estate recibe $0 durante estos 18 meses.**

Puede seguir existiendo en:

> Vision / Strategic Optionality.

Pero no en:

> Use of Funds.

Ésa es una separación corporativa fundamental.

---

# También dividiría los $15M por “derecho a gastar”

No significa que el inversionista necesariamente entregue tranches. Puede existir todo el cash.

Pero internamente la empresa se obliga a desbloquear presupuesto.

### Gate A — M0–M3

**Máximo ~15%**

```text
$2.25M
```

Para:

- legal/corporate;
- architecture;
- Care Identity;
- Care Event Schema;
- customer discovery;
- threat model.

**No se escala equipo.**

---

### Gate B — M4–M6

Capital acumulado máximo aproximado:

# **35% = $5.25M**

Solamente si existe:

```text
1 PERSON
+
2 CONTEXTS
+
5 CARE EVENTS
+
CONSENT
+
CONTINUOUS HISTORY
```

Éste es el MVI.

Si eso no funciona, no tiene sentido desbloquear crecimiento.

---

### Gate C — M7–M9

Capital acumulado máximo:

# **50% = $7.5M**

Sólo si usuarios reales utilizan el MVI.

Objetivo:

> **usage validation.**

---

### Gate D — M10–M12

Capital acumulado:

# **65% = $9.75M**

Sólo si hay evidencia de:

```text
usage
+
retention
+
paid pilot / willingness-to-pay
```

Aquí debería comenzar la preparación Seed.

---

### Gate E — M13–M18

Se utiliza el capital operativo restante.

La reserva del **15%** sólo se toca deliberadamente.

No para:

> “hacer marketing porque vamos debajo del forecast.”

Sino para:

- shock macro;
- ciclo de ventas;
- seguridad;
- extensión controlada de runway;
- oportunidad validada.

---

# Kill criteria: el concepto más importante

Hay situaciones donde **continuar es peor que detenerse o pivotar**.

Yo establecería estos controles:

| Fecha | Pregunta | Si la respuesta es NO |
|---|---|---|
| **M3** | ¿El problema aparece repetidamente en discovery? | redefinir segmento/problema |
| **M6** | ¿Un mismo Core representa hogar + residencia? | revisar tesis longitudinal |
| **M9** | ¿Usuarios utilizan eventos recurrentemente? | rediseñar producto |
| **M12** | ¿Existe retención y alguna señal de pago? | no escalar |
| **M15** | ¿Existe evidencia B2B/B2C suficientemente fuerte? | concentrarse en el lado ganador |
| **M18** | ¿Hay camino creíble hacia PMF? | pivot / extend / stop, pero no fingir Series A |

Ésta es disciplina de capital.

---

# Oferta y demanda también ponen límites

CareSignal puede tener un problema curioso:

### Demanda enorme de cuidado

pero:

### demanda pequeña de software.

No son lo mismo.

```text
NEED FOR CARE
≠
DEMAND FOR CARESIGNAL
```

Entre ambas existe:

```text
perceived pain
×
digital adoption
×
ability to pay
×
willingness to pay
×
trust
×
switching friction
```

Ésa es la verdadera función de demanda.

Por eso $8 billones de economía de cuidados jamás deben aparecer como:

> “nuestro TAM es $8T”.

---

# Y del lado de oferta

CareSignal tampoco puede crecer infinitamente gratis.

La oferta tiene costos:

```text
engineering
cloud
support
sales
security
onboarding
compliance
```

Por tanto:

```text
PRICE
    >
VARIABLE COST
    +
SUPPORT
    +
EXPECTED CAC RECOVERY
```

eventualmente.

Si cada residencia paga $3,990 pero requiere $50,000 de implementación y meses de soporte, el modelo no funciona aunque haya cientos de residencias interesadas.

---

# El stress test económico

Yo obligaría al proyecto a sobrevivir intelectualmente a cinco escenarios externos.

| Shock | Qué sucede | Defensa |
|---|---|---|
| **Recesión** | familias recortan subscriptions | B2B/B2B2C + demostrar valor necesario |
| **VC freeze** | Seed tarda 12 meses más | burn bajo + reserva + first revenue |
| **Competidor subsidia precios** | ARPU cae | diferenciación longitudinal |
| **Nueva regulación** | compliance aumenta | consent/security desde arquitectura |
| **Incidente de confianza sectorial** | usuarios temen compartir datos | minimización + transparencia + portability |

Esto es precisamente por lo que **rentabilidad futura no puede depender únicamente de expansión de múltiplos financieros**.

Tiene que existir una unidad económica subyacente.

---

# La competencia también debe tener un “kill test”

No preguntaría sólo:

> “¿Quién tiene exactamente CareSignal?”

Preguntaría:

> **¿Quién puede destruir la necesidad de CareSignal con una feature?**

Ejemplos:

```text
EHR
adds family coordination

LTC software
adds longitudinal passport

Insurer
creates care identity

Big Tech
creates family care layer
```

Si cualquiera de ellos puede destruir la compañía agregando tres pantallas:

> el moat es débil.

Si para copiar CareSignal necesitan reproducir:

```text
ontology
+
consented longitudinal history
+
cross-context data
+
integrations
+
care networks
+
trust
```

la defensa empieza a ser mucho mejor.

---

# Por eso el MVP de 18 meses debe validar una pregunta mucho más dura

No:

> **¿Podemos programar rondas?**

Eso ya es demasiado pequeño.

Ni:

> **¿Podemos crear un Care Graph nacional?**

Eso es demasiado grande.

La pregunta exacta debería quedar congelada:

# **¿Puede CareSignal crear continuidad útil, confiable y económicamente valiosa alrededor de una persona cuando su cuidado ocurre en más de un contexto?**

Y se descompone:

```text
TECHNICAL
¿Podemos?

PRODUCT
¿Lo usan?

MARKET
¿Lo quieren?

ECONOMIC
¿Pagan?

TRUST
¿Nos permiten custodiarlo?

LONGITUDINAL
¿Permanece útil con el tiempo?
```

Si fallamos una de estas dimensiones, tenemos que saberlo **antes de escalar**.

---

# La arquitectura estratégica quedaría así

```text
                    20-YEAR VISION
                         │
              Care Continuity Infrastructure
                         │
                5–10 YEAR OPTIONS
                         │
          Ecosystem / Agents / Real Assets
                         │
                  3–5 YEAR PLATFORM
                         │
            B2B2C / APIs / Care Passport
                         │
────────────────────────────────────────────────
             CAPITAL ALLOCATION BOUNDARY
────────────────────────────────────────────────
                         │
                 18-MONTH MVI
                         │
PERSON → IDENTITY → CONSENT → CARE EVENT
                         │
                  SIGNAL → ACTION
                         │
               LONGITUDINAL HISTORY
                         │
                 TWO CONTEXTS
```

Todo lo que está **arriba de la línea** forma parte de la visión.

Todo lo que está **debajo de la línea** puede consumir el capital Pre-Seed.

Ésa me parece una regla extraordinariamente útil para CareSignal.

---

## Y ésta es probablemente la conclusión más importante de todo el ejercicio

La fortaleza de CareSignal no está en que podamos imaginar:

**CareTech + AI + data + real estate + FIBRA + insurers + hospitals + Care Agents + 20 años.**

Eso incluso podría convertirse en una debilidad.

La fortaleza aparece cuando podemos decir:

> **“Vemos todo ese universo, pero sabemos exactamente qué NO vamos a construir todavía.”**

Los próximos 18 meses compran una sola respuesta:

> **¿Existe una unidad mínima de infraestructura longitudinal del cuidado que las personas utilicen, confíen en ella y estén dispuestas a pagar?**

Si la respuesta es **sí**, desbloqueamos la siguiente capa.

Si es **parcial**, pivotamos.

Si es **no**, evitamos destruir decenas o cientos de millones persiguiendo una tesis equivocada.

Eso no reduce la ambición de CareSignal. **Convierte la ambición en una secuencia financieramente gobernable.**
