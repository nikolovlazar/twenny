import { PageHeader } from "@/components/admin/page-header";
import { CustomerForm } from "../../customer-form";
import { getCustomerAdmin } from "@/server/use-cases/admin/customers/get-customer-admin";
import { notFound } from "next/navigation";

export default async function EditCustomerPage({
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
        title="Edit Customer"
        breadcrumbs={[
          { label: "Customers", href: "/admin/customers" },
          { label: `${customer.firstName} ${customer.lastName}`, href: `/admin/customers/${customer.id}` },
          { label: "Edit" },
        ]}
      />

      <CustomerForm customer={customer} />
    </div>
  );
}

