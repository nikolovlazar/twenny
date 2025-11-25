"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTicketTypeAction, updateTicketTypeAction } from "./actions";

interface TicketTypeFormProps {
  ticketType?: any;
  events: any[];
}

export function TicketTypeForm({ ticketType, events }: TicketTypeFormProps) {
  const router = useRouter();
  const [createState, createFormAction, createPending] = useActionState(
    createTicketTypeAction,
    null
  );
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateTicketTypeAction.bind(null, ticketType?.id),
    null
  );

  const isPending = createPending || updatePending;
  const state = ticketType ? updateState : createState;

  return (
    <form action={ticketType ? updateFormAction : createFormAction}>
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventId">Event *</Label>
              <Select name="eventId" defaultValue={ticketType?.eventId} disabled={isPending} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={ticketType?.name}
                required
                disabled={isPending}
                placeholder="e.g., General Admission, VIP, Early Bird"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={ticketType?.description || ""}
                rows={3}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={ticketType?.price}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="isActive">Active *</Label>
                <Select name="isActive" defaultValue={ticketType?.isActive?.toString() || "1"} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Yes</SelectItem>
                    <SelectItem value="0">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Inventory</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Total Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  defaultValue={ticketType?.quantity}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  defaultValue={ticketType?.sortOrder || 0}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Purchase Limits</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minQuantityPerOrder">Min Quantity Per Order</Label>
                <Input
                  id="minQuantityPerOrder"
                  name="minQuantityPerOrder"
                  type="number"
                  defaultValue={ticketType?.minQuantityPerOrder || 1}
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="maxQuantityPerOrder">Max Quantity Per Order</Label>
                <Input
                  id="maxQuantityPerOrder"
                  name="maxQuantityPerOrder"
                  type="number"
                  defaultValue={ticketType?.maxQuantityPerOrder || 10}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Sale Period</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="saleStartDate">Sale Start Date</Label>
                <Input
                  id="saleStartDate"
                  name="saleStartDate"
                  type="datetime-local"
                  defaultValue={
                    ticketType?.saleStartDate
                      ? new Date(ticketType.saleStartDate).toISOString().slice(0, 16)
                      : ""
                  }
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="saleEndDate">Sale End Date</Label>
                <Input
                  id="saleEndDate"
                  name="saleEndDate"
                  type="datetime-local"
                  defaultValue={
                    ticketType?.saleEndDate
                      ? new Date(ticketType.saleEndDate).toISOString().slice(0, 16)
                      : ""
                  }
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </Card>

        {state?.error && (
          <div className="text-sm text-destructive">{state.error}</div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : ticketType ? "Update Ticket Type" : "Create Ticket Type"}
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

