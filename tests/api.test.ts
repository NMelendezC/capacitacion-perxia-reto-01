import { describe, expect, it } from "vitest";
import { app } from "../src/server.js";

describe("api", () => {
 it("informa salud sin secretos", async () => { const response = await app.inject({ method: "GET", url: "/api/health" }); expect(response.statusCode).toBe(200); expect(response.json().provider).toBe("simulated"); });
 it("valida cuerpo de chat", async () => { const response = await app.inject({ method: "POST", url: "/api/chat", payload: {} }); expect(response.statusCode).toBe(400); });
});
