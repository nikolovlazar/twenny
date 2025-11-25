import { db } from "@/server/db";
import { venues } from "@/server/schema";
import { eq } from "drizzle-orm";
import { CreateVenueInput } from "./create-venue";

export async function updateVenue(id: string, input: Partial<CreateVenueInput>) {
  const [venue] = await db
    .update(venues)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(venues.id, id))
    .returning();
  return venue;
}

