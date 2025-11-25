"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/services/admin-guard";
import { createVenue } from "@/server/use-cases/admin/venues/create-venue";
import { updateVenue } from "@/server/use-cases/admin/venues/update-venue";
import { deleteVenue } from "@/server/use-cases/admin/venues/delete-venue";
import { revalidatePath } from "next/cache";

export async function createVenueAction(_prevState: any, formData: FormData) {
  await requireAdmin();

  try {
    const venue = await createVenue({
      name: formData.get("name") as string,
      description: formData.get("description") as string | undefined,
      addressLine1: formData.get("addressLine1") as string | undefined,
      addressLine2: formData.get("addressLine2") as string | undefined,
      city: formData.get("city") as string | undefined,
      state: formData.get("state") as string | undefined,
      country: formData.get("country") as string | undefined,
      postalCode: formData.get("postalCode") as string | undefined,
      capacity: formData.get("capacity")
        ? parseInt(formData.get("capacity") as string)
        : undefined,
      timezone: formData.get("timezone") as string,
      isVirtual: parseInt(formData.get("isVirtual") as string),
      phone: formData.get("phone") as string | undefined,
      email: formData.get("email") as string | undefined,
      website: formData.get("website") as string | undefined,
      imageUrl: formData.get("imageUrl") as string | undefined,
    });

    revalidatePath("/admin/venues");
    redirect(`/admin/venues/${venue.id}`);
  } catch (error) {
    return { error: "Failed to create venue" };
  }
}

export async function updateVenueAction(
  id: string,
  _prevState: any,
  formData: FormData
) {
  await requireAdmin();

  try {
    await updateVenue(id, {
      name: formData.get("name") as string,
      description: formData.get("description") as string | undefined,
      addressLine1: formData.get("addressLine1") as string | undefined,
      addressLine2: formData.get("addressLine2") as string | undefined,
      city: formData.get("city") as string | undefined,
      state: formData.get("state") as string | undefined,
      country: formData.get("country") as string | undefined,
      postalCode: formData.get("postalCode") as string | undefined,
      capacity: formData.get("capacity")
        ? parseInt(formData.get("capacity") as string)
        : undefined,
      timezone: formData.get("timezone") as string,
      isVirtual: parseInt(formData.get("isVirtual") as string),
      phone: formData.get("phone") as string | undefined,
      email: formData.get("email") as string | undefined,
      website: formData.get("website") as string | undefined,
      imageUrl: formData.get("imageUrl") as string | undefined,
    });

    revalidatePath("/admin/venues");
    revalidatePath(`/admin/venues/${id}`);
    redirect(`/admin/venues/${id}`);
  } catch (error) {
    return { error: "Failed to update venue" };
  }
}

export async function deleteVenueAction(id: string) {
  await requireAdmin();

  try {
    await deleteVenue(id);
    revalidatePath("/admin/venues");
    redirect("/admin/venues");
  } catch (error) {
    throw new Error("Failed to delete venue");
  }
}

