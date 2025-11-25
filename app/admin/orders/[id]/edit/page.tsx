import { PageHeader } from "@/components/admin/page-header";
import { OrderForm } from "../../order-form";
import { getOrderAdmin } from "@/server/use-cases/admin/orders/get-order-admin";
import { notFound } from "next/navigation";

export default async function EditOrderPage({
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
        title="Edit Order"
        breadcrumbs={[
          { label: "Orders", href: "/admin/orders" },
          { label: order.orderNumber, href: `/admin/orders/${order.id}` },
          { label: "Edit" },
        ]}
      />

      <OrderForm order={order} />
    </div>
  );
}

