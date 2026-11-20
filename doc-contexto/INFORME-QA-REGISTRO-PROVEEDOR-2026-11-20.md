# Informe QA — Agente de Registro como Proveedor

**Fecha:** 2026-11-20  
**Rol:** Analista QA senior  
**Alcance:** implementación actual de U1, U2 y U3; fixtures entregados; API Fastify y UI local.  
**Entorno:** Windows local, Node.js/npm, servidor `npm run dev` en `http://127.0.0.1:51848/`.

## 1. Resumen ejecutivo

La solución supera los gates técnicos locales y el flujo principal de procesamiento y confirmación simulada desde la UI. Se verificaron 8 pruebas automatizadas, typecheck, lint, demo de los cuatro fixtures y recorrido web de portal con tool calls visibles.

No se recomienda liberar como solución completa del reto sin atender los hallazgos bloqueantes de alcance: falta la URL pública solicitada por el PRD, no existe integración con un LLM real ni los archivos obligatorios de prompt/conocimiento, y la cobertura de regresión no valida completamente las reglas de paquete, artefactos y seguridad.

**Veredicto QA actual:** **No-Go para entrega completa del reto / Go condicionado para demo local técnica.**

## 2. Evidencia ejecutada

| ID | Validación | Resultado | Evidencia |
|---|---|---|---|
| QA-01 | TypeScript | Pass | `npm run typecheck` finalizó sin errores. |
| QA-02 | Lint | Pass | `npm run lint` finalizó sin errores. |
| QA-03 | Pruebas unitarias/integración | Pass | `npm test`: 3 archivos, 8 pruebas aprobadas. |
| QA-04 | Demo sin LLM | Pass con observación | `npm run demo` procesó CO, EC, HN y PA; los cuatro formularios se generaron. |
| QA-05 | Protección traversal | Pass | `caso: ../maestro` devolvió `{ ok: false, error: "Identificador inválido" }`. |
| QA-06 | Bloqueo sin confirmación | Pass | `simular_envio(confirmado: false)` devolvió `requiere confirmación explícita`. |
| QA-07 | UI: procesar portal | Pass | `pa-logistica-istmo` mostró respuesta, cuatro tool calls y banner de confirmación. |
| QA-08 | UI: envío simulado | Pass | mensaje exacto `enviar` creó simulación y ocultó el banner. |
| QA-09 | UI: botón habilitado post-respuesta | Inconcluso | La evidencia visual muestra el botón activo; la aserción de atributo falló porque un botón habilitado no posee atributo `disabled`, no porque esté deshabilitado. |

## 3. Cobertura funcional observada

| Historia | Estado QA | Cobertura ejecutada | Pendiente de prueba |
|---|---|---|---|
| HU-1 Leer solicitud | Parcialmente cubierta | Lectura de los cuatro casos por demo y pruebas. | JSON corrupto, plantilla faltante y formato no soportado. |
| HU-2 Mapear campos | Parcialmente cubierta | Mapeo de cuatro casos y RUC extranjero de Ecuador. | Sinónimos completos, confianza aproximada, faltantes de maestro y trazabilidad por cada campo. |
| HU-3 Generar formulario | Parcialmente cubierta | Generación de XLSX, PDF y Markdown portal durante demo. | Inspección de contenido/celdas de XLSX, orden PDF y ausencia de valores inventados. |
| HU-4 Armar paquete | Parcialmente cubierta | Paquete y flujo de confirmación por UI. | Checklist presente/ausente/vencido, copias de soportes, correo sin datos bancarios y bloqueo por obligatoriedad. |
| HU-5 Errores | Parcialmente cubierta | Validación de body API, caso traversal y bloqueo de envío. | Timeout/adaptador LLM, límite de 25 tools, límite de 100 mensajes, continuidad después de error y sanitización exhaustiva de logs. |

## 4. Hallazgos

### Bloqueantes para entrega completa

