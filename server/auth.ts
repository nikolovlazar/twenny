import { betterAuth } from "better-auth";
import { pgClient } from "./db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { user } from "../auth-schema";
import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every day the session is updated)
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        required: false,
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Check if this is a sign-up, sign-in, or callback endpoint (where session is created)
      if (
        ctx.path.startsWith("/sign-up") ||
        ctx.path.startsWith("/sign-in") ||
        ctx.path.startsWith("/callback")
      ) {
        const newSession = ctx.context.newSession;

        if (!newSession) {
          return;
        }

        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
          return;
        }

        // Check if the user's email matches the admin email and role is not already admin
        if (newSession.user.email === adminEmail && newSession.user.role !== "admin") {
          // Update the user's role to admin
          await db
            .update(user)
            .set({ role: "admin" })
            .where(eq(user.id, newSession.user.id));
        }
      }
    }),
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

