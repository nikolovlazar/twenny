"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/services/admin-guard";
import { updateCustomer } from "@/server/use-cases/admin/customers/update-customer";
import { revalidatePath } from "next/cache";

export async function updateCustomerAction(
  id: string,
  _prevState: any,
  formData: FormData
) {
  await requireAdmin();

  try {
    await updateCustomer(id, {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string | undefined,
      billingAddressLine1: formData.get("billingAddressLine1") as string | undefined,
      billingAddressLine2: formData.get("billingAddressLine2") as string | undefined,
      billingCity: formData.get("billingCity") as string | undefined,
      billingState: formData.get("billingState") as string | undefined,
      billingCountry: formData.get("billingCountry") as string | undefined,
      billingPostalCode: formData.get("billingPostalCode") as string | undefined,
    });

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${id}`);
    redirect(`/admin/customers/${id}`);
  } catch (error) {
    return { error: "Failed to update customer" };
  }
}

