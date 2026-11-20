# Análisis de requerimientos — Agente de Registro como Proveedor

**Estado:** preparado para validación antes de implementar las Historias de Usuario  
**Fuente principal:** `PRD-01-agente-registro-proveedor 3_0452.md` (raíz del repositorio)  
**Fixtures analizados:** `reto-01/` (raíz del repositorio)  
**Ubicación de este documento:** `doc-contexto/`  
**Fecha del análisis:** 2026-11-20

## 1. Propósito y alcance

El producto solicitado es un agente conversacional independiente que recibe la instrucción de procesar una solicitud de registro de proveedor, interpreta el caso, consulta exclusivamente un repositorio maestro, llena el formato requerido cuando sea posible, arma el paquete documental y deja la decisión final a una persona.

El valor principal es eliminar la transcripción repetitiva y hacer visibles los faltantes, los mapeos inciertos y los soportes no vigentes.

### Incluido

- Interfaz de chat con historial y estado de procesamiento.
- Visualización de cada llamada a herramienta, sus argumentos y un resumen del resultado.
- Lectura de solicitudes y plantillas desde fixtures locales.
- Mapeo de etiquetas mediante `glosario-campos.json` y `maestro.json`.
- Generación de formularios XLSX y PDF.
- Preparación de valores para portales no implementados.
- Validación de soportes presentes, ausentes y vencidos.
- Paquete para firma con formulario, soportes, checklist y borrador de correo.
- Simulación de envío únicamente después de confirmación explícita.
- `demo.ts` sin dependencia de un modelo de lenguaje.
- Registro de ejecuciones en archivos JSONL.

### Excluido

- Integración real con correo, SharePoint, firma electrónica o portales.
- Carga o envío automático a terceros.
- Firma del representante legal.
- Autenticación, roles y multiusuario.
- Base de datos.
- Uso de credenciales reales.
- Lectura de archivos adjuntos reales: los casos entregados están normalizados como JSON.

## 2. Actores y responsabilidades

| Actor | Responsabilidad | Interacción |
|---|---|---|
| Recepción | Depositar la solicitud recibida en el conjunto de fixtures | No usa el agente |
| Analista administrativa | Solicitar el procesamiento, revisar resultados y confirmar acciones | Usa el chat |
| Representante legal | Revisar y firmar el formulario | Fuera del agente |
| Cliente | Solicitar el registro y definir sus requisitos | Fuera del sistema |

El agente prepara información y artefactos; no sustituye la revisión humana ni la firma.

## 3. Requerimientos funcionales derivados

### RF-01. Identificar el caso

El sistema debe recibir un identificador de caso y verificar que exista en la raíz configurada de fixtures. Debe devolver un error funcional claro si el caso no existe o si faltan archivos obligatorios.

### RF-02. Leer y normalizar la solicitud

Debe leer `solicitud.json` y obtener como mínimo:

- Identificador, remitente, destinatario, asunto, fecha y cuerpo.
- País del cliente y nombre del cliente.
- Formato solicitado: `xlsx`, `pdf` o `portal`.
- Adjuntos declarados.

Debe leer la plantilla correspondiente:

- `plantilla-celdas.json` para XLSX.
- `plantilla-campos.json` para PDF y para preparar valores de portal.

También debe leer `soportes-exigidos.json`.

### RF-03. Mapear campos con trazabilidad

Cada campo solicitado debe terminar en un estado:

- `lleno`: existe una fuente inequívoca en el maestro.
- `faltante`: no existe un valor fuente.
- `requiere_confirmacion`: el valor puede usarse como propuesta, pero está sujeto a una regla de país o a ambigüedad.

Cada valor lleno debe conservar la ruta de origen, por ejemplo `representante_legal.nombre` o `banco.numero_cuenta`.

### RF-04. Aplicar reglas de negocio

