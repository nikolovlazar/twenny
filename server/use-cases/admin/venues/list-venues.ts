import { db } from "@/server/db";
import { venues } from "@/server/schema";
import { desc, count } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function listVenues(page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  // Run queries in parallel
  const [venuesList, totalResult] = await Promise.all([
    db
      .select()
      .from(venues)
      .orderBy(desc(venues.createdAt)) // No index on createdAt - will be slow!
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(venues),
  ]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    venues: venuesList,
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

