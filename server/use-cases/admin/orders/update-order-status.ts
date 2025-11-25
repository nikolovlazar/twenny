import { db } from "@/server/db";
import { orders } from "@/server/schema";
import { eq } from "drizzle-orm";

export interface UpdateOrderStatusInput {
  status?: "pending" | "completed" | "cancelled" | "refunded";
  paymentStatus?: "pending" | "completed" | "failed" | "refunded";
}

export async function updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
  const updateData: any = {
    ...input,
    updatedAt: new Date(),
  };

  if (input.status === "completed" && !updateData.completedAt) {
    updateData.completedAt = new Date();
  }

  if (input.status === "cancelled" && !updateData.cancelledAt) {
    updateData.cancelledAt = new Date();
  }

  const [order] = await db
    .update(orders)
    .set(updateData)
    .where(eq(orders.id, id))
    .returning();

  return order;
}

