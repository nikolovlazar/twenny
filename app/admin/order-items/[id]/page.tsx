import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getOrderItem } from "@/server/use-cases/admin/order-items/get-order-item";
import { notFound } from "next/navigation";

export default async function OrderItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getOrderItem(id);

  if (!item) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Order Item Details"
        breadcrumbs={[
          { label: "Order Items", href: "/admin/order-items" },
          { label: "Details" },
        ]}
      />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Item Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Ticket Type</dt>
              <dd className="mt-1">{item.ticketTypeName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Event</dt>
              <dd className="mt-1">{item.eventTitle}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Order</dt>
              <dd className="mt-1">
                <Link
                  href={`/admin/orders/${item.orderId}`}
                  className="text-primary hover:underline"
                >
                  {item.orderNumber}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Quantity</dt>
              <dd className="mt-1">{item.quantity}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Unit Price</dt>
              <dd className="mt-1">${item.unitPrice}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Subtotal</dt>
              <dd className="mt-1">${item.subtotal}</dd>
            </div>
          </dl>
        </Card>

        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/admin/order-items/${item.id}/edit`}>Edit Order Item</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/order-items">Back to Order Items</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

