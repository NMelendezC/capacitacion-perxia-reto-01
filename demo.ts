import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { armar_paquete, generar_formulario, leer_solicitud, mapear_campos } from "./src/tools/proveedor.js";

const directory = resolve(import.meta.dirname);
const context = { directory, sessionId: "demo" };
const cases = ["co-industrias-delta", "ec-corp-andina", "hn-agroexport-sula", "pa-logistica-istmo"];

await rm(resolve(directory, "out", "demo"), { recursive: true, force: true });
for (const caso of cases) {
 const request = JSON.parse(await leer_solicitud.execute({ caso }, context));
 const mapping = JSON.parse(await mapear_campos.execute({ caso, campos: request.data.campos.map((field: { etiqueta: string }) => field.etiqueta) }, context));
 const form = mapping.ok ? JSON.parse(await generar_formulario.execute({ caso, mapeo: mapping.data }, context)) : mapping;
 const packageResult = JSON.parse(await armar_paquete.execute({ caso }, context));
 console.log(JSON.stringify({ caso, lectura: request.ok, formulario: form.ok, paquete: packageResult.data?.listo_para_firma }, null, 2));
}
