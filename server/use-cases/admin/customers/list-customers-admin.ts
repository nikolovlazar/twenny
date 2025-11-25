import { db } from "@/server/db";
import { customers } from "@/server/schema";
import { desc } from "drizzle-orm";

export async function listCustomersAdmin() {
  const allCustomers = await db
    .select()
    .from(customers)
    .orderBy(desc(customers.createdAt));

  return allCustomers;
}

