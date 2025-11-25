import { db } from "@/server/db";
import { orders, orderItems, customers, ticketTypes, events } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function getOrderAdmin(id: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id));

  if (!order) return null;

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, order.customerId));

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      subtotal: orderItems.subtotal,
      ticketTypeName: orderItems.ticketTypeName,
      ticketTypeId: orderItems.ticketTypeId,
      eventTitle: events.title,
    })
    .from(orderItems)
    .leftJoin(ticketTypes, eq(orderItems.ticketTypeId, ticketTypes.id))
    .leftJoin(events, eq(ticketTypes.eventId, events.id))
    .where(eq(orderItems.orderId, id));

  return {
    ...order,
    customer,
    items,
  };
}

