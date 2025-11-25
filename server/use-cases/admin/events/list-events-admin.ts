import { db } from "@/server/db";
import { events, venues } from "@/server/schema";
import { desc, eq } from "drizzle-orm";

export async function listEventsAdmin() {
  const allEvents = await db
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
    .orderBy(desc(events.createdAt));

  return allEvents;
}

