import { db } from "@/server/db";
import { tickets, events, customers } from "@/server/schema";
import { desc, eq } from "drizzle-orm";

export async function listTicketsAdmin() {
  const allTickets = await db
    .select({
      id: tickets.id,
      ticketCode: tickets.ticketCode,
      status: tickets.status,
      eventTitle: tickets.eventTitle,
      ticketTypeName: tickets.ticketTypeName,
      price: tickets.price,
      isCheckedIn: tickets.isCheckedIn,
      checkedInAt: tickets.checkedInAt,
      attendeeEmail: tickets.attendeeEmail,
      customerEmail: customers.email,
      eventId: tickets.eventId,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .leftJoin(events, eq(tickets.eventId, events.id))
    .leftJoin(customers, eq(tickets.customerId, customers.id))
    .orderBy(desc(tickets.createdAt));

  return allTickets;
}

