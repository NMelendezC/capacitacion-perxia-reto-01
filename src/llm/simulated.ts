import type { LlmAdapter, SimulatedInstruction } from "./adapter.js";

export class SimulatedAdapter implements LlmAdapter {
  interpret(message: string): SimulatedInstruction {
    const match = message.match(/(?:procesa(?:r)?(?: el)? caso|caso)\s+["“]?([a-z]{2}-[a-z0-9-]+)["”]?/i);
    return { caso: match?.[1]?.toLocaleLowerCase(), wantsSend: /\benvía\b|\benviar\b/i.test(message) };
  }
}
