"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/services/admin-guard";
import { updateOrderStatus } from "@/server/use-cases/admin/orders/update-order-status";
import { revalidatePath } from "next/cache";

export async function updateOrderAction(
  id: string,
  _prevState: any,
  formData: FormData
) {
  await requireAdmin();

  try {
    await updateOrderStatus(id, {
      status: formData.get("status") as any,
      paymentStatus: formData.get("paymentStatus") as any,
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    redirect(`/admin/orders/${id}`);
  } catch (error) {
    return { error: "Failed to update order" };
  }
}

