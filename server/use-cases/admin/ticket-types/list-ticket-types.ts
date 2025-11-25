import { db } from "@/server/db";
import { ticketTypes, events } from "@/server/schema";
import { desc, eq } from "drizzle-orm";

export async function listTicketTypes() {
  const allTicketTypes = await db
    .select({
      id: ticketTypes.id,
      name: ticketTypes.name,
      price: ticketTypes.price,
      quantity: ticketTypes.quantity,
      quantitySold: ticketTypes.quantitySold,
      isActive: ticketTypes.isActive,
      eventId: ticketTypes.eventId,
      eventTitle: events.title,
      createdAt: ticketTypes.createdAt,
    })
    .from(ticketTypes)
    .leftJoin(events, eq(ticketTypes.eventId, events.id))
    .orderBy(desc(ticketTypes.createdAt));

  return allTicketTypes;
}

