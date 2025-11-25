import { db } from "@/server/db";
import { events, venues, ticketTypes } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function getEventAdmin(id: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id));

  if (!event) return null;

  const [venue] = await db
    .select()
    .from(venues)
    .where(eq(venues.id, event.venueId));

  const eventTicketTypes = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, id));

  return {
    ...event,
    venue,
    ticketTypes: eventTicketTypes,
  };
}

