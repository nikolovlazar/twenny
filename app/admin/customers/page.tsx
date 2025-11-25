import { PageHeader } from "@/components/admin/page-header";
import { DataTable, Column } from "@/components/admin/data-table";
import { listCustomersAdmin } from "@/server/use-cases/admin/customers/list-customers-admin";

export default async function CustomersPage() {
  const customers = await listCustomersAdmin();

  const columns: Column<(typeof customers)[0]>[] = [
    {
      key: "firstName",
      label: "First Name",
    },
    {
      key: "lastName",
      label: "Last Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
      render: (customer) => customer.phone || "N/A",
    },
    {
      key: "userId",
      label: "User ID",
      render: (customer) => customer.userId || "Guest",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        breadcrumbs={[{ label: "Customers" }]}
      />

      <DataTable
        data={customers}
        columns={columns}
        getItemId={(customer) => customer.id}
        basePath="/admin/customers"
        emptyMessage="No customers found."
      />
    </div>
  );
}

