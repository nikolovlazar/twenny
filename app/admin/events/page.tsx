import { PageHeader } from "@/components/admin/page-header";
import { listEventsAdmin } from "@/server/use-cases/admin/events/list-events-admin";
import { EventsTable } from "./events-table";

interface EventsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const { events, pagination } = await listEventsAdmin(page);

  // Transform the data to include formatted values
  const transformedEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    venueName: event.venueName,
    formattedStartDate: new Date(event.startDate).toLocaleDateString(),
    status: event.status,
    publishedText: event.isPublished === 1 ? "Yes" : "No",
    formattedCapacity: event.totalCapacity.toLocaleString(),
  }));

  return (
    <div>
      <PageHeader
        title="Events"
        breadcrumbs={[{ label: "Events" }]}
        action={{ label: "Add Event", href: "/admin/events/new" }}
      />

      <EventsTable data={transformedEvents} pagination={pagination} />
    </div>
  );
}

