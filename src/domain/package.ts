import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { readCase, readSupportIndex, supportExists, supportPath } from "./fixtures.js";
import { mapFields } from "./mapping.js";

export async function buildPackage(directory: string, caso: string): Promise<{ ruta: string; listo_para_firma: boolean; checklist: string[] }> {
 const [data, index, mappings] = await Promise.all([readCase(directory, caso), readSupportIndex(directory), mapFields(directory, caso)]);
 const target = join(directory, "out", caso, "paquete"); const supportsDir = join(target, "soportes"); await mkdir(supportsDir, { recursive: true });
 const checklist: string[] = []; let ready = true;
 for (const type of data.requiredSupports) { const record = index.find((item) => item.tipo === type); const exists = record ? await supportExists(directory, record.archivo) : false; const expired = Boolean(record?.vigencia_hasta && new Date(`${record.vigencia_hasta}T23:59:59`) < new Date()); const state = !exists ? "ausente" : expired ? "vencido" : "presente"; checklist.push(`- ${type}: ${state}`); if (state !== "presente") ready = false; if (record && exists && !expired) await copyFile(supportPath(directory, record.archivo), join(supportsDir, record.archivo)); }
 const missingRequired = [...mappings.faltantes, ...mappings.requiere_confirmacion].filter((item) => item.obligatorio); if (missingRequired.length) { ready = false; checklist.push(`- Campos obligatorios pendientes: ${missingRequired.map((item) => item.etiqueta).join(", ")}`); }
 await writeFile(join(target, "checklist.md"), checklist.join("\n")); await writeFile(join(target, "borrador-correo.md"), `Asunto: Registro como proveedor - ${data.request.cliente}\n\nAdjuntamos el formulario y soportes disponibles para revisión y firma.`);
 return { ruta: `out/${caso}/paquete`, listo_para_firma: ready, checklist };
}
