import { Hono } from "hono";
import { openAPIRouteHandler, describeRoute, resolver } from "hono-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import z from "zod";

const app = new Hono();

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
