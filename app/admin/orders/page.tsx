import { PageHeader } from "@/components/admin/page-header";
import { DataTable, Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { listOrdersAdmin } from "@/server/use-cases/admin/orders/list-orders-admin";

export default async function OrdersPage() {
  const orders = await listOrdersAdmin();

  const columns: Column<(typeof orders)[0]>[] = [
    {
      key: "orderNumber",
      label: "Order Number",
    },
    {
      key: "customerEmail",
      label: "Customer",
      render: (order) => `${order.customerFirstName} ${order.customerLastName}`,
    },
    {
      key: "total",
      label: "Total",
      render: (order) => `$${order.total}`,
    },
    {
      key: "status",
      label: "Status",
      render: (order) => <StatusBadge status={order.status} type="order" />,
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (order) => <StatusBadge status={order.paymentStatus} type="payment" />,
    },
    {
      key: "createdAt",
      label: "Date",
      render: (order) => new Date(order.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Orders"
        breadcrumbs={[{ label: "Orders" }]}
      />

      <DataTable
        data={orders}
        columns={columns}
        getItemId={(order) => order.id}
        basePath="/admin/orders"
        emptyMessage="No orders found."
      />
    </div>
  );
}

