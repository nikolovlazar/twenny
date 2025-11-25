import { db } from "@/server/db";
import { venues } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function deleteVenue(id: string) {
  await db.delete(venues).where(eq(venues.id, id));
}

