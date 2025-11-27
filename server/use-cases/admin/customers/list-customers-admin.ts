import { db } from "@/server/db";
import { customers } from "@/server/schema";
import { desc, count } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function listCustomersAdmin(page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  // Run queries in parallel
  const [customersList, totalResult] = await Promise.all([
    db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(customers),
  ]);

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
