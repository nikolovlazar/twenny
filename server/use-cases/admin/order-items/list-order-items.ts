import { db } from "@/server/db";
import { orderItems, orders, ticketTypes, events } from "@/server/schema";
import { desc, eq } from "drizzle-orm";

export async function listOrderItems() {
  const allOrderItems = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      subtotal: orderItems.subtotal,
      ticketTypeName: orderItems.ticketTypeName,
      orderId: orderItems.orderId,
      orderNumber: orders.orderNumber,
      eventTitle: events.title,
      createdAt: orderItems.createdAt,
    })
    .from(orderItems)
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(ticketTypes, eq(orderItems.ticketTypeId, ticketTypes.id))
    .leftJoin(events, eq(ticketTypes.eventId, events.id))
    .orderBy(desc(orderItems.createdAt));

  return allOrderItems;
}

