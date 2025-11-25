import { PageHeader } from "@/components/admin/page-header";
import { EventForm } from "../../event-form";
import { getEventAdmin } from "@/server/use-cases/admin/events/get-event-admin";
import { listVenues } from "@/server/use-cases/admin/venues/list-venues";
import { notFound } from "next/navigation";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, venues] = await Promise.all([
    getEventAdmin(id),
    listVenues(),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Event"
        breadcrumbs={[
          { label: "Events", href: "/admin/events" },
          { label: event.title, href: `/admin/events/${event.id}` },
          { label: "Edit" },
        ]}
      />

      <EventForm event={event} venues={venues} />
    </div>
  );
}

