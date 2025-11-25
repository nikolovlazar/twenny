import { db } from "@/server/db";
import { events } from "@/server/schema";

export interface CreateEventInput {
  venueId: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  startDate: Date;
  endDate?: Date;
  timezone: string;
  status: "draft" | "published" | "cancelled" | "completed";
  isPublished: number;
  publishedAt?: Date;
  totalCapacity: number;
  currency: string;
  bannerImageUrl?: string;
  thumbnailImageUrl?: string;
  category?: string;
  tags?: string;
  ageRestriction?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export async function createEvent(input: CreateEventInput) {
  const [event] = await db
    .insert(events)
    .values({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return event;
}

