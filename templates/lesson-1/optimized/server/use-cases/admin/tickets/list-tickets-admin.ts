import { db } from "@/server/db";
import { tickets, events, customers } from "@/server/schema";
import { desc, eq, count, sql } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";
import { encodeCursor, buildCursorWhere } from "@/server/lib/cursor-helpers";

const PAGE_SIZE = 20;

// Cache the count for 5 minutes to avoid slow COUNT(*) queries
let cachedCount: { value: number; timestamp: number } | null = null;
const COUNT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getTicketCount(): Promise<number> {
  const now = Date.now();

  if (cachedCount && (now - cachedCount.timestamp) < COUNT_CACHE_TTL) {
    return cachedCount.value;
  }

  // Use pg_class for instant approximate count (accurate enough for pagination)
  const result = await db.execute<{ estimate: number }>(sql`
    SELECT reltuples::bigint AS estimate
    FROM pg_class
    WHERE relname = 'tickets'
  `);

  const estimate = Number(result[0]?.estimate || 0);

  cachedCount = {
    value: estimate,
    timestamp: now,
  };

  return estimate;
}

export async function listTicketsAdmin(
  cursor?: string,
  page?: number,
  prevCursor?: string,
  isJump?: boolean
) {
  const currentPage = page || 1;

  // Get total count (cached/estimated) - fast!
  const total = await getTicketCount();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // If jumping to arbitrary page, use offset-based pagination
  // This demonstrates the performance hit for demo purposes
  if (isJump && page) {
    const offset = (page - 1) * PAGE_SIZE;

    // Build query first to get SQL for instrumentation
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
      .orderBy(desc(tickets.createdAt), desc(tickets.id))
      .limit(PAGE_SIZE)
      .offset(offset); // OFFSET for jumps - shows performance degradation

    const ticketsSql = ticketsQuery.toSQL();

    const ticketsList = await Sentry.startSpan(
      {
        name: ticketsSql.sql,
        op: "db.query",
        attributes: {
          "db.system": "postgresql",
          "query.module": "admin.tickets",
          "query.action": "list",
          "query.feature": "paginate",
          "query.optimized": false, // Offset jump is slow even in optimized mode
          "query.pagination.type": "offset-jump",
          "query.pagination.page": currentPage,
          "query.pagination.offset": offset,
          "query.pagination.limit": PAGE_SIZE,
        },
      },
      () => ticketsQuery
    );

    const hasMore = currentPage < totalPages;

    return {
      tickets: ticketsList,
      pagination: {
        nextCursor: hasMore && ticketsList.length > 0 ? encodeCursor(ticketsList[ticketsList.length - 1]) : null,
        prevCursor: null,
        currentCursor: null,
        currentPage,
        hasMore,
        total,
        totalPages,
      },
    };
  }

  // Normal cursor-based pagination (fast)
  const cursorWhere = buildCursorWhere(cursor, tickets);

  // Build query first to get SQL for instrumentation
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
    .where(cursorWhere)
    .orderBy(desc(tickets.createdAt), desc(tickets.id)) // Composite sort with index!
    .limit(PAGE_SIZE + 1); // +1 to check for more results

  const ticketsSql = ticketsQuery.toSQL();

  const ticketsList = await Sentry.startSpan(
    {
      name: ticketsSql.sql,
      op: "db.query",
        attributes: {
          "db.system": "postgresql",
          "query.module": "admin.tickets",
          "query.action": "list",
          "query.feature": "paginate",
          "query.optimized": true, // 🎯 KEY FLAG FOR FILTERING IN SENTRY
          "query.pagination.type": "cursor",
          "query.pagination.cursor": cursor || "first_page",
          "query.pagination.page": currentPage,
          "query.pagination.limit": PAGE_SIZE,
        },
    },
    () => ticketsQuery
  );

  const hasMore = ticketsList.length > PAGE_SIZE;
  const items = ticketsList.slice(0, PAGE_SIZE);

  return {
    tickets: items,
    pagination: {
      nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null,
      prevCursor: prevCursor || null, // Pass through for previous navigation
      currentCursor: cursor || null, // Current cursor for constructing prev link
      currentPage,
      hasMore,
      total,
      totalPages,
    },
  };
}

