import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTicketType } from "@/server/use-cases/admin/ticket-types/get-ticket-type";
import { notFound } from "next/navigation";

export default async function TicketTypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticketType = await getTicketType(id);

  if (!ticketType) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={ticketType.name}
        breadcrumbs={[
          { label: "Ticket Types", href: "/admin/ticket-types" },
          { label: ticketType.name },
        ]}
      />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="mt-1">{ticketType.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Event</dt>
              <dd className="mt-1">
                <Link
                  href={`/admin/events/${ticketType.event?.id}`}
                  className="text-primary hover:underline"
                >
                  {ticketType.event?.title}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Price</dt>
              <dd className="mt-1">${ticketType.price}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Active</dt>
              <dd className="mt-1">{ticketType.isActive === 1 ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </Card>

        {ticketType.description && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground">{ticketType.description}</p>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Inventory</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Total Quantity</dt>
              <dd className="mt-1">{ticketType.quantity.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Sold</dt>
              <dd className="mt-1">{ticketType.quantitySold.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Available</dt>
              <dd className="mt-1">
                {(ticketType.quantity - ticketType.quantitySold).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Sort Order</dt>
              <dd className="mt-1">{ticketType.sortOrder}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Purchase Limits</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Min Quantity Per Order</dt>
              <dd className="mt-1">{ticketType.minQuantityPerOrder || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Max Quantity Per Order</dt>
              <dd className="mt-1">{ticketType.maxQuantityPerOrder || "N/A"}</dd>
            </div>
          </dl>
        </Card>

        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/admin/ticket-types/${ticketType.id}/edit`}>Edit Ticket Type</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/ticket-types">Back to Ticket Types</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

