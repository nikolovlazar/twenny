import { db } from "@/server/db";
import { ticketTypes, events, tickets } from "@/server/schema";
import { eq, sql } from "drizzle-orm";

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

  // Calculate quantitySold from tickets table
  const [soldCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(eq(tickets.ticketTypeId, id));

  return {
    ...ticketType,
    quantitySold: soldCount?.count || 0,
    event,
  };
}

