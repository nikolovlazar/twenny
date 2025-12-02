import { db } from "@/server/db";
import { customers } from "@/server/schema";
import { desc, count } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";

const PAGE_SIZE = 20;

export async function listCustomersAdmin(page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  // Run queries in parallel - INTENTIONALLY SLOW for demo
  // Missing indexes on created_at
  const [customersList, totalResult] = await Sentry.startSpan(
    {
      name: "listCustomersAdmin.query",
      op: "db.query",
      attributes: {
        "db.operation": "SELECT",
        "pagination.page": page,
        "pagination.offset": offset,
        "pagination.limit": PAGE_SIZE,
      },
    },
    async () =>
      await Promise.all([
        db
          .select()
          .from(customers)
          .orderBy(desc(customers.createdAt)) // NO INDEX = SLOW!
          .limit(PAGE_SIZE)
          .offset(offset),
        db.select({ count: count() }).from(customers),
      ])
  );

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    customers: customersList,
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
