import { auth } from "../auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  // Bypass authentication for testing (NEVER use in production!)
  if (process.env.BYPASS_AUTH === "true") {
    const headersList = await headers();
    const bypassHeader = headersList.get("x-bypass-auth");
    
    if (bypassHeader === process.env.BYPASS_AUTH_SECRET || process.env.NODE_ENV === "development") {
      // Return a mock admin user for testing
      return {
        user: {
          id: "test-admin-id",
          email: "test@admin.com",
          name: "Test Admin",
          role: "admin",
        },
        session: {
          id: "test-session-id",
          userId: "test-admin-id",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
      };
    }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in?callbackURL=/admin");
  }

  const user = session.user;

  if (user.role !== "admin") {
    redirect("/");
  }

  return { user, session };
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return false;
  }

  return session.user.role === "admin";
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user || null;
}

