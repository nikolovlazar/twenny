import { db } from "@/server/db";
import { orders, customers } from "@/server/schema";
import { desc, eq, count } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";

const PAGE_SIZE = 20;

export async function listOrdersAdmin(page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  // Run queries in parallel - INTENTIONALLY SLOW for demo
  // Missing indexes on created_at, status, payment_status
  const [ordersList, totalResult] = await Sentry.startSpan(
    {
      name: "listOrdersAdmin.query",
      op: "db.query",
      attributes: {
        "db.operation": "SELECT",
        "pagination.type": "offset",
        "pagination.page": page,
        "pagination.offset": offset,
        "pagination.limit": PAGE_SIZE,
        "optimized": "false",
      },
    },
    async () =>
      await Promise.all([
        db
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
          .orderBy(desc(orders.createdAt)) // NO INDEX = SLOW!
          .limit(PAGE_SIZE)
          .offset(offset), // OFFSET on millions of rows = VERY SLOW!
        db.select({ count: count() }).from(orders),
      ])
  );

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    orders: ordersList,
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
