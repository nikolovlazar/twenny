import { PageHeader } from "@/components/admin/page-header";
import { listTicketTypes } from "@/server/use-cases/admin/ticket-types/list-ticket-types";
import { TicketTypesTable } from "./ticket-types-table";

interface TicketTypesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TicketTypesPage({ searchParams }: TicketTypesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const { ticketTypes, pagination } = await listTicketTypes(page);

  // Transform the data to include pre-rendered values
  const transformedTicketTypes = ticketTypes.map((tt) => ({
    id: tt.id,
    name: tt.name,
    eventId: tt.eventId,
    eventTitle: tt.eventTitle,
    formattedPrice: `$${tt.price}`,
    formattedQuantity: `${tt.quantitySold} / ${tt.quantity}`,
    activeText: tt.isActive === 1 ? "Yes" : "No",
  }));

  return (
    <div>
      <PageHeader
        title="Ticket Types"
        breadcrumbs={[{ label: "Ticket Types" }]}
        action={{ label: "Add Ticket Type", href: "/admin/ticket-types/new" }}
      />

      <TicketTypesTable data={transformedTicketTypes} pagination={pagination} />
    </div>
  );
}