1. `NIT`, `RUC` y `RTN` se relacionan con `maestro.nit`, pero para países distintos de Colombia se debe marcar la identificación como `requiere_confirmacion` con la nota `identificador extranjero`.
2. El país de la solicitud identifica al cliente; no debe confundirse automáticamente con el país de la empresa proveedora almacenado en el maestro.
3. Los datos bancarios solo se procesan cuando la plantilla los pide.
4. Los datos bancarios no deben aparecer en `borrador-correo.md`.
5. Un soporte ausente o vencido impide `listo_para_firma`.
6. Un campo faltante no impide por sí solo el paquete, pero debe aparecer claramente en el checklist.
7. Ninguna herramienta debe inventar valores ni completar datos con inferencias no trazables.

### RF-05. Generar la salida

- XLSX: escribir cada valor en la hoja y celda definida por la plantilla.
- PDF: generar un documento que reproduzca etiquetas y valores en el orden de `plantilla-campos.json`.
- Portal: no automatizar; generar `valores-portal.md` y responder `formato no soportado`.

### RF-06. Armar el paquete

Crear `out/<caso>/paquete/` con:

- Formulario generado o valores de portal.
- Copias de soportes exigidos que existan.
- `checklist.md` con estados `presente`, `ausente` y `vencido`.
- `borrador-correo.md` sin datos bancarios.

El resultado debe exponer `listo_para_firma` y las razones que impiden ese estado.

### RF-07. Confirmación y simulación

Una acción externa solo puede ejecutarse en el turno posterior a una confirmación explícita. En este reto, el envío se simula escribiendo `ENVIO-SIMULADO.md`; no se envía ningún correo real.

### RF-08. Errores y continuidad

Las herramientas deben devolver siempre una estructura serializada equivalente a `{ ok: true, data }` o `{ ok: false, error }`. No deben propagar excepciones al ciclo del agente. Un caso inválido no debe impedir procesar los siguientes.

## 4. Requerimientos no funcionales

| Categoría | Requisito verificable |
|---|---|
| Seguridad | La clave del LLM solo existe en variables de entorno del backend; nunca en front, repositorio, logs ni respuestas |
| Seguridad | Las herramientas no ejecutan shell ni aceptan rutas absolutas controladas por el usuario |
| Robustez | Timeout y error legible cuando falla el proveedor LLM |
| Control de costos | Tope configurable de iteraciones y tokens por sesión |
| Determinismo | `demo.ts` produce resultados repetibles; `out/` se limpia al iniciar |
| Trazabilidad | Cada llamada queda en historial, `out/log.jsonl` y el log del caso |
| Legibilidad | TypeScript sin `any`, funciones cortas, esquemas Zod y contratos tipados |
| Operación | Un comando levanta la aplicación y otro ejecuta la demo sin clave del modelo |
| Privacidad | Solo se usan datos ficticios de los fixtures |

## 5. Historias de usuario y criterios de implementación

### HU-1 — Leer la solicitud

**Resultado esperado:** país del cliente, cliente, formato, campos y soportes solicitados.

**Validaciones necesarias:** caso existente, archivo JSON válido, formato conocido y plantilla compatible. Las etiquetas ambiguas deben salir como `requiere_confirmacion`.

**Escenarios:**

- Caso XLSX de Colombia.
- Caso PDF de Ecuador.
- Caso XLSX de Honduras.
- Caso portal de Panamá.
- Caso con archivo faltante o JSON inválido.

### HU-2 — Mapear campos al maestro

**Resultado esperado:** clasificación completa por campo, ruta de origen, valor cuando aplique y motivo de confirmación o faltante.

**Regla crítica:** el modelo puede coordinar herramientas, pero la fuente de verdad debe ser la herramienta de mapeo, no una respuesta libre del LLM.

### HU-3 — Generar formulario

**Prioridades:**

- P0: XLSX para `co-industrias-delta` y `hn-agroexport-sula`.
- P1: PDF para `ec-corp-andina`.
- P2: portal para `pa-logistica-istmo` mediante Markdown copiable.

