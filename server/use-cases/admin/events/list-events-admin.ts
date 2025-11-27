import { db } from "@/server/db";
import { events, venues } from "@/server/schema";
import { desc, eq, count } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function listEventsAdmin(page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  // Run queries in parallel
  const [eventsList, totalResult] = await Promise.all([
    db
      .select({
        id: events.id,
        title: events.title,
        slug: events.slug,
        startDate: events.startDate,
        endDate: events.endDate,
        status: events.status,
        isPublished: events.isPublished,
        totalCapacity: events.totalCapacity,
        category: events.category,
        venueName: venues.name,
        venueId: events.venueId,
        createdAt: events.createdAt,
      })
      .from(events)
      .leftJoin(venues, eq(events.venueId, venues.id))
      .orderBy(desc(events.createdAt)) // No index on createdAt - will be slow!
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(events),
  ]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    events: eventsList,
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

