import { db } from "@/server/db";
import { orderItems } from "@/server/schema";
import { eq } from "drizzle-orm";

export interface UpdateOrderItemInput {
  quantity?: number;
  unitPrice?: string;
  subtotal?: string;
}

export async function updateOrderItem(id: string, input: UpdateOrderItemInput) {
  const [item] = await db
    .update(orderItems)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(orderItems.id, id))
    .returning();
  return item;
}

