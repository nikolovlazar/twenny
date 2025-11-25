"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEventAction, updateEventAction } from "./actions";

interface EventFormProps {
  event?: any;
  venues: any[];
}

export function EventForm({ event, venues }: EventFormProps) {
  const router = useRouter();
  const [createState, createFormAction, createPending] = useActionState(
    createEventAction,
    null
  );
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateEventAction.bind(null, event?.id),
    null
  );

  const isPending = createPending || updatePending;
  const state = event ? updateState : createState;

  return (
    <form action={event ? updateFormAction : createFormAction}>
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={event?.title}
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={event?.slug}
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                name="shortDescription"
                defaultValue={event?.shortDescription || ""}
                rows={2}
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={event?.description || ""}
                rows={6}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="venueId">Venue *</Label>
                <Select name="venueId" defaultValue={event?.venueId} disabled={isPending} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={event?.category || ""}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalCapacity">Total Capacity *</Label>
                <Input
                  id="totalCapacity"
                  name="totalCapacity"
                  type="number"
                  defaultValue={event?.totalCapacity}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency *</Label>
                <Input
                  id="currency"
                  name="currency"
                  defaultValue={event?.currency || "USD"}
                  required
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Date & Time</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  defaultValue={
                    event?.startDate
                      ? new Date(event.startDate).toISOString().slice(0, 16)
                      : ""
                  }
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  defaultValue={
                    event?.endDate
                      ? new Date(event.endDate).toISOString().slice(0, 16)
                      : ""
                  }
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone *</Label>
              <Input
                id="timezone"
                name="timezone"
                defaultValue={event?.timezone || "UTC"}
                required
                disabled={isPending}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Status & Publishing</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select name="status" defaultValue={event?.status || "draft"} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="isPublished">Published *</Label>
                <Select name="isPublished" defaultValue={event?.isPublished?.toString() || "0"} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No</SelectItem>
                    <SelectItem value="1">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bannerImageUrl">Banner Image URL</Label>
              <Input
                id="bannerImageUrl"
                name="bannerImageUrl"
                type="url"
                defaultValue={event?.bannerImageUrl || ""}
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="thumbnailImageUrl">Thumbnail Image URL</Label>
              <Input
                id="thumbnailImageUrl"
                name="thumbnailImageUrl"
                type="url"
                defaultValue={event?.thumbnailImageUrl || ""}
                disabled={isPending}
              />
            </div>
          </div>
        </Card>

        {state?.error && (
          <div className="text-sm text-destructive">{state.error}</div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : event ? "Update Event" : "Create Event"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

