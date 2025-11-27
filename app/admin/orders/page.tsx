import { PageHeader } from "@/components/admin/page-header";
import { listOrdersAdmin } from "@/server/use-cases/admin/orders/list-orders-admin";
import { OrdersTable } from "./orders-table";

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const { orders, pagination } = await listOrdersAdmin(page);

  return (
    <div>
      <PageHeader
        title="Orders"
        breadcrumbs={[{ label: "Orders" }]}
      />

      <OrdersTable orders={orders} pagination={pagination} />
    </div>
  );
}
