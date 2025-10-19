import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono 🫶"));

const port = Number(process.env.PORT ?? 3000);
console.log(`Listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
