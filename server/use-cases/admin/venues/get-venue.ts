import { db } from "@/server/db";
import { venues } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function getVenue(id: string) {
  const [venue] = await db.select().from(venues).where(eq(venues.id, id));
  return venue || null;
}

