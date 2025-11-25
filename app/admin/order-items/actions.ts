"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/services/admin-guard";
import { updateOrderItem } from "@/server/use-cases/admin/order-items/update-order-item";
import { revalidatePath } from "next/cache";

export async function updateOrderItemAction(
  id: string,
  _prevState: any,
  formData: FormData
) {
  await requireAdmin();

  try {
    await updateOrderItem(id, {
      quantity: parseInt(formData.get("quantity") as string),
      unitPrice: formData.get("unitPrice") as string,
      subtotal: formData.get("subtotal") as string,
    });

    revalidatePath("/admin/order-items");
    revalidatePath(`/admin/order-items/${id}`);
    redirect(`/admin/order-items/${id}`);
  } catch (error) {
    return { error: "Failed to update order item" };
  }
}

