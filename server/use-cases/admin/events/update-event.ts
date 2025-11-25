import { db } from "@/server/db";
import { events } from "@/server/schema";
import { eq } from "drizzle-orm";
import { CreateEventInput } from "./create-event";

export async function updateEvent(id: string, input: Partial<CreateEventInput>) {
  const [event] = await db
    .update(events)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();
  return event;
}

