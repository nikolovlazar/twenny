import { db } from "@/server/db";
import { orderItems, orders, ticketTypes, events } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function getOrderItem(id: string) {
  const [item] = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      ticketTypeId: orderItems.ticketTypeId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      subtotal: orderItems.subtotal,
      ticketTypeName: orderItems.ticketTypeName,
      createdAt: orderItems.createdAt,
      updatedAt: orderItems.updatedAt,
      orderNumber: orders.orderNumber,
      eventTitle: events.title,
    })
    .from(orderItems)
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(ticketTypes, eq(orderItems.ticketTypeId, ticketTypes.id))
    .leftJoin(events, eq(ticketTypes.eventId, events.id))
    .where(eq(orderItems.id, id));

  return item || null;
}

