import { db } from "@/server/db";
import { ticketTypes } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function deleteTicketType(id: string) {
  await db.delete(ticketTypes).where(eq(ticketTypes.id, id));
}

