import { PageHeader } from "@/components/admin/page-header";
import { DataTable, Column } from "@/components/admin/data-table";
import { listTicketTypes } from "@/server/use-cases/admin/ticket-types/list-ticket-types";
import Link from "next/link";

export default async function TicketTypesPage() {
  const ticketTypes = await listTicketTypes();

  const columns: Column<(typeof ticketTypes)[0]>[] = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "eventTitle",
      label: "Event",
      render: (tt) => (
        <Link
          href={`/admin/events/${tt.eventId}`}
          className="text-primary hover:underline"
        >
          {tt.eventTitle}
        </Link>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (tt) => `$${tt.price}`,
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (tt) => `${tt.quantitySold} / ${tt.quantity}`,
    },
    {
      key: "isActive",
      label: "Active",
      render: (tt) => (tt.isActive === 1 ? "Yes" : "No"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Ticket Types"
        breadcrumbs={[{ label: "Ticket Types" }]}
        action={{ label: "Add Ticket Type", href: "/admin/ticket-types/new" }}
      />

      <DataTable
        data={ticketTypes}
        columns={columns}
        getItemId={(tt) => tt.id}
        basePath="/admin/ticket-types"
        emptyMessage="No ticket types found. Create one to get started."
      />
    </div>
  );
}

