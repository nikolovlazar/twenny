import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import { getOrderAdmin } from "@/server/use-cases/admin/orders/get-order-admin";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderAdmin(id);

  if (!order) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        breadcrumbs={[
          { label: "Orders", href: "/admin/orders" },
          { label: order.orderNumber },
        ]}
      />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Order Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Order Number</dt>
              <dd className="mt-1">{order.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={order.status} type="order" />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Payment Status</dt>
              <dd className="mt-1">
                <StatusBadge status={order.paymentStatus} type="payment" />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Payment Method</dt>
              <dd className="mt-1">{order.paymentMethod || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
              <dd className="mt-1">{new Date(order.createdAt).toLocaleString()}</dd>
            </div>
            {order.completedAt && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Completed At</dt>
                <dd className="mt-1">{new Date(order.completedAt).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="mt-1">
                <Link
                  href={`/admin/customers/${order.customer?.id}`}
                  className="text-primary hover:underline"
                >
                  {order.customerFirstName} {order.customerLastName}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1">{order.customerEmail}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd className="mt-1">{order.customerPhone || "N/A"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{item.ticketTypeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.eventTitle} • Qty: {item.quantity} • ${item.unitPrice} each
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.subtotal}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Subtotal</dt>
              <dd>${order.subtotal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Tax</dt>
              <dd>${order.tax}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Fees</dt>
              <dd>${order.fees}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <dt>Total</dt>
              <dd>${order.total} {order.currency}</dd>
            </div>
          </dl>
        </Card>

        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/admin/orders/${order.id}/edit`}>Edit Order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