La implementación debe preservar hojas, celdas y orden declarados por los fixtures. Si no se dispone de una plantilla binaria real, el generador debe documentar si crea un archivo nuevo a partir de la definición JSON.

### HU-4 — Armar paquete para firma

El paquete debe ser utilizable por una persona sin consultar nuevamente el repositorio. Debe mostrar faltantes, vencimientos, fuentes y bloqueo de firma.

### HU-5 — Manejar errores

Los errores esperados deben probarse como escenarios funcionales, no solo con pruebas unitarias. El chat debe mostrar lenguaje de negocio y ocultar trazas internas.

## 6. Inventario de fixtures y análisis por caso

### 6.1 Resumen

| Caso | País cliente | Formato | Plantilla | Soportes exigidos | Resultado esperado |
|---|---|---|---|---:|---|
| `co-industrias-delta` | CO | XLSX | `plantilla-celdas.json` | 4 | Formulario y paquete; todos los campos de plantilla tienen fuente |
| `ec-corp-andina` | EC | PDF | `plantilla-campos.json` | 5 | PDF; falta contribuyente especial y falta soporte tributario |
| `hn-agroexport-sula` | HN | XLSX | `plantilla-celdas.json` | 3 | XLSX; falta referencias comerciales y requiere confirmación de identificador extranjero |
| `pa-logistica-istmo` | PA | Portal | `plantilla-campos.json` disponible | 2 | Valores copiable; no automatizar portal |

### 6.2 `co-industrias-delta`

- Solicita información general y bancaria.
- Los campos de razón social, NIT, dígito de verificación, dirección, ciudad, código postal, teléfono, correo comercial, representante, identificación, actividad, CIIU y régimen tributario tienen correspondencia en el maestro.
- Banco, tipo de cuenta, número y titular también tienen correspondencia.
- Los cuatro soportes exigidos existen en el índice.
- El estado de vigencia depende de la fecha efectiva de ejecución: Cámara de Comercio vence el 2026-09-30; los demás soportes aplicables del caso no tienen vencimiento anterior a esa fecha.

### 6.3 `ec-corp-andina`

- La etiqueta `RUC` se resuelve al NIT, pero debe quedar en `requiere_confirmacion` por tratarse de una identificación extranjera.
- `Número de contribuyente especial` no existe en el maestro y debe quedar `faltante`.
- Los campos restantes tienen fuentes, incluidos SWIFT y datos bancarios.
- El soporte `certificado_cumplimiento_tributario` no existe en `repositorio/soportes/index.json`.
- Los soportes disponibles fueron emitidos en Colombia, mientras que la solicitud corresponde a Ecuador. Debe definirse si el país emisor es solo informativo o si invalida el soporte para este caso.
- El PDF puede generarse con los campos disponibles, aunque el paquete no debe marcarse `listo_para_firma` por faltante documental y campo obligatorio faltante.

### 6.4 `hn-agroexport-sula`

- La plantilla es XLSX y está correctamente disponible como `plantilla-celdas.json`.
- `RTN` se mapea al NIT del maestro y requiere confirmación por identificación extranjera.
- `Referencias comerciales` no existe en el glosario ni en el maestro: debe quedar `faltante`.
- Los campos de país, fecha de constitución, empleados e ingresos tienen fuente, pero debe aclararse el formato de moneda y fecha esperado por el cliente.
- Cámara de Comercio, RUT y parafiscales existen en el repositorio.
- `parafiscales` tiene vigencia hasta 2026-08-31; cualquier ejecución posterior debe marcarlo vencido.

### 6.5 `pa-logistica-istmo`

