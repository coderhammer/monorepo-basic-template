import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

const app = new Hono();

app.get("/health", (c) => c.text("ok"));

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
      servers: [{ url: "http://localhost:3000", description: "Local Server" }],
    },
  }),
);

export default app;
