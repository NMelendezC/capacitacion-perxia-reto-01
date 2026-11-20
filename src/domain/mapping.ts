import { readCase, readGlossary, readMaster } from "./fixtures.js";
import type { FieldMapping, MappingResult } from "./types.js";

function valueAt(source: Record<string, unknown>, path: string): unknown { return path.split(".").reduce<unknown>((current, key) => current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined, source); }
function similarity(a: string, b: string): number { const x = a.toLocaleLowerCase(), y = b.toLocaleLowerCase(); return x === y ? 1 : x.includes(y) || y.includes(x) ? 0.8 : 0; }
export async function mapFields(directory: string, caso: string, labels?: string[]): Promise<MappingResult> {
 const [data, glossary, master] = await Promise.all([readCase(directory, caso), readGlossary(directory), readMaster(directory)]);
 const fields = labels ? data.fields.filter((field) => labels.includes(field.etiqueta)) : data.fields;
 const result: MappingResult = { llenos: [], faltantes: [], requiere_confirmacion: [] };
 for (const field of fields) {
  const exact = glossary[field.etiqueta];
  const best = exact ? undefined : Object.keys(glossary).map((key) => ({ key, score: similarity(key, field.etiqueta) })).sort((a,b) => b.score-a.score)[0];
  const route = exact ?? (best && best.score >= .8 ? glossary[best.key] : undefined);
  const base: FieldMapping = { ...field, estado: "faltante" };
  if (!route) { result.faltantes.push(base); continue; }
  const value = valueAt(master, route);
  if (value === undefined || value === null) { result.faltantes.push({ ...base, ruta: route }); continue; }
  const foreignId = route === "nit" && data.request.pais !== "CO";
  const mapping: FieldMapping = { ...base, estado: foreignId ? "requiere_confirmacion" : "lleno", ruta: route, valor: value as string | number | boolean, confianza: exact ? 1 : best?.score, ...(foreignId ? { nota: "identificador extranjero" } : {}) };
  result[mapping.estado === "lleno" ? "llenos" : "requiere_confirmacion"].push(mapping);
 }
 return result;
}
