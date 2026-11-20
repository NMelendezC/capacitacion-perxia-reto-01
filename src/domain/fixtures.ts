import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { safeChild } from "./paths.js";
import type { CaseData, SupportRecord } from "./types.js";

const requestSchema = z.object({ id: z.string(), pais: z.string(), cliente: z.string(), formato: z.enum(["xlsx", "pdf", "portal"]), adjuntos: z.array(z.string()) });
const spreadsheetSchema = z.array(z.object({ hoja: z.string(), celda_etiqueta: z.string(), etiqueta: z.string(), celda_valor: z.string() }));
const documentSchema = z.array(z.object({ etiqueta: z.string(), obligatorio: z.boolean() }));
const supportSchema = z.array(z.string());
const supportIndexSchema = z.array(z.object({ tipo: z.string(), archivo: z.string(), vigencia_hasta: z.string().nullable(), pais_emisor: z.string(), descripcion: z.string() }));

async function jsonFile<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  try { return schema.parse(JSON.parse(await readFile(path, "utf8"))); } catch { throw new Error("Archivo JSON inválido o inaccesible"); }
}

export async function readCase(directory: string, caso: string): Promise<CaseData> {
  const root = join(directory, "reto-01", "casos");
  const caseDir = safeChild(root, caso);
  const request = await jsonFile(join(caseDir, "solicitud.json"), requestSchema);
  const supports = await jsonFile(join(caseDir, "soportes-exigidos.json"), supportSchema);
  const templatePath = request.formato === "xlsx" ? "plantilla-celdas.json" : "plantilla-campos.json";
  if (request.formato === "xlsx") {
    const template = await jsonFile(join(caseDir, templatePath), spreadsheetSchema);
    return { request, fields: template.map((field) => ({ etiqueta: field.etiqueta, obligatorio: true, hoja: field.hoja, celdaEtiqueta: field.celda_etiqueta, celdaValor: field.celda_valor })), requiredSupports: supports };
  }
  const template = await jsonFile(join(caseDir, templatePath), documentSchema);
  const fields = template.map((field) => ({ etiqueta: field.etiqueta, obligatorio: field.obligatorio }));
  return { request, fields, requiredSupports: supports };
}

export async function readMaster(directory: string): Promise<Record<string, unknown>> { return jsonFile(join(directory, "reto-01", "repositorio", "maestro.json"), z.record(z.string(), z.unknown())); }
export async function readGlossary(directory: string): Promise<Record<string, string>> { return jsonFile(join(directory, "reto-01", "glosario-campos.json"), z.record(z.string(), z.string())); }
export async function readSupportIndex(directory: string): Promise<SupportRecord[]> { return jsonFile(join(directory, "reto-01", "repositorio", "soportes", "index.json"), supportIndexSchema); }
export async function supportExists(directory: string, file: string): Promise<boolean> { try { await access(safeChild(join(directory, "reto-01", "repositorio", "soportes"), file), constants.R_OK); return true; } catch { return false; } }
export function supportPath(directory: string, file: string): string { return safeChild(join(directory, "reto-01", "repositorio", "soportes"), file); }
