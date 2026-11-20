import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { runTurn } from "../src/agent/loop.js";

describe("agent loop", () => {
 it("procesa un caso y exige confirmación", async () => { const context = { directory: resolve(import.meta.dirname, ".."), sessionId: "agent-case" }; const result = await runTurn(context, 'Procesa el caso "co-industrias-delta"'); expect(result.needsConfirmation).toBe(true); expect(result.toolCalls).toHaveLength(4); });
 it("acepta únicamente una confirmación exacta inmediata", async () => { const context = { directory: resolve(import.meta.dirname, ".."), sessionId: "agent-confirm" }; await runTurn(context, 'Procesa el caso "pa-logistica-istmo"'); const result = await runTurn(context, "enviar"); expect(result.reply).toContain("Envío simulado"); });
});
