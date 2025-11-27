"use client";

import { DataTable, Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

interface CustomersTableProps {
  customers: Customer[];
  pagination: Pagination;
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

  const { page, total, totalPages, hasNext, hasPrev } = pagination;
  const startItem = (page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(page * pagination.pageSize, total);

  return (
    <div className="space-y-4">
      <DataTable
        data={customers}
        columns={columns}
        getItemId={(customer) => customer.id}
        basePath="/admin/customers"
        emptyMessage="No customers found."
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {total.toLocaleString()} customers
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              asChild={hasPrev}
            >
              {hasPrev ? (
                <Link href={`/admin/customers?page=${page - 1}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              asChild={hasNext}
            >
              {hasNext ? (
                <Link href={`/admin/customers?page=${page + 1}`}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

