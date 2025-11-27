import { PageHeader } from "@/components/admin/page-header";
import { listOrderItems } from "@/server/use-cases/admin/order-items/list-order-items";
import { OrderItemsTable } from "./order-items-table";

interface OrderItemsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OrderItemsPage({ searchParams }: OrderItemsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const { orderItems, pagination } = await listOrderItems(page);

  return (
    <div>
      <PageHeader
        title="Order Items"
        breadcrumbs={[{ label: "Order Items" }]}
      />

      <OrderItemsTable orderItems={orderItems} pagination={pagination} />
    </div>
  );
}
