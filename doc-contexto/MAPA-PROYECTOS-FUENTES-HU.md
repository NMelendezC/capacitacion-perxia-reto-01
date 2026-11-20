# Mapa de proyectos, fuentes y trazabilidad de historias de usuario

**Estado:** propuesta para validación; no representa archivos ya implementados.  
**Base:** `PRD-01-agente-registro-proveedor 3_0452.md` y `doc-contexto/ANALISIS-REQUERIMIENTOS-REGISTRO-PROVEEDOR.md`.  
**Fecha:** 2026-11-20.

## 1. Decisión de organización

Se propone **una sola aplicación TypeScript** con tres áreas lógicas, no tres servicios desplegados independientemente: interfaz de chat (`web/`), backend conversacional (`src/`) y herramientas de negocio importables desde el backend y `demo.ts` (`src/tools/`). Esto satisface el PRD sin duplicar el motor de reglas ni agregar una base de datos.

En este repositorio, `reto-01/` **ya contiene los fixtures entregados**, no la aplicación. Se conserva sin cambios como fuente de solo lectura; el código propuesto vive en carpetas hermanas en la raíz. La ruta `fixtures/reto-01/` de los ejemplos del PRD es conceptual: debe configurarse para apuntar a `reto-01/`, sin duplicar ni modificar los datos.

| Área | Responsabilidad | HU asociadas |
|---|---|---|
| `web/` | Conversación, historial, indicador de procesamiento, trazas de herramientas y confirmación | HU-1 a HU-5; énfasis HU-4 y HU-5 |
| `src/server.ts` + `src/agent/` | API, sesiones, bucle modelo-herramientas, topes y autorización de simulación | HU-1 a HU-5 |
| `src/tools/` + `src/domain/` | Lectura y reglas deterministas; creación de artefactos y paquete | HU-1 a HU-5 |
| `src/llm/` | Adaptador de proveedor sustituible sin tocar el bucle | Habilitador transversal HU-1 a HU-5 |
| `reto-01/` | Datos de casos, glosario, maestro y soportes ficticios | HU-1 a HU-4; insumo de pruebas HU-5 |

## 2. Árbol de fuentes propuesto

Las rutas marcadas **existente** ya están en el repositorio. El resto son **por crear durante la implementación**; los nombres internos de archivos son propuesta de diseño, salvo los exigidos expresamente por el PRD.

```text
./
├── PRD-01-agente-registro-proveedor 3_0452.md       [existente; entrada]
├── doc-contexto/                                      [existente; análisis, no runtime]
│   ├── ANALISIS-REQUERIMIENTOS-REGISTRO-PROVEEDOR.md  [existente]
│   └── MAPA-PROYECTOS-FUENTES-HU.md                   [este documento]
├── reto-01/                                          [existente; fixtures inmutables]
│   ├── casos/<caso>/solicitud.json
│   ├── casos/<caso>/plantilla-celdas.json | plantilla-campos.json
│   ├── casos/<caso>/soportes-exigidos.json
│   ├── glosario-campos.json
│   ├── repositorio/maestro.json
│   └── repositorio/soportes/{index.json,*.txt}
├── agent/prompt.md                                   [por crear; obligatorio]
├── src/
│   ├── server.ts                                     [por crear]
│   ├── agent/{loop.ts,sessions.ts,confirmation.ts}    [por crear]
│   ├── llm/{adapter.ts,<proveedor>.ts}                [por crear]
│   ├── tools/proveedor.ts                             [por crear; contrato obligatorio]
│   ├── domain/{fixtures.ts,mapping.ts,documents.ts,package.ts} [por crear; propuesta]
│   └── knowledge/registro-proveedor.md               [por crear]
├── web/{index.html,main.ts,styles.css}                [por crear; opción HTML/TS]
├── tests/{tools.test.ts,agent.test.ts,api.test.ts}    [por crear; esquema sujeto a runner]
├── demo.ts                                           [por crear; obligatorio]
├── package.json                                      [por crear]
├── tsconfig.json                                     [por crear si el runner lo requiere]
├── .env.example                                      [por crear; sin secretos]
├── .gitignore                                        [existente; ampliar si hace falta]
├── README.md                                         [existente; completar]
├── SOLUCION.md                                       [por crear; obligatorio]
└── out/                                              [generado en ejecución; no versionar]
```

