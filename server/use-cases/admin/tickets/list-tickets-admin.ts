import { db } from "@/server/db";
import { tickets, events, customers } from "@/server/schema";
import { desc, eq, count } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function listTicketsAdmin(page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  // Run queries in parallel
  const [ticketsList, totalResult] = await Promise.all([
    db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        status: tickets.status,
        eventTitle: tickets.eventTitle,
        ticketTypeName: tickets.ticketTypeName,
        price: tickets.price,
        isCheckedIn: tickets.isCheckedIn,
        checkedInAt: tickets.checkedInAt,
        attendeeEmail: tickets.attendeeEmail,
        customerEmail: customers.email,
        eventId: tickets.eventId,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .leftJoin(events, eq(tickets.eventId, events.id))
      .leftJoin(customers, eq(tickets.customerId, customers.id))
      .orderBy(desc(tickets.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(tickets),
  ]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    tickets: ticketsList,
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
