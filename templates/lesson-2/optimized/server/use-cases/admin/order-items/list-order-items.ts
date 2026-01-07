import { db } from "@/server/db";
import { orderItems, orders, ticketTypes, events } from "@/server/schema";
import { desc, eq, count } from "drizzle-orm";
import { cacheGet, cacheSet } from "@/server/cache";

const PAGE_SIZE = 20;
const CACHE_TTL = 600; // 10 minutes

type OrderItemsResult = {
  orderItems: {
    id: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    ticketTypeName: string;
    orderId: string;
    orderNumber: string | null;
    eventTitle: string | null;
    createdAt: Date;
  }[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

async function fetchOrderItems(page: number): Promise<OrderItemsResult> {
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

export async function listOrderItems(page: number = 1) {
  const cacheKey = `order-items:page:${page}`;

  // Try to get from cache first (always check - helps track access patterns)
  const cached = await cacheGet<OrderItemsResult>(cacheKey);
  if (cached) {
    return cached;
  }

  // Cache miss - fetch from database
  const result = await fetchOrderItems(page);

  // Only cache the first page to avoid Redis bloat
  // cache.get still runs for all pages to track access patterns
  if (page === 1) {
    await cacheSet(cacheKey, result, { ttl: CACHE_TTL });
  }

  return result;
}