La estructura de `web/` es una **opción de mínimo acoplamiento**, no una decisión cerrada de framework. La elección de Bun/Node, proveedor/modelo y librerías de XLSX/PDF se tomará y justificará al implementar; el PRD solo fija TypeScript y Zod para argumentos de herramientas.

## 3. Fuentes existentes: uso y HU

| Fuente | Uso previsto | HU |
|---|---|---|
| `PRD-01-agente-registro-proveedor 3_0452.md` | Contrato funcional y técnico; fuente de criterios de aceptación y entrega. No se modifica. | HU-1 a HU-5 |
| `doc-contexto/ANALISIS-REQUERIMIENTOS-REGISTRO-PROVEEDOR.md` | Decisiones abiertas, riesgos y escenarios por caso; documento de trabajo, no fuente de datos runtime. | HU-1 a HU-5 |
| `reto-01/casos/*/solicitud.json` | Identidad del caso, país del cliente, cliente, formato y mensaje normalizado. | HU-1; contexto HU-2 a HU-4 |
| `reto-01/casos/*/plantilla-celdas.json` | Etiquetas, hojas y celdas exactas para los casos XLSX. | HU-1, HU-2, HU-3 |
| `reto-01/casos/*/plantilla-campos.json` | Campos y orden de PDF; listado copiable para portal. | HU-1, HU-2, HU-3 |
| `reto-01/casos/*/soportes-exigidos.json` | Tipos de documentos pedidos por cada cliente. | HU-1, HU-4 |
| `reto-01/glosario-campos.json` | Sinónimos entre etiquetas del cliente y rutas del maestro. | HU-2 |
| `reto-01/repositorio/maestro.json` | Única fuente de valores del proveedor; el agente no inventa valores. | HU-2, HU-3 |
| `reto-01/repositorio/soportes/index.json` | Metadatos para localizar soporte y evaluar `vigencia_hasta`. | HU-4 |
| `reto-01/repositorio/soportes/*.txt` | Archivos ficticios que se copian al paquete si están exigidos y presentes. | HU-4 |

**Cobertura de fixtures:** CO/XLSX y HN/XLSX; EC/PDF; PA/portal. `ec-corp-andina` evidencia campo y soporte ausentes; `hn-agroexport-sula` evidencia referencias comerciales ausentes y soporte parafiscales vencido. No hay un fixture de Perú, plantilla corrupta o caso inexistente: esos escenarios requieren pruebas específicas sin alterar los cuatro casos entregados.

## 4. Fuentes a generar: finalidad y vínculo con las HU

### 4.1 Configuración y entrada de la aplicación

| Fuente propuesta | Uso y contenido mínimo | HU |
|---|---|---|
| `package.json` | Scripts de arranque, demo y pruebas; dependencias justificadas. Un comando debe iniciar front y backend. | Todas, habilitador |
| `tsconfig.json` | Verificación de tipos estricta y configuración de compilación, si se usa. | Todas, habilitador de calidad |
| `.env.example` | Nombres de variables: proveedor/modelo y clave del LLM, raíz de fixtures, límites de iteración/tokens y parámetros operativos; **sin valores secretos**. | Todas; seguridad HU-5 |
| `.gitignore` (actualizar) | Excluir `out/`, `node_modules/`, claves y artefactos locales; ya existe, no crear otro. | Todas; seguridad y entrega |
| `src/server.ts` | API de chat, historial y salud; serializa respuestas sin exponer secretos ni trazas crudas. | HU-1 a HU-5 |
| `web/index.html`, `web/main.ts`, `web/styles.css` | Chat usable, historial, entrada, indicador de espera, tool calls visibles y pregunta de confirmación destacada. Si se elige otro framework, cambian estos nombres pero no la responsabilidad. | HU-1 a HU-5 |

### 4.2 Agente y modelo

