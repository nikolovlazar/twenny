import { db } from "@/server/db";
import { tickets, events, customers, orders } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function getTicketAdmin(id: string) {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, id));

  if (!ticket) return null;

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, ticket.eventId));

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, ticket.customerId));

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, ticket.orderId));

  return {
    ...ticket,
    event,
    customer,
    order,
  };
}

