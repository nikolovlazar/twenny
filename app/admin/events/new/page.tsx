import { PageHeader } from "@/components/admin/page-header";
import { EventForm } from "../event-form";
import { listVenues } from "@/server/use-cases/admin/venues/list-venues";

export default async function NewEventPage() {
  const venues = await listVenues();

  return (
    <div>
      <PageHeader
        title="Create Event"
        breadcrumbs={[
          { label: "Events", href: "/admin/events" },
          { label: "New" },
        ]}
      />

      <EventForm venues={venues} />
    </div>
  );
}