| Fuente propuesta | Uso y contenido mínimo | HU |
|---|---|---|
| `agent/prompt.md` | Instrucciones del agente: usar herramientas como única fuente, no inventar datos ni enviar, pedir confirmación en turno separado, explicar faltantes. Obligatorio como archivo aparte. | HU-1 a HU-5 |
| `src/knowledge/registro-proveedor.md` | Conocimiento del proceso (etapas, estados y reglas) separado del prompt y del servidor; no debe incluir datos ficticios como verdad universal. | HU-1 a HU-4 |
| `src/agent/loop.ts` | Iterar mensajes → adaptador → tool calls → resultados → respuesta; validar argumentos, imponer tope, registrar resultados y manejar fallos. | HU-1 a HU-5 |
| `src/agent/sessions.ts` | Guardar historial y estado de la sesión en memoria o archivos; recuperar contexto por `sessionId`. | HU-1 a HU-5 |
| `src/agent/confirmation.ts` | Vincular confirmación explícita al caso y acción pendientes del turno anterior; impedir que una respuesta genérica o tardía simule el envío. | HU-4, HU-5 |
| `src/llm/adapter.ts` | Interfaz propia `enviar(mensajes, herramientas) → respuesta`; desacopla el bucle del proveedor. | Todas, habilitador |
| `src/llm/<proveedor>.ts` | Implementación única del proveedor elegido, con timeout y clave solo en backend. El modelo concreto queda pendiente de elección. | Todas; error HU-5 |

### 4.3 Herramientas y lógica de negocio

| Fuente propuesta | Uso y contenido mínimo | HU |
|---|---|---|
| `src/tools/proveedor.ts` | Exportar **exactamente** `leer_solicitud`, `mapear_campos`, `generar_formulario`, `armar_paquete`, `simular_envio`: nombre visible `proveedor_<export>`, `description`, argumentos Zod con `.describe()`, `execute(args, ctx)` que retorna JSON string `{ ok, data }` o `{ ok: false, error }` y no propaga excepciones. Importable por `demo.ts` sin HTTP ni LLM. | HU-1 a HU-5 |
| `src/domain/fixtures.ts` | Leer y validar JSON y rutas de caso dentro de `reto-01/`; separar errores de formato, inexistencia y lectura. | HU-1, HU-5 |
| `src/domain/mapping.ts` | Resolver glosario/rutas anidadas, clasificar `lleno`, `faltante`, `requiere_confirmacion`, aplicar regla NIT/RUC/RTN y trazar fuente. | HU-1 (ambigüedad), HU-2 |
| `src/domain/documents.ts` | Generar `formulario.xlsx`, `formulario.pdf` o `valores-portal.md` desde el mapeo; conservar celdas/orden, dejar explícitos faltantes y no rellenar por intuición. | HU-3, HU-5 |
| `src/domain/package.ts` | Consultar índice, cotejar existencia y vencimiento, copiar soportes exigidos, generar checklist y correo, calcular `listo_para_firma`; nunca enviar realmente. | HU-4, HU-5 |
| `demo.ts` | Invocar las cinco herramientas para todos los casos sin modelo; limpiar su salida de demo al iniciar y presentar resultados reproducibles salvo timestamps. No debe borrar resultados ajenos a la demo. | HU-1 a HU-5 |

Los cuatro módulos de `src/domain/` son una propuesta de separación interna: las **cinco herramientas públicas** y sus firmas del PRD son el contrato que debe preservarse.

### 4.4 Pruebas, documentación y artefactos

