import { db } from "@/server/db";
import { events, venues, ticketTypes, tickets } from "@/server/schema";
import { eq, sql } from "drizzle-orm";

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

  // Calculate quantitySold for each ticket type from tickets table
  const ticketTypeIds = eventTicketTypes.map((tt) => tt.id);
  const soldCounts =
    ticketTypeIds.length > 0
      ? await db
          .select({
            ticketTypeId: tickets.ticketTypeId,
            count: sql<number>`count(*)::int`,
          })
          .from(tickets)
          .where(
            sql`${tickets.ticketTypeId} IN (${sql.join(
              ticketTypeIds.map((ttId) => sql`${ttId}`),
              sql`, `
            )})`
          )
          .groupBy(tickets.ticketTypeId)
      : [];

  const soldCountMap = new Map(
    soldCounts.map((sc) => [sc.ticketTypeId, sc.count])
  );

  const ticketTypesWithSold = eventTicketTypes.map((tt) => ({
    ...tt,
    quantitySold: soldCountMap.get(tt.id) || 0,
  }));

  return {
    ...event,
    venue,
    ticketTypes: ticketTypesWithSold,
  };
}

