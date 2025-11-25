"use client";

import { Button } from "@/components/ui/button";
import { checkInTicketAction } from "./actions";
import { useActionState } from "react";

interface CheckInButtonProps {
  ticketId: string;
}

export function CheckInButton({ ticketId }: CheckInButtonProps) {
  const [state, formAction, isPending] = useActionState(
    checkInTicketAction.bind(null, ticketId),
    null
  );

  return (
    <form action={formAction}>
      <Button type="submit" disabled={isPending} variant="default">
        {isPending ? "Checking In..." : "Check In Ticket"}
      </Button>
      {state?.error && (
        <p className="text-sm text-destructive mt-2">{state.error}</p>
      )}
    </form>
  );
}

