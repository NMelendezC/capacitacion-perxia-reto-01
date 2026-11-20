import type { ChatMessage, PendingAction, SessionState } from "./types.js";

const sessions = new Map<string, SessionState>();
const limit = 100;
export function session(sessionId: string): SessionState { const current = sessions.get(sessionId) ?? { messages: [], toolCalls: [] }; sessions.set(sessionId, current); return current; }
export function addMessage(sessionId: string, message: ChatMessage): void { const current = session(sessionId); current.messages.push(message); if (current.messages.length > limit) current.messages.splice(0, current.messages.length - limit); }
export function pending(sessionId: string, action?: PendingAction): void { session(sessionId).pendingAction = action; }
export function resetPending(sessionId: string): PendingAction | undefined { const current = session(sessionId); const action = current.pendingAction; current.pendingAction = undefined; return action; }
