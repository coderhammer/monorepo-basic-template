import createClient from "openapi-fetch";
import createReactQueryClient from "openapi-react-query";
import type { components, paths } from "./generated-api";

export type schemas = components["schemas"];

export const api = createClient<paths>({
  baseUrl: "/api",
});

export const $api = createReactQueryClient(api);
