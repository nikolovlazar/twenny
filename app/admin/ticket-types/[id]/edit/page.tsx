import { PageHeader } from "@/components/admin/page-header";
import { TicketTypeForm } from "../../ticket-type-form";
import { getTicketType } from "@/server/use-cases/admin/ticket-types/get-ticket-type";
import { listEventsAdmin } from "@/server/use-cases/admin/events/list-events-admin";
import { notFound } from "next/navigation";

export default async function EditTicketTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [ticketType, events] = await Promise.all([
    getTicketType(id),
    listEventsAdmin(),
  ]);

  if (!ticketType) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Ticket Type"
        breadcrumbs={[
          { label: "Ticket Types", href: "/admin/ticket-types" },
          { label: ticketType.name, href: `/admin/ticket-types/${ticketType.id}` },
          { label: "Edit" },
        ]}
      />

      <TicketTypeForm ticketType={ticketType} events={events} />
    </div>
  );
}

