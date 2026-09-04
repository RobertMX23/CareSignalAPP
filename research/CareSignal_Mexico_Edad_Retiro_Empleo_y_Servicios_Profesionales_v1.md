# CareSignal — México: Edad de Retiro, Empleo y Servicios Profesionales v1

En México, **no existe una edad máxima general a partir de la cual una empresa ya no pueda contratar legalmente a una persona como trabajador**. Tener 60, 65, 70 o incluso más años **no obliga a pasar a honorarios ni impide una relación laboral subordinada**.

La clave es separar **edad de pensión** de **edad máxima de trabajo**:

| Concepto | Edad | Qué significa |
|---|---:|---|
| Cesantía en edad avanzada IMSS | 60–64 | Puede dar acceso a pensión si se cumplen requisitos y se causa baja |
| Vejez IMSS | 65+ | Puede dar acceso a pensión de vejez |
| Edad máxima para ser empleado privado | **No existe una general** | Una persona de 70+ puede seguir siendo contratada |
| Servicios profesionales | Sin relación con la edad | Aplica por la naturaleza independiente del servicio, no por ser mayor |

El IMSS utiliza 60 años para cesantía y 65 para vejez, pero esas edades son **requisitos de acceso a prestaciones pensionarias**, no una prohibición de trabajar.

Además, la Ley Federal del Trabajo prohíbe expresamente que el patrón se niegue a aceptar trabajadores **por razón de edad**. El artículo 133 incluye la edad entre los criterios discriminatorios prohibidos. La Ley de los Derechos de las Personas Adultas Mayores incluso establece que deben poder desempeñarse productivamente durante el tiempo que deseen y promueve empleos remunerados para ellas, salvo limitaciones físicas o mentales determinadas competentemente.

### El punto más importante sobre “contrato profesional”

Una empresa **no puede convertir jurídicamente a alguien en prestador de servicios sólo porque tenga 65 o 70 años**.

La LFT dice que existe relación laboral cuando hay:

> **trabajo personal + subordinación + salario**

independientemente del nombre que tenga el contrato.

Por ejemplo:

```text
Persona de 72 años
+
horario impuesto
+
jefe directo
+
instrucciones
+
trabajo personal
+
salario periódico
─────────────────
RELACIÓN LABORAL
```

Aunque el papel diga:

> “Contrato de prestación de servicios profesionales”.

Por el contrario:

```text
Consultor de 72 años
+
elige cómo realizar el trabajo
+
sin subordinación
+
cobra honorarios
+
entrega resultados
─────────────────
SERVICIOS PROFESIONALES
```

Gobierno de México explica precisamente que la diferencia esencial es la **subordinación**; puede existir prestación profesional remunerada sin relación laboral cuando ésta no existe.

### Hay excepciones

Sí pueden existir puestos donde una determinada condición física, licencia profesional o aptitud sea objetivamente necesaria. La LFT permite distinciones sustentadas en las **calificaciones particulares que exige una labor**, pero no una exclusión genérica sólo porque alguien tenga determinada edad.

Incluso hay actualmente una iniciativa legislativa presentada en 2026 para hacer todavía más explícita la prohibición de topes máximos de edad en vacantes y contratación; sigue pendiente en comisión, por lo que no debe confundirse con legislación ya aprobada.

### ¿Y si ya está pensionado?

Ahí la edad sigue sin impedir contratarlo, pero aparece **otra cuestión: el efecto sobre su pensión**.

Para solicitar pensión por cesantía o vejez ante el IMSS normalmente se requiere estar dado de baja del régimen obligatorio y privado de trabajo remunerado al momento correspondiente.

Después, el efecto de regresar a un trabajo puede variar según el régimen y tipo de pensión. Por ejemplo, la Ley del Seguro Social establece que puede suspenderse una **pensión garantizada** cuando el pensionado reingresa a un trabajo sujeto al régimen obligatorio.

Por eso son dos preguntas distintas:

```text
¿Puede legalmente trabajar a los 70?
           SÍ

¿Puede trabajar sin alterar determinada pensión?
           DEPENDE
del régimen y tipo de pensión.
```

Y esto es muy relevante para lo que estamos estudiando de CareSignal: **65 años no representa una frontera económica entre “trabajador” y “retirado”**. Una persona puede tener 67, 70 o 75 años y continuar en una relación laboral formal si existe capacidad para realizar el puesto y ambas partes así lo acuerdan.

Por eso, para nuestros modelos demográficos, yo dejaría de usar sólo:

`working age → 18–64`

y empezaría a estudiar por separado:

`55–59 | 60–64 | 65–69 | 70–74 | 75+`

porque jurídicamente y económicamente **la transición trabajo→retiro en México es mucho más gradual de lo que sugiere una simple edad de 65 años**.
