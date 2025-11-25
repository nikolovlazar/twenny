import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getEventBySlug } from "@/server/use-cases/events/get-event-by-slug";
import { getAvailableTicketTypes } from "@/server/use-cases/events/get-available-ticket-types";
import { CalendarIcon, MapPinIcon, ClockIcon } from "lucide-react";

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const ticketTypes = await getAvailableTicketTypes(event.id);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(event.startDate));

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(event.startDate));

  const hasTickets = ticketTypes.length > 0;

  return (
    <div>
      {/* Banner Image */}
      <div className="relative h-96 w-full overflow-hidden bg-zinc-100">
        {event.bannerImageUrl ? (
          <Image
            src={event.bannerImageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300">
            <span className="text-8xl">🎟️</span>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {event.category && (
              <span className="mb-2 inline-block rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
                {event.category}
              </span>
            )}
            <h1 className="mb-4 text-4xl font-bold text-zinc-900">
              {event.title}
            </h1>

            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 text-zinc-600">
                <CalendarIcon className="h-5 w-5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600">
                <ClockIcon className="h-5 w-5" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600">
                <MapPinIcon className="h-5 w-5" />
                <div>
                  <p className="font-medium text-zinc-900">{event.venue.name}</p>
                  {!event.venue.isVirtual && (
                    <p className="text-sm">
                      {[
                        event.venue.addressLine1,
                        event.venue.city,
                        event.venue.state,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {event.venue.isVirtual === 1 && (
                    <p className="text-sm">Virtual Event</p>
                  )}
                </div>
              </div>
            </div>

            {event.ageRestriction && (
              <div className="mb-6 rounded-lg bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">
                  Age Restriction: {event.ageRestriction}
                </p>
              </div>
            )}

            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-zinc-900">About This Event</h2>
              <p className="whitespace-pre-wrap text-zinc-600">
                {event.description || "No description available."}
              </p>
            </div>
          </div>

          {/* Sidebar - Tickets */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900">
                Select Tickets
              </h2>

              {hasTickets ? (
                <div className="space-y-4">
                  {ticketTypes.map((ticketType) => (
                    <div
                      key={ticketType.id}
                      className="rounded-lg border p-4"
                    >
                      <h3 className="font-semibold text-zinc-900">
                        {ticketType.name}
                      </h3>
                      {ticketType.description && (
                        <p className="mt-1 text-sm text-zinc-600">
                          {ticketType.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xl font-semibold text-zinc-900">
                          ${parseFloat(ticketType.price).toFixed(2)}
                        </span>
                        <span className="text-sm text-zinc-600">
                          {ticketType.quantityAvailable} left
                        </span>
                      </div>
                    </div>
                  ))}

                  <Link href={`/checkout/${event.slug}`}>
                    <Button className="w-full" size="lg">
                      Get Tickets
                    </Button>
                  </Link>

                  <p className="text-center text-xs text-zinc-500">
                    Service fees and taxes will be added at checkout
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-zinc-600">
                    No tickets currently available for this event.
                  </p>
                  <Button disabled className="w-full">
                    Sold Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

