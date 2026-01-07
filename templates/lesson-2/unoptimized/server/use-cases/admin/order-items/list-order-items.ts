import { db } from "@/server/db";
import { orderItems, orders, ticketTypes, events } from "@/server/schema";
import { desc, eq, count } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function listOrderItems(page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  // Run queries in parallel
  const [orderItemsList, totalResult] = await Promise.all([
    db
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
      .orderBy(desc(orderItems.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(orderItems),
  ]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    orderItems: orderItemsList,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
