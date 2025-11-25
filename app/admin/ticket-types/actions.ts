"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/services/admin-guard";
import { createTicketType } from "@/server/use-cases/admin/ticket-types/create-ticket-type";
import { updateTicketType } from "@/server/use-cases/admin/ticket-types/update-ticket-type";
import { deleteTicketType } from "@/server/use-cases/admin/ticket-types/delete-ticket-type";
import { revalidatePath } from "next/cache";

export async function createTicketTypeAction(_prevState: any, formData: FormData) {
  await requireAdmin();

  try {
    const ticketType = await createTicketType({
      eventId: formData.get("eventId") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string | undefined,
      price: formData.get("price") as string,
      quantity: parseInt(formData.get("quantity") as string),
      saleStartDate: formData.get("saleStartDate")
        ? new Date(formData.get("saleStartDate") as string)
        : undefined,
      saleEndDate: formData.get("saleEndDate")
        ? new Date(formData.get("saleEndDate") as string)
        : undefined,
      minQuantityPerOrder: formData.get("minQuantityPerOrder")
        ? parseInt(formData.get("minQuantityPerOrder") as string)
        : undefined,
      maxQuantityPerOrder: formData.get("maxQuantityPerOrder")
        ? parseInt(formData.get("maxQuantityPerOrder") as string)
        : undefined,
      sortOrder: formData.get("sortOrder")
        ? parseInt(formData.get("sortOrder") as string)
        : undefined,
      isActive: parseInt(formData.get("isActive") as string),
    });

    revalidatePath("/admin/ticket-types");
    redirect(`/admin/ticket-types/${ticketType.id}`);
  } catch (error) {
    return { error: "Failed to create ticket type" };
  }
}

export async function updateTicketTypeAction(
  id: string,
  _prevState: any,
  formData: FormData
) {
  await requireAdmin();

  try {
    await updateTicketType(id, {
      eventId: formData.get("eventId") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string | undefined,
      price: formData.get("price") as string,
      quantity: parseInt(formData.get("quantity") as string),
      saleStartDate: formData.get("saleStartDate")
        ? new Date(formData.get("saleStartDate") as string)
        : undefined,
      saleEndDate: formData.get("saleEndDate")
        ? new Date(formData.get("saleEndDate") as string)
        : undefined,
      minQuantityPerOrder: formData.get("minQuantityPerOrder")
        ? parseInt(formData.get("minQuantityPerOrder") as string)
        : undefined,
      maxQuantityPerOrder: formData.get("maxQuantityPerOrder")
        ? parseInt(formData.get("maxQuantityPerOrder") as string)
        : undefined,
      sortOrder: formData.get("sortOrder")
        ? parseInt(formData.get("sortOrder") as string)
        : undefined,
      isActive: parseInt(formData.get("isActive") as string),
    });

    revalidatePath("/admin/ticket-types");
    revalidatePath(`/admin/ticket-types/${id}`);
    redirect(`/admin/ticket-types/${id}`);
  } catch (error) {
    return { error: "Failed to update ticket type" };
  }
}

export async function deleteTicketTypeAction(id: string) {
  await requireAdmin();

  try {
    await deleteTicketType(id);
    revalidatePath("/admin/ticket-types");
    redirect("/admin/ticket-types");
  } catch (error) {
    throw new Error("Failed to delete ticket type");
  }
}

