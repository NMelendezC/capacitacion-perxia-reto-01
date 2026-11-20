import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "node:path";
import { z } from "zod";
import { runTurn } from "./agent/loop.js";
import { session } from "./agent/sessions.js";

const app = Fastify({ logger: false });
await app.register(fastifyStatic, { root: join(process.cwd(), "web"), prefix: "/" });
const chatSchema = z.object({ sessionId: z.string().min(1).max(100), message: z.string().min(1).max(4000) });
app.post("/api/chat", async (request, reply) => { const body = chatSchema.safeParse(request.body); if (!body.success) return reply.status(400).send({ error: "Solicitud de chat inválida" }); return runTurn({ directory: process.cwd(), sessionId: body.data.sessionId }, body.data.message); });
app.get("/api/sessions/:id", async (request, reply) => { const parsed = z.object({ id: z.string().min(1).max(100) }).safeParse(request.params); if (!parsed.success) return reply.status(400).send({ error: "Sesión inválida" }); return { sessionId: parsed.data.id, ...session(parsed.data.id) }; });
app.get("/api/health", async () => ({ ok: true, provider: "simulated", model: "deterministic" }));
if (import.meta.main) await app.listen({ port: Number(process.env.PORT ?? 3000), host: "127.0.0.1" });
export { app };
