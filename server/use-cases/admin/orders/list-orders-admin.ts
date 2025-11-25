import { db } from "@/server/db";
import { orders, customers } from "@/server/schema";
import { desc, eq } from "drizzle-orm";

export async function listOrdersAdmin() {
  const allOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      total: orders.total,
      currency: orders.currency,
      customerEmail: orders.customerEmail,
      customerFirstName: orders.customerFirstName,
      customerLastName: orders.customerLastName,
      customerId: orders.customerId,
      createdAt: orders.createdAt,
      completedAt: orders.completedAt,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .orderBy(desc(orders.createdAt));

  return allOrders;
}

