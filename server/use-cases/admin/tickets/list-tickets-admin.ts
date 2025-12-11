import { db } from "@/server/db";
import { tickets, events, customers } from "@/server/schema";
import { desc, eq, count } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";

const PAGE_SIZE = 20;

export async function listTicketsAdmin(page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  // Build queries first to get SQL for instrumentation
  const ticketsQuery = db
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
    .offset(offset); // OFFSET on millions of rows = VERY SLOW!

  const countQuery = db.select({ count: count() }).from(tickets);

  // Get SQL strings for Sentry instrumentation
  const ticketsSql = ticketsQuery.toSQL();
  const countSql = countQuery.toSQL();

  // Run queries in parallel - INTENTIONALLY SLOW for demo
  // Missing indexes on created_at, status, and FK columns
  const [ticketsList, totalResult] = await Promise.all([
    Sentry.startSpan(
      {
        name: ticketsSql.sql,
        op: "db.query",
        attributes: {
          "db.system": "postgresql",
          "query.module": "admin.tickets",
          "query.action": "list",
          "query.feature": "paginate",
          "query.optimized": false, // 🎯 KEY FLAG FOR FILTERING IN SENTRY
          "query.pagination.type": "offset",
          "query.pagination.page": page,
          "query.pagination.offset": offset,
          "query.pagination.limit": PAGE_SIZE,
        },
      },
      () => ticketsQuery
    ),
    Sentry.startSpan(
      {
        name: countSql.sql,
        op: "db.query",
        attributes: {
          "db.system": "postgresql",
          "query.module": "admin.tickets",
          "query.action": "count",
          "query.feature": "paginate",
        },
      },
      () => countQuery
    ),
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

