import { serve } from "@hono/node-server";
import app from "./app";

serve(app, (info) => {
  console.log("listening on http://localhost:3000");
});
