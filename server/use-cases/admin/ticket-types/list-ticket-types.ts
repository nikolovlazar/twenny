import { db } from "@/server/db";
import { ticketTypes, events } from "@/server/schema";
import { desc, eq, count } from "drizzle-orm";

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
        quantitySold: ticketTypes.quantitySold,
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

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    ticketTypes: ticketTypesList,
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

