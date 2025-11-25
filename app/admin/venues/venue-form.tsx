"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createVenueAction, updateVenueAction } from "./actions";

interface VenueFormProps {
  venue?: any;
}

export function VenueForm({ venue }: VenueFormProps) {
  const router = useRouter();
  const [createState, createFormAction, createPending] = useActionState(
    createVenueAction,
    null
  );
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateVenueAction.bind(null, venue?.id),
    null
  );

  const isPending = createPending || updatePending;
  const state = venue ? updateState : createState;

  return (
    <form action={venue ? updateFormAction : createFormAction}>
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={venue?.name}
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={venue?.description || ""}
                rows={4}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  defaultValue={venue?.capacity || ""}
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="isVirtual">Type *</Label>
                <Select name="isVirtual" defaultValue={venue?.isVirtual?.toString() || "0"} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Physical</SelectItem>
                    <SelectItem value="1">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone *</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  defaultValue={venue?.timezone || "UTC"}
                  required
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                defaultValue={venue?.addressLine1 || ""}
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                name="addressLine2"
                defaultValue={venue?.addressLine2 || ""}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={venue?.city || ""}
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={venue?.state || ""}
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={venue?.country || ""}
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  defaultValue={venue?.postalCode || ""}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={venue?.phone || ""}
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={venue?.email || ""}
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={venue?.website || ""}
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                defaultValue={venue?.imageUrl || ""}
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
            {isPending ? "Saving..." : venue ? "Update Venue" : "Create Venue"}
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

