import { PageHeader } from "@/components/admin/page-header";
import { listCustomersAdmin } from "@/server/use-cases/admin/customers/list-customers-admin";
import { CustomersTable } from "./customers-table";

interface CustomersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const { customers, pagination } = await listCustomersAdmin(page);

  return (
    <div>
      <PageHeader
        title="Customers"
        breadcrumbs={[{ label: "Customers" }]}
      />

      <CustomersTable customers={customers} pagination={pagination} />
    </div>
  );
}