- Es el caso de portal y no debe intentar acceso a la URL ni solicitar credenciales.
- Aunque el formato es `portal`, existe `plantilla-campos.json`; debe utilizarse como definición de valores para copiar.
- RUC requiere confirmación por identificación extranjera.
- Los campos bancarios están explícitamente solicitados, por lo que pueden aparecer en `valores-portal.md`, pero no en el borrador de correo.
- Cámara de Comercio y RUT existen, aunque son documentos emitidos en Colombia para una solicitud de Panamá; requiere una decisión de negocio sobre aceptación jurisdiccional.
- Debe documentarse la separación de responsabilidades: el humano ingresa credenciales, resuelve CAPTCHA/MFA y hace el clic final de envío.

## 7. Contrato técnico obligatorio

### Herramientas

| Herramienta | Entrada | Responsabilidad |
|---|---|---|
| `proveedor_leer_solicitud` | `{ caso }` | Leer solicitud, plantilla y soportes exigidos |
| `proveedor_mapear_campos` | `{ caso, campos[] }` | Resolver estados, valores y fuentes |
| `proveedor_generar_formulario` | `{ caso, mapeo }` | Crear XLSX, PDF o valores de portal |
| `proveedor_armar_paquete` | `{ caso }` | Copiar soportes, checklist y correo |
| `proveedor_simular_envio` | `{ caso, confirmado }` | Exigir confirmación y crear simulación |

Todas deben usar Zod, ser importables desde `demo.ts`, recibir contexto de sesión/directorio y devolver strings JSON sin lanzar excepciones.

### Ciclo del agente

1. Recibir mensaje y recuperar sesión.
2. Interpretar la intención sin inventar datos.
3. Llamar herramientas en el orden necesario.
4. Validar y devolver cada resultado al modelo.
5. Detenerse al alcanzar el máximo de iteraciones.
6. Exigir confirmación cuando corresponda.
7. Mostrar resumen, faltantes, rutas generadas y siguiente acción.

El front debe mostrar historial, indicador de procesamiento, llamadas a herramientas y estado de confirmación. El backend debe separar ciclo, adaptador LLM y herramientas.

## 8. Arquitectura futura propuesta

```text
Front de chat
    -> API HTTP /api/chat
        -> Gestor de sesión
            -> Ciclo del agente
                -> Adaptador LLM
                -> Registro de tool calls
                -> Herramientas Zod
                    -> reto-01/ (solo lectura)
                    -> out/ (escritura controlada)
```

Separaciones obligatorias:

- `agent/prompt.md`: comportamiento, límites y reglas de confirmación.
- `src/knowledge/`: explicación del proceso y reglas de negocio.
- `src/tools/`: lectura, mapeo, generación y paquete.
- `src/llm/`: interfaz y proveedor concreto.
- `src/server.ts`: HTTP y ciclo de ejecución.
- `demo.ts`: prueba directa de herramientas.

El directorio real entregado en la raíz del repositorio es `reto-01/`, mientras que el PRD usa ejemplos con `fixtures/reto-01/`. La raíz debe ser configurable y no quedar codificada con una de las dos rutas.

## 9. Decisiones que deben validarse antes de codificar

1. **Fecha de vigencia:** usar la fecha actual del sistema, la fecha de la solicitud o una fecha de ejecución configurable. La regla del PRD dice fecha de ejecución; se recomienda permitir una fecha de evaluación explícita para demos deterministas.
2. **País de soporte:** definir si un soporte emitido en Colombia puede satisfacer requisitos de clientes de Ecuador, Honduras o Panamá.
3. **Identificación extranjera:** confirmar si se muestra el NIT colombiano como propuesta o si debe quedar vacío hasta confirmación humana.
4. **Campos obligatorios faltantes:** confirmar que el PDF se genera parcialmente, pero el paquete queda bloqueado.
5. **Plantilla binaria:** confirmar si en implementación se crearán archivos XLSX/PDF desde JSON o si se incorporarán plantillas reales.
6. **Normalización monetaria:** definir cómo se muestra `ingresos_ultimo_ano.valor` y su moneda en cada formulario.
7. **Campos de contacto:** confirmar que `Correo electrónico` representa contacto comercial y no correo general de la empresa.
8. **Borrador de correo:** definir destinatario, asunto y lista exacta de anexos sin revelar información bancaria.
9. **Confirmación:** definir las frases válidas para confirmar el envío simulado y asegurar que la confirmación solo sea válida para la acción inmediatamente anterior.
10. **Trazabilidad:** definir cuánto detalle se registra en logs sin duplicar datos sensibles.

