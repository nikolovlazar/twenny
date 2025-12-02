import { config } from "dotenv";
config({ quiet: true });

import { db } from "../server/db";
import { user } from "../auth-schema";
import { eq } from "drizzle-orm";

/**
 * Script to update an existing user's role to admin based on ADMIN_EMAIL
 * Usage: npx tsx scripts/set-admin.ts
 */
async function setAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL environment variable is not set");
    process.exit(1);
  }

  console.log(`🔍 Looking for user with email: ${adminEmail}`);

  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, adminEmail),
  });

  if (!existingUser) {
    console.error(`❌ No user found with email: ${adminEmail}`);
    console.log("Please sign in with this email first, then run this script again.");
    process.exit(1);
  }

  if (existingUser.role === "admin") {
    console.log(`✅ User ${adminEmail} is already an admin`);
    process.exit(0);
  }

  console.log(`🔧 Updating user ${adminEmail} to admin...`);

  await db.update(user).set({ role: "admin" }).where(eq(user.email, adminEmail));

  console.log(`✅ Successfully updated ${adminEmail} to admin role!`);
  process.exit(0);
}

setAdmin();

