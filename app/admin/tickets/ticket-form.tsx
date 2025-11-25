"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTicketAction } from "./actions";

interface TicketFormProps {
  ticket: any;
}

export function TicketForm({ ticket }: TicketFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateTicketAction.bind(null, ticket.id),
    null
  );

  return (
    <form action={formAction}>
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ticket Status</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={ticket.status} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Attendee Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="attendeeFirstName">First Name</Label>
                <Input
                  id="attendeeFirstName"
                  name="attendeeFirstName"
                  defaultValue={ticket.attendeeFirstName || ""}
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="attendeeLastName">Last Name</Label>
                <Input
                  id="attendeeLastName"
                  name="attendeeLastName"
                  defaultValue={ticket.attendeeLastName || ""}
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="attendeeEmail">Email</Label>
              <Input
                id="attendeeEmail"
                name="attendeeEmail"
                type="email"
                defaultValue={ticket.attendeeEmail || ""}
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
            {isPending ? "Saving..." : "Update Ticket"}
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

