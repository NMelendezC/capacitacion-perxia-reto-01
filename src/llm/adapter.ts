export interface SimulatedInstruction { caso?: string; wantsSend?: boolean; }
export interface LlmAdapter { interpret(message: string): SimulatedInstruction; }
