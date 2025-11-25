import { db } from "../../db";
import * as schema from "../../schema";
import { eq } from "drizzle-orm";

export interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  currency: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  completedAt: Date | null;
  createdAt: Date;
  tickets: Array<{
    id: string;
    ticketCode: string;
    eventTitle: string;
    ticketTypeName: string;
    price: string;
    status: string;
  }>;
}

/**
 * Get order details by order ID
 *
 * MVP Issues:
 * - N+1 query for tickets
 * - No caching
 */
export async function getOrderDetails(
  orderId: string
): Promise<OrderDetails | null> {
  const orders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .limit(1);

  if (orders.length === 0) {
    return null;
  }

  const order = orders[0];

  // Fetch tickets for this order
  const tickets = await db
    .select({
      id: schema.tickets.id,
      ticketCode: schema.tickets.ticketCode,
      eventTitle: schema.tickets.eventTitle,
      ticketTypeName: schema.tickets.ticketTypeName,
      price: schema.tickets.price,
      status: schema.tickets.status,
    })
    .from(schema.tickets)
    .where(eq(schema.tickets.orderId, order.id));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    currency: order.currency,
    customerEmail: order.customerEmail,
    customerFirstName: order.customerFirstName,
    customerLastName: order.customerLastName,
    completedAt: order.completedAt,
    createdAt: order.createdAt,
    tickets: tickets,
  };
}

