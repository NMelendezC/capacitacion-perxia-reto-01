# Requirements Verification Questions

## Contexto analizado

Se revisaron el PRD, los cuatro casos de `reto-01/`, el glosario, el maestro, el índice de soportes y los documentos de contexto. El alcance es un agente conversacional greenfield en TypeScript con herramientas deterministas, generación XLSX/PDF/valores de portal, paquete documental y simulación condicionada a confirmación humana.

## Question 1
¿Qué fecha debe utilizarse para evaluar la vigencia de los soportes durante la demo y las pruebas?

A) Fecha del sistema en cada ejecución, como indica el PRD

B) Fecha configurable por variable o argumento, con valor por defecto de la fecha del sistema

C) Fecha fija definida para los fixtures de demo

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
¿Cómo se deben tratar los soportes emitidos en Colombia para solicitudes de Ecuador, Honduras o Panamá?

A) Son válidos si están presentes y vigentes; el país emisor solo se informa

B) Se incluyen, pero requieren confirmación humana por diferencia de jurisdicción

C) Se consideran no válidos para esas solicitudes y bloquean el paquete

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
Para RUC o RTN solicitados fuera de Colombia, ¿cómo debe presentarse el NIT del maestro?

A) Mostrar el NIT como propuesta y marcar `requiere_confirmacion` con la nota `identificador extranjero`

B) Dejar el valor vacío y marcar `requiere_confirmacion`

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
Cuando un campo obligatorio de plantilla no tiene valor fuente, ¿qué comportamiento debe prevalecer?

A) Generar el formulario con el campo explícitamente vacío; registrar el faltante; no bloquear `listo_para_firma` por ese campo

B) Generar el formulario con el campo vacío y bloquear `listo_para_firma`

X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 5
¿Cuál es el alcance inicial de la interfaz conversacional y el proveedor LLM?

A) UI HTML/TypeScript sin framework y adaptador LLM configurable con proveedor elegido durante Construction

B) React y adaptador LLM configurable con proveedor elegido durante Construction

C) Implementar solo herramientas y `demo.ts`; posponer chat y LLM

X) Other (please describe after [Answer]: tag below)

[Answer]:A incluyendo el demo.ts que se exige en la entrega del ejercicio

## Question 6
¿Qué regla debe reconocer la confirmación del envío simulado?

A) Solo una confirmación explícita en el mensaje inmediatamente posterior a que el agente deja la acción pendiente

B) Cualquier confirmación explícita dentro de la misma sesión mientras el caso siga abierto

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 7
¿Se debe incluir la extensión Property-Based Testing?

A) Yes — enforce all PBT rules as blocking constraints

B) Partial — enforce PBT rules only for pure functions and serialization round-trips

C) No — skip all PBT rules

X) Other (please describe after [Answer]: tag below)

[Answer]:C

## Question 8
¿Se debe incluir la extensión Security Baseline?

A) Yes — enforce all SECURITY rules as blocking constraints

B) No — skip all SECURITY rules

X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 9
¿Se debe incluir la extensión Resiliency Baseline?

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance

B) No — skip the resiliency baseline

X) Other (please describe after [Answer]: tag below)

[Answer]:B
