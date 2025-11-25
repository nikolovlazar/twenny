import { PageHeader } from "@/components/admin/page-header";
import { DataTable, Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { listEventsAdmin } from "@/server/use-cases/admin/events/list-events-admin";

export default async function EventsPage() {
  const events = await listEventsAdmin();

  const columns: Column<(typeof events)[0]>[] = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "venueName",
      label: "Venue",
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (event) =>
        new Date(event.startDate).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (event) => <StatusBadge status={event.status} type="event" />,
    },
    {
      key: "isPublished",
      label: "Published",
      render: (event) => (event.isPublished === 1 ? "Yes" : "No"),
    },
    {
      key: "totalCapacity",
      label: "Capacity",
      render: (event) => event.totalCapacity.toLocaleString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Events"
        breadcrumbs={[{ label: "Events" }]}
        action={{ label: "Add Event", href: "/admin/events/new" }}
      />

      <DataTable
        data={events}
        columns={columns}
        getItemId={(event) => event.id}
        basePath="/admin/events"
        emptyMessage="No events found. Create one to get started."
      />
    </div>
  );
}

