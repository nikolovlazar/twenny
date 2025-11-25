import { PageHeader } from "@/components/admin/page-header";
import { DataTable, Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { listTicketsAdmin } from "@/server/use-cases/admin/tickets/list-tickets-admin";
import Link from "next/link";

export default async function TicketsPage() {
  const tickets = await listTicketsAdmin();

  const columns: Column<(typeof tickets)[0]>[] = [
    {
      key: "ticketCode",
      label: "Ticket Code",
    },
    {
      key: "eventTitle",
      label: "Event",
      render: (ticket) => (
        <Link
          href={`/admin/events/${ticket.eventId}`}
          className="text-primary hover:underline"
        >
          {ticket.eventTitle}
        </Link>
      ),
    },
    {
      key: "ticketTypeName",
      label: "Type",
    },
    {
      key: "attendeeEmail",
      label: "Attendee",
      render: (ticket) => ticket.attendeeEmail || ticket.customerEmail || "N/A",
    },
    {
      key: "status",
      label: "Status",
      render: (ticket) => <StatusBadge status={ticket.status} type="ticket" />,
    },
    {
      key: "isCheckedIn",
      label: "Checked In",
      render: (ticket) => (ticket.isCheckedIn === 1 ? "Yes" : "No"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tickets"
        breadcrumbs={[{ label: "Tickets" }]}
      />

      <DataTable
        data={tickets}
        columns={columns}
        getItemId={(ticket) => ticket.id}
        basePath="/admin/tickets"
        emptyMessage="No tickets found."
      />
    </div>
  );
}

