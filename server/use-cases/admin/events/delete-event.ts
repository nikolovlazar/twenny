import { db } from "@/server/db";
import { events } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function deleteEvent(id: string) {
  await db.delete(events).where(eq(events.id, id));
}

