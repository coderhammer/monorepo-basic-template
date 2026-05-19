import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  basePath: "/api/auth",
  plugins: [organizationClient()],
});

export const {
  useSession,
  useListOrganizations,
  useActiveOrganization,
  signIn,
  signUp,
  signOut,
  organization,
} = authClient;
