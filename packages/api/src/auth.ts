import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { organization } from "better-auth/plugins";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  basePath: "/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
      invitationExpiresIn: 60 * 60 * 48,
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/accept-invitation/${data.id}`;
        // Replace with a real email service (Resend, Nodemailer, etc.)
        console.log(
          `[INVITE] To: ${data.email} | Role: ${data.invitation.role} | Link: ${inviteLink}`,
        );
      },
    }),
  ],
  trustedOrigins: [process.env.FRONTEND_URL ?? "http://localhost:3000"],
});

export type Auth = typeof auth;
