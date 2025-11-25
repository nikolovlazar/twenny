import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import { getEventAdmin } from "@/server/use-cases/admin/events/get-event-admin";
import { notFound } from "next/navigation";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventAdmin(id);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={event.title}
        breadcrumbs={[
          { label: "Events", href: "/admin/events" },
          { label: event.title },
        ]}
      />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Title</dt>
              <dd className="mt-1">{event.title}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Slug</dt>
              <dd className="mt-1">{event.slug}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={event.status} type="event" />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Published</dt>
              <dd className="mt-1">{event.isPublished === 1 ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Venue</dt>
              <dd className="mt-1">
                <Link
                  href={`/admin/venues/${event.venue?.id}`}
                  className="text-primary hover:underline"
                >
                  {event.venue?.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Category</dt>
              <dd className="mt-1">{event.category || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Total Capacity</dt>
              <dd className="mt-1">{event.totalCapacity.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Currency</dt>
              <dd className="mt-1">{event.currency}</dd>
            </div>
          </dl>
        </Card>

        {event.description && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Date & Time</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
              <dd className="mt-1">{new Date(event.startDate).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
              <dd className="mt-1">
                {event.endDate ? new Date(event.endDate).toLocaleString() : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Timezone</dt>
              <dd className="mt-1">{event.timezone}</dd>
            </div>
          </dl>
        </Card>

        {event.ticketTypes && event.ticketTypes.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Ticket Types</h2>
            <div className="space-y-4">
              {event.ticketTypes.map((ticketType) => (
                <div
                  key={ticketType.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">{ticketType.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${ticketType.price} • {ticketType.quantitySold} / {ticketType.quantity} sold
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/ticket-types/${ticketType.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/admin/events/${event.id}/edit`}>Edit Event</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

