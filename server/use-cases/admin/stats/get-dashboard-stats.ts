import { db } from "@/server/db";
import { events, orders, customers, tickets } from "@/server/schema";
import { sql, eq } from "drizzle-orm";

export async function getDashboardStats() {
  // Total events count
  const [{ count: totalEvents }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(events);

  // Total orders count
  const [{ count: totalOrders }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders);

  // Total customers count
  const [{ count: totalCustomers }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(customers);

  // Total tickets count
  const [{ count: totalTickets }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets);

  // Total revenue (completed orders only)
  const [{ revenue }] = await db
    .select({
      revenue: sql<string>`COALESCE(SUM(${orders.total})::text, '0')`,
    })
    .from(orders)
    .where(eq(orders.status, "completed"));

  // Published events count
  const [{ count: publishedEvents }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(events)
    .where(eq(events.isPublished, 1));

  // Checked in tickets
  const [{ count: checkedInTickets }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(eq(tickets.isCheckedIn, 1));

  return {
    totalEvents,
    totalOrders,
    totalCustomers,
    totalTickets,
    totalRevenue: revenue,
    publishedEvents,
    checkedInTickets,
  };
}

