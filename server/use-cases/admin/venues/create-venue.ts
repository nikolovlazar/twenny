import { db } from "@/server/db";
import { venues } from "@/server/schema";

export interface CreateVenueInput {
  name: string;
  description?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  capacity?: number;
  timezone: string;
  isVirtual: number;
  phone?: string;
  email?: string;
  website?: string;
  imageUrl?: string;
}

export async function createVenue(input: CreateVenueInput) {
  const [venue] = await db
    .insert(venues)
    .values({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return venue;
}

