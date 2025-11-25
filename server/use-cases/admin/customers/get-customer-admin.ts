import { db } from "@/server/db";
import { customers, orders } from "@/server/schema";
import { eq, desc } from "drizzle-orm";

export async function getCustomerAdmin(id: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id));

  if (!customer) return null;

  const customerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, id))
    .orderBy(desc(orders.createdAt));

  return {
    ...customer,
    orders: customerOrders,
  };
}

