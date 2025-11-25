import { PageHeader } from "@/components/admin/page-header";
import { TicketForm } from "../../ticket-form";
import { getTicketAdmin } from "@/server/use-cases/admin/tickets/get-ticket-admin";
import { notFound } from "next/navigation";

export default async function EditTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicketAdmin(id);

  if (!ticket) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Ticket"
        breadcrumbs={[
          { label: "Tickets", href: "/admin/tickets" },
          { label: ticket.ticketCode, href: `/admin/tickets/${ticket.id}` },
          { label: "Edit" },
        ]}
      />

      <TicketForm ticket={ticket} />
    </div>
  );
}