## 10. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El LLM inventa datos | Alto | Herramientas como única fuente; validación de rutas y valores |
| Identificadores extranjeros incorrectos | Alto | Estado `requiere_confirmacion`, regla por país y revisión humana |
| Soportes vencidos | Alto | Comparación contra fecha de evaluación y bloqueo de firma |
| Soportes de jurisdicción incorrecta | Medio/alto | Regla explícita de país emisor y alerta en checklist |
| Plantillas incompletas o corruptas | Medio | Validadores JSON, errores funcionales y procesamiento parcial |
| Exposición de cuentas bancarias | Alto | No incluirlas en correo/logs; controlar respuestas y archivos |
| Costos impredecibles del LLM | Medio | Iteraciones, tokens, timeout y límites configurables |
| Portales con MFA/CAPTCHA o cambios de layout | Alto | No automatizar en el reto; preparar valores y mantener al humano en control |
| Diferencia entre rutas documentadas y reales | Medio | Configuración de raíz de fixtures y pruebas de arranque |

## 11. Estrategia de pruebas para la futura implementación

### Unitarias

- Resolución de sinónimos del glosario.
- Lectura de rutas anidadas del maestro.
- Clasificación `lleno`, `faltante`, `requiere_confirmacion`.
- Regla de identificación por país.
- Comparación de vigencia.
- Exclusión de datos bancarios del borrador de correo.
- Validación del contrato `{ ok, data }` / `{ ok: false, error }`.

### Integración

- Herramienta de lectura para los cuatro casos.
- Generación XLSX respetando hoja y celda.
- Generación PDF respetando orden y etiquetas.
- Generación de valores de portal.
- Construcción del paquete y log.
- Bloqueo por soporte ausente o vencido.
- Confirmación antes de simulación.

### Aceptación

- Procesar los cuatro casos desde el chat.
- Ver llamadas de herramientas en la interfaz.
- Confirmar que ningún campo se inventa.
- Confirmar que un segundo mensaje explícito crea solo `ENVIO-SIMULADO.md`.
- Ejecutar `demo.ts` sin clave del modelo.
- Ejecutar dos veces y comparar resultados excluyendo timestamps.

## 12. Criterio de salida para comenzar implementación

La implementación puede iniciar cuando se validen las diez decisiones abiertas de la sección 9, especialmente fecha de vigencia, aceptación de soportes por país, tratamiento del identificador extranjero y formato de plantillas.

El primer incremento recomendado es implementar HU-1 y HU-2 con los cuatro casos, porque establecen el contrato de datos, permiten detectar inconsistencias temprano y no dependen todavía de la generación binaria de documentos. Luego se debe implementar HU-3 para XLSX, HU-4, HU-3 para PDF, el modo portal y finalmente la interfaz conversacional completa.

## 13. Fuentes revisadas

- `PRD-01-agente-registro-proveedor 3_0452.md`
- `reto-01/glosario-campos.json`
- `reto-01/repositorio/maestro.json`
- `reto-01/repositorio/soportes/index.json`
- `reto-01/repositorio/soportes/*.txt`
- `reto-01/casos/co-industrias-delta/*`
- `reto-01/casos/ec-corp-andina/*`
- `reto-01/casos/hn-agroexport-sula/*`
- `reto-01/casos/pa-logistica-istmo/*`
- `README.md` del repositorio, que actualmente solo identifica la capacitación y no contiene instrucciones técnicas adicionales.
