import { db } from "@/server/db";
import { ticketTypes } from "@/server/schema";
import { eq } from "drizzle-orm";
import { CreateTicketTypeInput } from "./create-ticket-type";

export async function updateTicketType(id: string, input: Partial<CreateTicketTypeInput>) {
  const [ticketType] = await db
    .update(ticketTypes)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(ticketTypes.id, id))
    .returning();
  return ticketType;
}

