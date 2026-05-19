import { Hono } from "hono";
import { cors } from "hono/cors";
import { openAPIRouteHandler, describeRoute, resolver } from "hono-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import z from "zod";
import { auth } from "./auth.js";

const app = new Hono();

app.use(
  "/auth/*",
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

app.get(
  "/health",
  describeRoute({
    responses: {
      200: {
        description: "Health endpoint",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                status: z.string(),
              }),
            ),
          },
        },
      },
    },
  }),
  (c) =>
    c.json({
      status: "ok",
    }),
);

app.get("/reference", Scalar({ url: "/api/openapi" }));

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
      servers: [{ url: "/api", description: "Local Server" }],
    },
  }),
);

export default app;
