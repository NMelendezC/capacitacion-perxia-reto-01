# Requirements — Agente de Registro como Proveedor

## Intent Analysis

- **User request**: analizar el PRD, fixtures y contexto existentes para preparar el reto para Construction con AI-DLC.
- **Request type**: New Project.
- **Scope estimate**: System-wide; chat web, API, ciclo de agente, adaptador LLM, herramientas deterministas, documentos y pruebas.
- **Complexity estimate**: Complex.
- **Source of truth**: `PRD-01-agente-registro-proveedor 3_0452.md`; los fixtures de `reto-01/` son de solo lectura.

## Product Objective

Construir un agente conversacional independiente que prepare registros de Periferia como proveedor. El agente interpreta una solicitud normalizada, obtiene datos solo del maestro, genera el formato posible, construye un paquete documental y conserva la decisión de firma o envío en una persona.

## Functional Requirements

### FR-01 — Procesar solicitudes

1. Recibir desde el chat un caso ubicado bajo la raíz configurable de fixtures.
2. Leer `solicitud.json`, la plantilla correspondiente y `soportes-exigidos.json`.
3. Devolver país, cliente, formato, campos solicitados y soportes exigidos.
4. Informar con lenguaje de negocio los casos inexistentes, JSON inválidos, plantillas incompletas o formatos no soportados.

### FR-02 — Mapear valores trazables

1. Resolver etiquetas mediante `glosario-campos.json` y el maestro.
2. Clasificar cada campo como `lleno`, `faltante` o `requiere_confirmacion`.
3. Incluir valor y ruta de origen para cada `lleno`.
4. No inventar valores ni aceptar al LLM como fuente de datos.
5. Para solicitudes no colombianas, proponer el NIT como RUC/RTN y marcar `requiere_confirmacion` con `identificador extranjero`.
6. Solo procesar datos bancarios cuando estén solicitados; nunca incorporarlos al borrador de correo ni a resúmenes de logs.

### FR-03 — Generar el formato solicitado

1. Para XLSX, crear `out/<caso>/formulario.xlsx` escribiendo etiqueta y valor en la hoja y celdas indicadas.
2. Para PDF, crear `out/<caso>/formulario.pdf` respetando el orden de etiquetas de la plantilla.
3. Para portal, no automatizar navegación ni solicitar credenciales; crear `out/<caso>/valores-portal.md` y reportar `formato no soportado`.
4. Si un campo no tiene fuente, generarlo explícitamente vacío y registrarlo como faltante.

### FR-04 — Armar paquete para firma

1. Crear `out/<caso>/paquete/` con formulario o valores de portal, soportes disponibles, `checklist.md` y `borrador-correo.md`.
2. Clasificar los soportes como presentes, ausentes o vencidos frente a la fecha del sistema durante la ejecución.
3. Aceptar soportes emitidos en Colombia para los casos extranjeros si existen y están vigentes; su país emisor es informativo.
4. Bloquear `listo_para_firma` cuando falte o esté vencido un soporte exigido.
5. Por decisión aprobada en Requirements Analysis, bloquear `listo_para_firma` cuando falte un campo obligatorio de la plantilla. Esta decisión modifica la interpretación de RN3 del PRD y debe documentarse en `SOLUCION.md`.
6. Exponer causas de bloqueo y campos faltantes en el checklist.

### FR-05 — Confirmación y simulación

1. No ejecutar firma, envío ni interacción con terceros.
2. Dejar el envío simulado pendiente mediante una pregunta explícita.
3. Aceptar la confirmación solamente en el mensaje inmediatamente posterior a esa pregunta.
4. Al confirmarse, crear solo `out/<caso>/ENVIO-SIMULADO.md`.

### FR-06 — Contrato de herramientas y agente

1. Implementar exactamente las herramientas `proveedor_leer_solicitud`, `proveedor_mapear_campos`, `proveedor_generar_formulario`, `proveedor_armar_paquete` y `proveedor_simular_envio`.
2. Cada herramienta usa argumentos Zod descritos, retorna un string JSON `{ ok: true, data }` o `{ ok: false, error }`, y no propaga excepciones.
3. Mantener las herramientas importables desde `demo.ts`, sin HTTP ni LLM.
4. Separar el prompt en `agent/prompt.md`, el conocimiento en `src/knowledge/`, las herramientas en `src/tools/`, el ciclo en `src/agent/` y el adaptador LLM en `src/llm/`.
5. Aplicar un máximo configurable de iteraciones y tokens por sesión; manejar timeout del LLM sin terminar la sesión.
6. Exponer API de chat, consulta de sesión y salud sin secretos.

### FR-07 — Interfaz y trazabilidad

1. Implementar UI HTML/TypeScript sin framework con historial, entrada, indicador de procesamiento y estado destacado de confirmación.
2. Mostrar cada llamada de herramienta, sus argumentos y un resultado resumido.
3. Registrar cada ejecución en `out/log.jsonl` y `out/<caso>/log.jsonl` con timestamp, herramienta, resultado y resumen seguro.
4. Incluir `demo.ts` determinista para todos los casos, sin clave de LLM.

## Non-Functional Requirements

- TypeScript estricto, sin `any`, funciones cortas y nombres consistentes.
- La clave del LLM solo existe en variables del backend; jamás en frontend, repositorio, logs o respuestas de API.
- Sin shell desde herramientas ni rutas absolutas controladas por usuarios.
- Raíz de fixtures configurable; `reto-01/` permanece inmutable y `out/` es la única escritura funcional.
- `demo.ts` limpia exclusivamente su salida de demo y mantiene resultados repetibles, salvo timestamps.
- Un comando inicia frontend y backend en menos de dos minutos en una máquina limpia.
- Los errores técnicos se transforman en mensajes claros para la persona usuaria.
- Security Baseline, Resiliency Baseline y Property-Based Testing no se aplican por decisión explícita. Se mantienen pruebas de ejemplo para los escenarios y reglas críticas.

## Scope Boundaries

No se implementan integración real con correo, SharePoint, firma, autenticación, base de datos, automatización de portales ni credenciales reales. Para el portal futuro, credenciales, CAPTCHA, MFA y el clic final pertenecen a la persona usuaria.

## Acceptance Traceability

| HU | Resultado verificable |
|---|---|
| HU-1 | Lectura de solicitud, plantilla, país, formato, campos y soportes en los cuatro casos. |
| HU-2 | Mapeo íntegro y trazable, sin valores inventados ni omisión de confirmaciones. |
| HU-3 | XLSX para CO/HN, PDF para EC y valores Markdown para PA. |
| HU-4 | Paquete, checklist, borrador sin datos bancarios y bloqueo correcto de firma. |
| HU-5 | Contrato de error tipado, continuidad de sesión y mensajes no técnicos. |

## Decisions Recorded

| Decision | Resolution |
|---|---|
| Vigencia | Fecha del sistema. |
| Soportes extranjeros | Válidos si existen y están vigentes; país emisor informativo. |
| RUC/RTN extranjero | NIT propuesto con confirmación requerida. |
| Campo obligatorio sin fuente | Formulario parcial con campo vacío; bloquea firma. |
| UI | HTML/TypeScript sin framework. |
| Confirmación | Solo el turno inmediatamente posterior. |
| Extensiones | PBT, Security Baseline y Resiliency Baseline desactivadas. |

## Extension Compliance

| Extension | Status | Rationale |
|---|---|---|
| Property-Based Testing | N/A | User opted out. |
| Security Baseline | N/A | User opted out; PRD security requirements remain mandatory. |
| Resiliency Baseline | N/A | User opted out; PRD robustness requirements remain mandatory. |
