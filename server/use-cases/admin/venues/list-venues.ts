import { db } from "@/server/db";
import { venues } from "@/server/schema";
import { desc } from "drizzle-orm";

export async function listVenues() {
  const allVenues = await db.select().from(venues).orderBy(desc(venues.createdAt));
  return allVenues;
}

