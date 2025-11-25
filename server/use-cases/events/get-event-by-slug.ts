import { db } from "../../db";
import * as schema from "../../schema";
import { eq, and } from "drizzle-orm";

export interface EventDetails {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  startDate: Date;
  endDate: Date | null;
  timezone: string;
  status: string;
  category: string | null;
  tags: string | null;
  ageRestriction: string | null;
  bannerImageUrl: string | null;
  thumbnailImageUrl: string | null;
  venue: {
    id: string;
    name: string;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    isVirtual: number;
  };
}

/**
 * Get event details by slug
 *
 * MVP Issues:
 * - No caching layer
 * - Could optimize with a single JOIN query instead of separate queries
 */
export async function getEventBySlug(
  slug: string
): Promise<EventDetails | null> {
  // Fetch event
  const events = await db
    .select()
    .from(schema.events)
    .where(
      and(
        eq(schema.events.slug, slug),
        eq(schema.events.isPublished, 1),
        eq(schema.events.status, "published")
      )
    )
    .limit(1);

  if (events.length === 0) {
    return null;
  }

  const event = events[0];

  // Fetch venue
  const venues = await db
    .select()
    .from(schema.venues)
    .where(eq(schema.venues.id, event.venueId))
    .limit(1);

  if (venues.length === 0) {
    return null;
  }

  const venue = venues[0];

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    shortDescription: event.shortDescription,
    startDate: event.startDate,
    endDate: event.endDate,
    timezone: event.timezone,
    status: event.status,
    category: event.category,
    tags: event.tags,
    ageRestriction: event.ageRestriction,
    bannerImageUrl: event.bannerImageUrl,
    thumbnailImageUrl: event.thumbnailImageUrl,
    venue: {
      id: venue.id,
      name: venue.name,
      addressLine1: venue.addressLine1,
      addressLine2: venue.addressLine2,
      city: venue.city,
      state: venue.state,
      country: venue.country,
      postalCode: venue.postalCode,
      isVirtual: venue.isVirtual,
    },
  };
}

