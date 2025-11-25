import { db } from "@/server/db";
import { ticketTypes, events } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function getTicketType(id: string) {
  const [ticketType] = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.id, id));

  if (!ticketType) return null;

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, ticketType.eventId));

  return {
    ...ticketType,
    event,
  };
}

