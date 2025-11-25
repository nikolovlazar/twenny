import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import { getCustomerAdmin } from "@/server/use-cases/admin/customers/get-customer-admin";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerAdmin(id);

  if (!customer) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        breadcrumbs={[
          { label: "Customers", href: "/admin/customers" },
          { label: `${customer.firstName} ${customer.lastName}` },
        ]}
      />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">First Name</dt>
              <dd className="mt-1">{customer.firstName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Last Name</dt>
              <dd className="mt-1">{customer.lastName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1">{customer.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd className="mt-1">{customer.phone || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
              <dd className="mt-1">{customer.userId || "Guest"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Address Line 1</dt>
              <dd className="mt-1">{customer.billingAddressLine1 || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Address Line 2</dt>
              <dd className="mt-1">{customer.billingAddressLine2 || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">City</dt>
              <dd className="mt-1">{customer.billingCity || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">State</dt>
              <dd className="mt-1">{customer.billingState || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Country</dt>
              <dd className="mt-1">{customer.billingCountry || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Postal Code</dt>
              <dd className="mt-1">{customer.billingPostalCode || "N/A"}</dd>
            </div>
          </dl>
        </Card>

        {customer.orders && customer.orders.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order History</h2>
            <div className="space-y-4">
              {customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} • ${order.total} •
                      <StatusBadge status={order.status} type="order" className="ml-2" />
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/orders/${order.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/admin/customers/${customer.id}/edit`}>Edit Customer</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/customers">Back to Customers</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

