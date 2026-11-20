import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { join } from "node:path";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { readCase } from "./fixtures.js";
import type { MappingResult } from "./types.js";

const value = (item: { valor?: unknown }) => item.valor === undefined ? "PENDIENTE DE CONFIRMACIÓN" : String(item.valor);
const flattened = (mapping: MappingResult) => [...mapping.llenos, ...mapping.faltantes, ...mapping.requiere_confirmacion];
export async function generateDocument(directory: string, caso: string, mapping: MappingResult): Promise<{ ruta: string; formato: string }> {
 const data = await readCase(directory, caso); const target = join(directory, "out", caso); await mkdir(target, { recursive: true }); const items = flattened(mapping);
 if (data.request.formato === "portal") { const file = join(target, "valores-portal.md"); await writeFile(file, items.map((item) => `- **${item.etiqueta}**: ${value(item)}`).join("\n")); return { ruta: `out/${caso}/valores-portal.md`, formato: "portal" }; }
 if (data.request.formato === "xlsx") { const workbook = new ExcelJS.Workbook(); for (const item of items) { const sheet = workbook.getWorksheet(item.hoja ?? "Registro") ?? workbook.addWorksheet(item.hoja ?? "Registro"); if (item.celdaEtiqueta) sheet.getCell(item.celdaEtiqueta).value = item.etiqueta; if (item.celdaValor) sheet.getCell(item.celdaValor).value = value(item); } const file = join(target, "formulario.xlsx"); await workbook.xlsx.writeFile(file); return { ruta: `out/${caso}/formulario.xlsx`, formato: "xlsx" }; }
 const file = join(target, "formulario.pdf"); await new Promise<void>((resolve, reject) => { const doc = new PDFDocument(); const stream = createWriteStream(file); doc.pipe(stream); doc.fontSize(16).text("Registro como proveedor"); for (const item of items) doc.fontSize(10).text(`${item.etiqueta}: ${value(item)}`); doc.end(); stream.on("finish", resolve); stream.on("error", reject); }); return { ruta: `out/${caso}/formulario.pdf`, formato: "pdf" };
}
