import { db } from "@/server/db";
import { ticketTypes, events, tickets } from "@/server/schema";
import { desc, eq, count, sql } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function listTicketTypes(page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  // Run queries in parallel
  const [ticketTypesList, totalResult] = await Promise.all([
    db
      .select({
        id: ticketTypes.id,
        name: ticketTypes.name,
        price: ticketTypes.price,
        quantity: ticketTypes.quantity,
        isActive: ticketTypes.isActive,
        eventId: ticketTypes.eventId,
        eventTitle: events.title,
        createdAt: ticketTypes.createdAt,
      })
      .from(ticketTypes)
      .leftJoin(events, eq(ticketTypes.eventId, events.id))
      .orderBy(desc(ticketTypes.createdAt)) // No index on createdAt - will be slow!
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(ticketTypes),
  ]);

  // Get sold counts for these ticket types
  const ticketTypeIds = ticketTypesList.map((tt) => tt.id);
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
              ticketTypeIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
          .groupBy(tickets.ticketTypeId)
      : [];

  const soldCountMap = new Map(
    soldCounts.map((sc) => [sc.ticketTypeId, sc.count])
  );

  // Add quantitySold to each ticket type
  const ticketTypesWithSold = ticketTypesList.map((tt) => ({
    ...tt,
    quantitySold: soldCountMap.get(tt.id) || 0,
  }));

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    ticketTypes: ticketTypesWithSold,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