| Fuente propuesta | Uso y contenido mínimo | HU |
|---|---|---|
| `tests/tools.test.ts` | Comprobar lectura, glosario, reglas por país, celdas, PDF/portal, soportes y respuestas tipadas; incluir casos inválidos sin alterar fixtures. | HU-1 a HU-5 |
| `tests/agent.test.ts` | Comprobar límite de bucle, errores LLM y confirmación exclusivamente en el turno siguiente; usar adaptador simulado. | HU-4, HU-5; flujo transversal |
| `tests/api.test.ts` | Comprobar chat, recuperación de sesión y salud sin filtrar credenciales. | HU-1 a HU-5 |
| `README.md` (completar) | Un comando de arranque, configuración, demo sin modelo, API y link real de prueba una vez publicado. | Todas; requisito de entrega |
| `SOLUCION.md` | Problema, arquitectura, ciclo, modelo/costo estimado, diseño de portal futuro, tres trade-offs, supuestos, cobertura real por HU, uso de IA y riesgos. **No declarar implementado antes de hacerlo.** | Todas; requisito de entrega |
| `out/<caso>/formulario.xlsx` | Salida P0 con etiquetas y valores en las celdas especificadas. | HU-3 |
| `out/<caso>/formulario.pdf` | Salida P1 con etiquetas y valores ordenados. | HU-3 |
| `out/<caso>/valores-portal.md` | Salida P2 para copia humana; no interactúa con el portal. | HU-3 |
| `out/<caso>/paquete/{formulario o valores-portal,soportes,checklist.md,borrador-correo.md}` | Entrega para revisión/firma; soporte vencido o ausente bloquea `listo_para_firma`. | HU-4 |
| `out/<caso>/ENVIO-SIMULADO.md` | Evidencia de simulación creada solo tras confirmación explícita válida; **no es envío real**. | HU-4 |
| `out/log.jsonl` y `out/<caso>/log.jsonl` | Registro visible/operativo de tool calls: timestamp, nombre, éxito y resumen sin secretos ni datos bancarios. | Todas; HU-5 |

**No crear ahora:** `out/` versionado, cliente real de correo, automatizador de portales, microservicio de firmas ni módulo bonus. `modulo/` con `agent.md`, `tools/proveedor.ts` y `skill/registro-proveedor/SKILL.md` es opcional para puntaje adicional y solo se justifica si reutiliza las mismas fuentes sin copias divergentes.

## 5. Matriz de trazabilidad resumida

| HU | Fuentes de entrada | Implementación principal | Evidencia esperada |
|---|---|---|---|
| HU-1 Leer solicitud | `casos/*/solicitud.json`, plantillas, soportes exigidos | `src/domain/fixtures.ts`, `src/tools/proveedor.ts`, API/chat | Campos, país, formato, soportes; errores legibles |
| HU-2 Mapear campos | Plantillas, glosario, maestro | `src/domain/mapping.ts`, `src/tools/proveedor.ts` | Estado y fuente por campo; ningún valor inventado |
| HU-3 Generar formulario | Plantillas y mapeo | `src/domain/documents.ts`, `src/tools/proveedor.ts` | XLSX/PDF o Markdown portal en `out/<caso>/` |
| HU-4 Armar paquete | Formulario, `soportes-exigidos.json`, índice y archivos | `src/domain/package.ts`, `src/agent/confirmation.ts`, chat | Paquete, checklist, estado y simulación confirmada |
| HU-5 Manejar errores | Casos inválidos, respuestas de herramientas y LLM | Validación en `src/tools/`, `src/agent/loop.ts`, API y pruebas | Fallos claros, sin excepción cruda; sesión recuperable |

## 6. Dependencias de implementación y puntos a validar

**Secuencia sugerida:** configuración/contratos → HU-1 lectura → HU-2 mapeo → HU-3 XLSX → HU-4 paquete → HU-3 PDF y portal → agente/chat/confirmación → HU-5 y pruebas de regresión → despliegue y documentación final. La HU-5 debe aplicarse transversalmente desde la primera herramienta, no reservarse al final.

Antes de congelar el diseño, validar los puntos abiertos de `doc-contexto/ANALISIS-REQUERIMIENTOS-REGISTRO-PROVEEDOR.md`: fecha de evaluación de vigencia, validez de soportes colombianos ante clientes extranjeros, presentación del NIT como propuesta RUC/RTN, tratamiento de campos obligatorios faltantes, formato de datos y criterio de confirmación. **Si el PRD y el análisis difieren, prevalece el PRD hasta que el responsable del requerimiento apruebe un cambio.** En particular, RN3 indica que un campo faltante **no bloquea** por sí solo `listo_para_firma`, aun si la plantilla PDF lo marca obligatorio; documentar la discrepancia y no implementar un bloqueo adicional sin validación.

También debe verificarse en el despliegue que la fuente `reto-01/` sea de solo lectura y que `out/` sea escribible y persistente durante la demo; un hosting sin almacenamiento persistente puede invalidar el paquete y el historial aunque el chat responda.
