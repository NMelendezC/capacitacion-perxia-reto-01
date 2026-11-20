export type ChatRole = "user" | "assistant";
export interface ChatMessage { role: ChatRole; content: string; }
export interface ToolCallSummary { name: string; arguments: Record<string, unknown>; ok: boolean; summary: string; }
export interface PendingAction { caso: string; action: "simular_envio"; }
export interface SessionState { messages: ChatMessage[]; toolCalls: ToolCallSummary[]; pendingAction?: PendingAction; }
export interface AgentTurnResult { reply: string; toolCalls: ToolCallSummary[]; needsConfirmation: boolean; }
