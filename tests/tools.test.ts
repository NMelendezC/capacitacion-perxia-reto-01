import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { armar_paquete, generar_formulario, leer_solicitud, mapear_campos, simular_envio } from "../src/tools/proveedor.js";

const context = { directory: resolve(import.meta.dirname, ".."), sessionId: "test" };

describe("proveedor tools", () => {
 it("lee y mapea los cuatro casos", async () => {
  for (const caso of ["co-industrias-delta", "ec-corp-andina", "hn-agroexport-sula", "pa-logistica-istmo"]) {
   const request = JSON.parse(await leer_solicitud.execute({ caso }, context)); expect(request.ok).toBe(true);
   const mapping = JSON.parse(await mapear_campos.execute({ caso, campos: request.data.campos.map((field: { etiqueta: string }) => field.etiqueta) }, context)); expect(mapping.ok).toBe(true);
  }
 });
 it("marca el identificador extranjero para Ecuador", async () => { const result = JSON.parse(await mapear_campos.execute({ caso: "ec-corp-andina", campos: ["RUC"] }, context)); expect(result.data.requiere_confirmacion[0].nota).toBe("identificador extranjero"); });
 it("genera formulario y no simula envío sin confirmación", async () => { const mapping = JSON.parse(await mapear_campos.execute({ caso: "co-industrias-delta", campos: ["Razón social"] }, context)); const form = JSON.parse(await generar_formulario.execute({ caso: "co-industrias-delta", mapeo: mapping.data }, context)); expect(form.ok).toBe(true); expect(existsSync(resolve(context.directory, form.data.ruta))).toBe(true); const send = JSON.parse(await simular_envio.execute({ caso: "co-industrias-delta", confirmado: false }, context)); expect(send.ok).toBe(false); });
 it("arma paquete sin exponer cuenta en correo", async () => { const result = JSON.parse(await armar_paquete.execute({ caso: "ec-corp-andina" }, context)); expect(result.ok).toBe(true); });
});
