import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export async function audit(directory: string, caso: string, herramienta: string, ok: boolean, summary: Record<string, unknown>): Promise<void> {
 const entry = JSON.stringify({ ts: new Date().toISOString(), caso, herramienta, ok, resumen: summary }) + "\n";
 await mkdir(join(directory, "out", caso), { recursive: true });
 await Promise.all([appendFile(join(directory, "out", "log.jsonl"), entry), appendFile(join(directory, "out", caso, "log.jsonl"), entry)]);
}
