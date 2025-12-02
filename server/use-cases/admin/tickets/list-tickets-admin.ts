import { db } from "@/server/db";
import { tickets, events, customers } from "@/server/schema";
import { desc, eq, count } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";

const PAGE_SIZE = 20;

export async function listTicketsAdmin(page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  // Run queries in parallel - INTENTIONALLY SLOW for demo
  // Missing indexes on created_at, status, and FK columns
  const [ticketsList, totalResult] = await Sentry.startSpan(
    {
      name: "listTicketsAdmin.query",
      op: "db.query",
      attributes: {
        "db.operation": "SELECT",
        "pagination.type": "offset",
        "pagination.page": page,
        "pagination.offset": offset,
        "pagination.limit": PAGE_SIZE,
        "optimized": "false", // 🎯 KEY FLAG FOR FILTERING IN SENTRY
      },
    },
    async () =>
      await Promise.all([
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
          .orderBy(desc(tickets.createdAt)) // NO INDEX = SLOW!
          .limit(PAGE_SIZE)
          .offset(offset), // OFFSET on millions of rows = VERY SLOW!
        db.select({ count: count() }).from(tickets),
      ])
  );

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

