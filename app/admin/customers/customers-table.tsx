"use client";

import { DataTable, Column } from "@/components/admin/data-table";
import { Pagination, PaginationData } from "@/components/admin/pagination";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface CustomersTableProps {
  customers: Customer[];
  pagination: PaginationData;
}

export function CustomersTable({ customers, pagination }: CustomersTableProps) {
  const columns: Column<Customer>[] = [
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
    <div className="space-y-4">
      <DataTable
        data={customers}
        columns={columns}
        getItemId={(customer) => customer.id}
        basePath="/admin/customers"
        emptyMessage="No customers found."
      />

      <Pagination
        pagination={pagination}
        basePath="/admin/customers"
        itemName="customers"
      />
    </div>
  );
}

