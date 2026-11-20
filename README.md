# Agente de Registro como Proveedor

Agente conversacional local para preparar formularios de registro como proveedor desde los fixtures entregados. No firma, no envía correos reales ni automatiza portales.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.

## Levantar localmente

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://127.0.0.1:3000/`.

## Variables de entorno

Para la demo actual no se requiere ninguna variable secreta. `.env.example` documenta rutas y límites previstos:

```env
FIXTURES_ROOT=reto-01
OUTPUT_ROOT=out
MAX_TOOL_ITERATIONS=25
MAX_SESSION_TOKENS=12000
```

No crear ni versionar un archivo `.env` con claves. La implementación actual usa un adaptador LLM simulado y no consume claves externas.

## Ejecutar la demo sin modelo

```bash
npm run demo
```

Procesa los cuatro casos entregados y escribe formularios, paquetes y logs en `out/`. La salida puede variar en el estado de soportes según la fecha del sistema; los timestamps de logs también varían.

## Calidad

```bash
npm run typecheck
npm run lint
npm test
```

## API local

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/chat` | Recibe `{ "sessionId", "message" }` y devuelve `reply`, `toolCalls`, `needsConfirmation`. |
| `GET` | `/api/sessions/:id` | Devuelve la sesión en memoria. |
| `GET` | `/api/health` | Informa el adaptador simulado sin exponer secretos. |

Ejemplo de mensaje:

```text
Procesa el caso "ec-corp-andina". No envíes nada todavía.
```

Después de que el agente deje un envío pendiente, usa exactamente `enviar`, `sí, enviar` o `confirmo envío` en el siguiente turno para crear la simulación.

## Link de prueba

No existe URL pública en esta entrega. La defensa está prevista en ejecución local, lo que no satisface el requisito de enlace público del PRD y puede tener la penalización indicada en la sección 9.3. Para publicar, se requiere desplegar el proceso Node.js, configurar HTTPS y asegurar almacenamiento persistente para `out/`.

## Estructura relevante

- `reto-01/`: fixtures de solo lectura.
- `src/tools/proveedor.ts`: contrato de las cinco herramientas.
- `src/domain/`: lógica determinista, documentos, paquete y auditoría.
- `src/agent/` y `src/llm/`: sesiones, confirmación, ciclo y adaptador simulado.
- `web/`: interfaz de chat.
- `out/`: artefactos generados y no versionados.
- `SOLUCION.md`: arquitectura, decisiones, cobertura y riesgos.

## Entrega

No incluir `node_modules/`, `out/` ni `.env` en el repositorio o ZIP de entrega.
