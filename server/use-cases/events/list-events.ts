import { db } from "../../db";
import * as schema from "../../schema";
import { eq, and, gte, lte, like, or, desc, SQL } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";

export interface ListEventsParams {
  search?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface ListEventsResult {
  events: Array<{
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    startDate: Date;
    endDate: Date | null;
    category: string | null;
    thumbnailImageUrl: string | null;
    venueName: string;
    venueCity: string | null;
    minPrice: string | null;
  }>;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * List events with optional filtering and pagination
 *
 * MVP Issues:
 * - No indexes on startDate, category (intentional)
 * - N+1 query pattern for venue data (will be fixed later)
 * - No caching layer
 */
export async function listEvents(
  params: ListEventsParams = {}
): Promise<ListEventsResult> {
  const {
    search,
    category,
    dateFrom,
    dateTo,
    page = 1,
    limit = 12,
  } = params;

  // Build WHERE conditions
  const conditions: SQL[] = [
    eq(schema.events.isPublished, 1),
    eq(schema.events.status, "published"),
  ];

  if (search) {
    conditions.push(
      or(
        like(schema.events.title, `%${search}%`),
        like(schema.events.description, `%${search}%`)
      )!
    );
  }

  if (category) {
    conditions.push(eq(schema.events.category, category));
  }

  if (dateFrom) {
    conditions.push(gte(schema.events.startDate, dateFrom));
  }

  if (dateTo) {
    conditions.push(lte(schema.events.startDate, dateTo));
  }

  // Calculate offset
  const offset = (page - 1) * limit;

  // Fetch events with venue information - INTENTIONALLY SLOW for demo
  // Missing indexes on startDate, status, category
  const eventsWithVenues = await Sentry.startSpan(
    {
      name: "listEvents.query",
      op: "db.query",
      attributes: {
        "db.operation": "SELECT",
        "pagination.page": page,
        "pagination.offset": offset,
        "pagination.limit": limit,
        "filter.search": search,
        "filter.category": category,
      },
    },
    async () =>
      await db
        .select({
          id: schema.events.id,
          title: schema.events.title,
          slug: schema.events.slug,
          shortDescription: schema.events.shortDescription,
          startDate: schema.events.startDate,
          endDate: schema.events.endDate,
          category: schema.events.category,
          thumbnailImageUrl: schema.events.thumbnailImageUrl,
          venueId: schema.events.venueId,
        })
        .from(schema.events)
        .where(and(...conditions))
        .orderBy(desc(schema.events.startDate)) // NO INDEX = SLOW!
        .limit(limit)
        .offset(offset) // OFFSET without index = SLOW!
  );

  // N+1 query pattern (intentional for MVP)
  // Fetch venue data for each event
  const eventsWithDetails = await Promise.all(
    eventsWithVenues.map(async (event) => {
      const venue = await db
        .select({
          name: schema.venues.name,
          city: schema.venues.city,
        })
        .from(schema.venues)
        .where(eq(schema.venues.id, event.venueId))
        .limit(1);

      // Get minimum ticket price for the event
      const minPriceResult = await db
        .select({
          price: schema.ticketTypes.price,
        })
        .from(schema.ticketTypes)
        .where(
          and(
            eq(schema.ticketTypes.eventId, event.id),
            eq(schema.ticketTypes.isActive, 1)
          )
        )
        .orderBy(schema.ticketTypes.price)
        .limit(1);

      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        shortDescription: event.shortDescription,
        startDate: event.startDate,
        endDate: event.endDate,
        category: event.category,
        thumbnailImageUrl: event.thumbnailImageUrl,
        venueName: venue[0]?.name || "Unknown Venue",
        venueCity: venue[0]?.city || null,
        minPrice: minPriceResult[0]?.price || null,
      };
    })
  );

  // Get total count for pagination
  const countResult = await db
    .select({
      count: schema.events.id,
    })
    .from(schema.events)
    .where(and(...conditions));

  const totalCount = countResult.length;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    events: eventsWithDetails,
    totalCount,
    page,
    limit,
    totalPages,
  };
}

