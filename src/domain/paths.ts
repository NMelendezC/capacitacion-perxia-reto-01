import { resolve, relative, sep } from "node:path";

export function safeChild(root: string, ...parts: string[]): string {
  if (parts.some((part) => !part || part.includes("/") || part.includes("\\") || part === "." || part === "..")) throw new Error("Identificador inválido");
  const target = resolve(root, ...parts);
  const rel = relative(resolve(root), target);
  if (rel.startsWith("..") || rel.includes(`..${sep}`)) throw new Error("Ruta fuera del directorio permitido");
  return target;
}
