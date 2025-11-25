"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { TicketSelector } from "@/components/ticket-selector";
import { getEventDetailsAction, getAvailableTicketTypesAction } from "@/server/actions";

interface EventDetails {
  id: string;
  title: string;
  startDate: Date;
  venue: {
    name: string;
    city: string | null;
  };
}

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantityAvailable: number;
  maxQuantityPerOrder: number | null;
}

export default function CheckoutTicketSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const eventSlug = params.eventSlug as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch event details
        const eventResult = await getEventDetailsAction(eventSlug);
        if (!eventResult.success || !eventResult.data) {
          setError("Event not found");
          return;
        }

        setEvent(eventResult.data);

        // Fetch ticket types
        const ticketTypesResult = await getAvailableTicketTypesAction(eventResult.data.id);
        if (!ticketTypesResult.success) {
          setError("Failed to load ticket types");
          return;
        }

        setTicketTypes(ticketTypesResult.data || []);
      } catch (err) {
        setError("Failed to load event details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventSlug]);

  const handleContinue = (selections: Record<string, number>) => {
    // Encode selections as URL parameter
    const ticketsParam = Object.entries(selections)
      .map(([id, qty]) => `${id}:${qty}`)
      .join(",");

    router.push(`/checkout/${eventSlug}/details?tickets=${ticketsParam}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-red-600">{error || "Event not found"}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
              1
            </div>
            <span className="mt-2 text-sm font-medium text-zinc-900">Tickets</span>
          </div>
          <div className="h-px w-16 bg-zinc-300" />
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-300 text-zinc-600">
              2
            </div>
            <span className="mt-2 text-sm text-zinc-600">Details</span>
          </div>
          <div className="h-px w-16 bg-zinc-300" />
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-300 text-zinc-600">
              3
            </div>
            <span className="mt-2 text-sm text-zinc-600">Payment</span>
          </div>
        </div>

        {/* Event Info */}
        <div className="mb-8 rounded-lg border bg-white p-6">
          <h1 className="text-2xl font-bold text-zinc-900">{event.title}</h1>
          <p className="text-zinc-600">
            {new Intl.DateTimeFormat("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(event.startDate))}
          </p>
          <p className="text-zinc-600">
            {event.venue.name}
            {event.venue.city && `, ${event.venue.city}`}
          </p>
        </div>

        {/* Ticket Selection */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-6 text-xl font-semibold text-zinc-900">
            Select Your Tickets
          </h2>

          {ticketTypes.length > 0 ? (
            <TicketSelector ticketTypes={ticketTypes} onContinue={handleContinue} />
          ) : (
            <div className="py-8 text-center">
              <p className="text-zinc-600">No tickets available for this event.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

