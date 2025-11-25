import { PageHeader } from "@/components/admin/page-header";
import { TicketTypeForm } from "../ticket-type-form";
import { listEventsAdmin } from "@/server/use-cases/admin/events/list-events-admin";

export default async function NewTicketTypePage() {
  const events = await listEventsAdmin();

  return (
    <div>
      <PageHeader
        title="Create Ticket Type"
        breadcrumbs={[
          { label: "Ticket Types", href: "/admin/ticket-types" },
          { label: "New" },
        ]}
      />

      <TicketTypeForm events={events} />
    </div>
  );
}

