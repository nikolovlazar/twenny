"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/services/admin-guard";
import { updateTicket } from "@/server/use-cases/admin/tickets/update-ticket";
import { checkInTicket } from "@/server/use-cases/admin/tickets/check-in-ticket";
import { revalidatePath } from "next/cache";

export async function updateTicketAction(
  id: string,
  _prevState: any,
  formData: FormData
) {
  await requireAdmin();

  try {
    await updateTicket(id, {
      status: formData.get("status") as any,
      attendeeFirstName: formData.get("attendeeFirstName") as string | undefined,
      attendeeLastName: formData.get("attendeeLastName") as string | undefined,
      attendeeEmail: formData.get("attendeeEmail") as string | undefined,
    });

    revalidatePath("/admin/tickets");
    revalidatePath(`/admin/tickets/${id}`);
    redirect(`/admin/tickets/${id}`);
  } catch (error) {
    return { error: "Failed to update ticket" };
  }
}

export async function checkInTicketAction(id: string, _prevState: any) {
  const { user } = await requireAdmin();

  try {
    await checkInTicket(id, user.email || user.name || "Admin");
    revalidatePath("/admin/tickets");
    revalidatePath(`/admin/tickets/${id}`);
    redirect(`/admin/tickets/${id}`);
  } catch (error) {
    return { error: "Failed to check in ticket" };
  }
}