| ID | Severidad | Hallazgo | Evidencia | Recomendación |
|---|---|---|---|---|
| QA-B01 | Alta | No hay URL pública de prueba. | `README.md` y `SOLUCION.md` declaran defensa local. El PRD exige URL pública y anuncia penalización si solo se ejecuta localmente. | Desplegar en plataforma PaaS con URL HTTPS y almacenamiento adecuado para `out/`. |
| QA-B02 | Alta | No existe LLM real ni archivo `agent/prompt.md` obligatorio. | La solución usa `SimulatedAdapter`; `SOLUCION.md` reconoce que el prompt y conocimiento no existen. | Crear prompt y conocimiento separados; implementar adaptador de proveedor configurado por variables de entorno. |
| QA-B03 | Alta | `src/knowledge/registro-proveedor.md` obligatorio no está implementado. | Ausente del repositorio y reconocido en `SOLUCION.md`. | Extraer reglas de negocio a conocimiento versionado e integrarlo al ciclo. |

### Hallazgos relevantes

| ID | Severidad | Hallazgo | Evidencia | Recomendación |
|---|---|---|---|---|
| QA-R01 | Media | La demo reporta `listo_para_firma: false` en los cuatro casos, incluido CO. | Salida de `npm run demo`. | Confirmar si es efecto esperado de la fecha de ejecución; añadir pruebas que expliquen cada bloqueo. |
| QA-R02 | Media | Cobertura automatizada limitada. | 8 pruebas para cinco HUs; no valida celdas XLSX, contenido PDF, checklist, logs sanitizados o casos corruptos. | Ampliar pruebas de aceptación y regresión por criterio del PRD. |
| QA-R03 | Media | La validación de confirmación se apoya en el cliente y no se probó la expiración ante mensaje intermedio. | Prueba actual cubre la aceptación exacta, no la invalidación. | Añadir escenarios: mensaje distinto tras pendiente, confirmación tardía y sesión distinta. |
| QA-R04 | Media | Las rutas de fixtures/salida documentadas en `.env.example` no son consumidas por el código. | `src/server.ts`, herramientas y dominios usan rutas derivadas de `process.cwd()`. | Implementar configuración efectiva o retirar variables no aplicadas. |
| QA-R05 | Baja | La UI no cumple el objetivo de accesibilidad recomendado por el PRD/metodología. | El plan eligió UI visual; snapshot reportó textarea con `missingAccessibleName`. | Asociar correctamente etiqueta, asegurar foco visible y anunciar estados. |
| QA-R06 | Baja | La aserción de UI sobre botón habilitado requiere ajuste. | `browser.assert` falló esperando `disabled=false`; el atributo ausente equivale a habilitado. | Usar aserción de ausencia del atributo o interacción posterior como evidencia. |

## 5. Riesgo residual

- La lógica determinista reduce invención de datos, pero no hay validación exhaustiva de todos los artefactos generados.
- Los soportes se evalúan con fecha de sistema; la demo no fija fecha, por lo que los resultados cambian con el tiempo.
- El adaptador simulado no representa errores, costo, timeout ni tool calling de un LLM real.
- Sesiones en memoria no sobreviven reinicios.
- La solución local no cubre seguridad de despliegue, HTTPS, persistencia remota ni observabilidad.

## 6. Recomendación de siguientes pasos

1. Corregir los bloqueantes QA-B01, QA-B02 y QA-B03 antes de entregar como reto completo.
2. Añadir pruebas de aceptación para los cuatro casos y pruebas negativas de fixtures/plantillas corruptas.
3. Verificar programáticamente celdas XLSX, contenido/orden PDF, checklist, copias de soportes, exclusión de banco en correo y logs.
4. Añadir pruebas de confirmación tardía, límite de sesión y límite de tools.
5. Definir una fecha de evaluación configurable para pruebas deterministas de vigencia.
6. Ejecutar nuevamente gates y una prueba de humo desde la URL pública antes de la defensa.

## 7. Limitaciones de este informe

No se validó un despliegue público, proveedor LLM real, correo/firma/portal real, ni se inspeccionaron binariamente los documentos generados. Esas superficies no están implementadas o no forman parte de la evidencia local ejecutada.
