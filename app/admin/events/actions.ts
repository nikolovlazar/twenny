"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/services/admin-guard";
import { createEvent } from "@/server/use-cases/admin/events/create-event";
import { updateEvent } from "@/server/use-cases/admin/events/update-event";
import { deleteEvent } from "@/server/use-cases/admin/events/delete-event";
import { revalidatePath } from "next/cache";

export async function createEventAction(_prevState: any, formData: FormData) {
  await requireAdmin();

  try {
    const isPublished = parseInt(formData.get("isPublished") as string);
    const event = await createEvent({
      venueId: formData.get("venueId") as string,
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string | undefined,
      shortDescription: formData.get("shortDescription") as string | undefined,
      startDate: new Date(formData.get("startDate") as string),
      endDate: formData.get("endDate")
        ? new Date(formData.get("endDate") as string)
        : undefined,
      timezone: formData.get("timezone") as string,
      status: formData.get("status") as any,
      isPublished,
      publishedAt: isPublished === 1 ? new Date() : undefined,
      totalCapacity: parseInt(formData.get("totalCapacity") as string),
      currency: formData.get("currency") as string,
      bannerImageUrl: formData.get("bannerImageUrl") as string | undefined,
      thumbnailImageUrl: formData.get("thumbnailImageUrl") as string | undefined,
      category: formData.get("category") as string | undefined,
    });

    revalidatePath("/admin/events");
    redirect(`/admin/events/${event.id}`);
  } catch (error) {
    return { error: "Failed to create event" };
  }
}

export async function updateEventAction(
  id: string,
  _prevState: any,
  formData: FormData
) {
  await requireAdmin();

  try {
    const isPublished = parseInt(formData.get("isPublished") as string);
    await updateEvent(id, {
      venueId: formData.get("venueId") as string,
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string | undefined,
      shortDescription: formData.get("shortDescription") as string | undefined,
      startDate: new Date(formData.get("startDate") as string),
      endDate: formData.get("endDate")
        ? new Date(formData.get("endDate") as string)
        : undefined,
      timezone: formData.get("timezone") as string,
      status: formData.get("status") as any,
      isPublished,
      publishedAt: isPublished === 1 ? new Date() : undefined,
      totalCapacity: parseInt(formData.get("totalCapacity") as string),
      currency: formData.get("currency") as string,
      bannerImageUrl: formData.get("bannerImageUrl") as string | undefined,
      thumbnailImageUrl: formData.get("thumbnailImageUrl") as string | undefined,
      category: formData.get("category") as string | undefined,
    });

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    redirect(`/admin/events/${id}`);
  } catch (error) {
    return { error: "Failed to update event" };
  }
}

export async function deleteEventAction(id: string) {
  await requireAdmin();

  try {
    await deleteEvent(id);
    revalidatePath("/admin/events");
    redirect("/admin/events");
  } catch (error) {
    throw new Error("Failed to delete event");
  }
}

