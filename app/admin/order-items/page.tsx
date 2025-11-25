import { PageHeader } from "@/components/admin/page-header";
import { DataTable, Column } from "@/components/admin/data-table";
import { listOrderItems } from "@/server/use-cases/admin/order-items/list-order-items";
import Link from "next/link";

export default async function OrderItemsPage() {
  const orderItems = await listOrderItems();

  const columns: Column<(typeof orderItems)[0]>[] = [
    {
      key: "ticketTypeName",
      label: "Ticket Type",
    },
    {
      key: "eventTitle",
      label: "Event",
    },
    {
      key: "orderNumber",
      label: "Order",
      render: (item) => (
        <Link
          href={`/admin/orders/${item.orderId}`}
          className="text-primary hover:underline"
        >
          {item.orderNumber}
        </Link>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
    },
    {
      key: "unitPrice",
      label: "Unit Price",
      render: (item) => `$${item.unitPrice}`,
    },
    {
      key: "subtotal",
      label: "Subtotal",
      render: (item) => `$${item.subtotal}`,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Order Items"
        breadcrumbs={[{ label: "Order Items" }]}
      />

      <DataTable
        data={orderItems}
        columns={columns}
        getItemId={(item) => item.id}
        basePath="/admin/order-items"
        emptyMessage="No order items found."
      />
    </div>
  );
}

