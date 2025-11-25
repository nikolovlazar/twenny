import { db } from "@/server/db";
import { tickets } from "@/server/schema";
import { eq } from "drizzle-orm";

export interface UpdateTicketInput {
  status?: "valid" | "used" | "cancelled" | "refunded";
  attendeeFirstName?: string;
  attendeeLastName?: string;
  attendeeEmail?: string;
  isCheckedIn?: number;
  checkedInAt?: Date;
  checkedInBy?: string;
}

export async function updateTicket(id: string, input: UpdateTicketInput) {
  const [ticket] = await db
    .update(tickets)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning();
  return ticket;
}

