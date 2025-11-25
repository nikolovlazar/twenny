import { PageHeader } from "@/components/admin/page-header";
import { OrderItemForm } from "../../order-item-form";
import { getOrderItem } from "@/server/use-cases/admin/order-items/get-order-item";
import { notFound } from "next/navigation";

export default async function EditOrderItemPage({
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
        title="Edit Order Item"
        breadcrumbs={[
          { label: "Order Items", href: "/admin/order-items" },
          { label: "Details", href: `/admin/order-items/${item.id}` },
          { label: "Edit" },
        ]}
      />

      <OrderItemForm item={item} />
    </div>
  );
}

