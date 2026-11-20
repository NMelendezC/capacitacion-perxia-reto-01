import type { ToolContext } from "../domain/types.js";
import { SimulatedAdapter } from "../llm/simulated.js";
import { armar_paquete, generar_formulario, leer_solicitud, mapear_campos, simular_envio } from "../tools/proveedor.js";
import { isConfirmation } from "./confirmation.js";
import { addMessage, pending, resetPending, session } from "./sessions.js";
import type { AgentTurnResult, ToolCallSummary } from "./types.js";

const maxTools = 25;
function call(name: string, args: Record<string, unknown>, raw: string): ToolCallSummary { const result = JSON.parse(raw) as { ok: boolean; error?: string; data?: unknown }; return { name, arguments: args, ok: result.ok, summary: result.ok ? "Completada" : result.error ?? "Error" }; }
export async function runTurn(context: ToolContext, message: string): Promise<AgentTurnResult> {
 const state = session(context.sessionId); addMessage(context.sessionId, { role: "user", content: message }); const calls: ToolCallSummary[] = [];
 const pendingAction = resetPending(context.sessionId);
 if (pendingAction && isConfirmation(message)) { const raw = await simular_envio.execute({ caso: pendingAction.caso, confirmado: true }, context); calls.push(call("proveedor_simular_envio", { caso: pendingAction.caso, confirmado: true }, raw)); const reply = calls[0]?.ok ? "Envío simulado creado." : "No fue posible simular el envío."; addMessage(context.sessionId, { role: "assistant", content: reply }); state.toolCalls.push(...calls); return { reply, toolCalls: calls, needsConfirmation: false }; }
 const instruction = new SimulatedAdapter().interpret(message);
 if (!instruction.caso) { const reply = "Indica un caso, por ejemplo: Procesa el caso \"ec-corp-andina\"."; addMessage(context.sessionId, { role: "assistant", content: reply }); return { reply, toolCalls: [], needsConfirmation: false }; }
 const readRaw = await leer_solicitud.execute({ caso: instruction.caso }, context); calls.push(call("proveedor_leer_solicitud", { caso: instruction.caso }, readRaw)); const read = JSON.parse(readRaw) as { ok: boolean; data?: { campos: Array<{ etiqueta: string }> }; error?: string }; if (!read.ok || !read.data) { const reply = read.error ?? "No se pudo leer el caso."; addMessage(context.sessionId, { role: "assistant", content: reply }); return { reply, toolCalls: calls, needsConfirmation: false }; }
 if (calls.length >= maxTools) return { reply: "Se alcanzó el límite de herramientas.", toolCalls: calls, needsConfirmation: false };
 const mapRaw = await mapear_campos.execute({ caso: instruction.caso, campos: read.data.campos.map((field) => field.etiqueta) }, context); calls.push(call("proveedor_mapear_campos", { caso: instruction.caso }, mapRaw)); const mapped = JSON.parse(mapRaw) as { ok: boolean; data?: Parameters<typeof generar_formulario.execute>[0]["mapeo"] }; if (!mapped.ok || !mapped.data) return { reply: "No se pudo mapear el caso.", toolCalls: calls, needsConfirmation: false };
 const formRaw = await generar_formulario.execute({ caso: instruction.caso, mapeo: mapped.data }, context); calls.push(call("proveedor_generar_formulario", { caso: instruction.caso }, formRaw)); const packageRaw = await armar_paquete.execute({ caso: instruction.caso }, context); calls.push(call("proveedor_armar_paquete", { caso: instruction.caso }, packageRaw)); const packageData = JSON.parse(packageRaw) as { ok: boolean; data?: { listo_para_firma: boolean } }; pending(context.sessionId, { caso: instruction.caso, action: "simular_envio" }); const reply = `Caso ${instruction.caso} procesado. Paquete listo para firma: ${packageData.data?.listo_para_firma ? "sí" : "no"}. Escribe enviar para simular el envío.`; addMessage(context.sessionId, { role: "assistant", content: reply }); state.toolCalls.push(...calls); return { reply, toolCalls: calls, needsConfirmation: true };
}
