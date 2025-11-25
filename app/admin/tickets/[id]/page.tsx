import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import { getTicketAdmin } from "@/server/use-cases/admin/tickets/get-ticket-admin";
import { CheckInButton } from "../check-in-button";
import { notFound } from "next/navigation";

export default async function TicketDetailPage({
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
        title={`Ticket ${ticket.ticketCode}`}
        breadcrumbs={[
          { label: "Tickets", href: "/admin/tickets" },
          { label: ticket.ticketCode },
        ]}
      />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ticket Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Ticket Code</dt>
              <dd className="mt-1 font-mono">{ticket.ticketCode}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={ticket.status} type="ticket" />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Event</dt>
              <dd className="mt-1">
                <Link
                  href={`/admin/events/${ticket.event?.id}`}
                  className="text-primary hover:underline"
                >
                  {ticket.eventTitle}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Ticket Type</dt>
              <dd className="mt-1">{ticket.ticketTypeName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Price</dt>
              <dd className="mt-1">${ticket.price}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Order</dt>
              <dd className="mt-1">
                <Link
                  href={`/admin/orders/${ticket.order?.id}`}
                  className="text-primary hover:underline"
                >
                  {ticket.order?.orderNumber}
                </Link>
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Attendee Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">First Name</dt>
              <dd className="mt-1">{ticket.attendeeFirstName || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Last Name</dt>
              <dd className="mt-1">{ticket.attendeeLastName || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1">{ticket.attendeeEmail || "N/A"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Check-in Status</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Checked In</dt>
              <dd className="mt-1">{ticket.isCheckedIn === 1 ? "Yes" : "No"}</dd>
            </div>
            {ticket.checkedInAt && (
              <>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Checked In At</dt>
                  <dd className="mt-1">{new Date(ticket.checkedInAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Checked In By</dt>
                  <dd className="mt-1">{ticket.checkedInBy || "N/A"}</dd>
                </div>
              </>
            )}
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Customer</dt>
              <dd className="mt-1">
                <Link
                  href={`/admin/customers/${ticket.customer?.id}`}
                  className="text-primary hover:underline"
                >
                  {ticket.customer?.firstName} {ticket.customer?.lastName}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Customer Email</dt>
              <dd className="mt-1">{ticket.customer?.email}</dd>
            </div>
          </dl>
        </Card>

        <div className="flex gap-2">
          {ticket.isCheckedIn === 0 && ticket.status === "valid" && (
            <CheckInButton ticketId={ticket.id} />
          )}
          <Button asChild>
            <Link href={`/admin/tickets/${ticket.id}/edit`}>Edit Ticket</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/tickets">Back to Tickets</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

