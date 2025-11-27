"use client";

import { DataTable, Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  currency: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerId: string | null;
  createdAt: Date;
  completedAt: Date | null;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

interface OrdersTableProps {
  orders: Order[];
  pagination: Pagination;
}

export function OrdersTable({ orders, pagination }: OrdersTableProps) {
  const columns: Column<Order>[] = [
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

  const { page, total, totalPages, hasNext, hasPrev } = pagination;
  const startItem = (page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(page * pagination.pageSize, total);

  return (
    <div className="space-y-4">
      <DataTable
        data={orders}
        columns={columns}
        getItemId={(order) => order.id}
        basePath="/admin/orders"
        emptyMessage="No orders found."
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {total.toLocaleString()} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              asChild={hasPrev}
            >
              {hasPrev ? (
                <Link href={`/admin/orders?page=${page - 1}`}>
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
                <Link href={`/admin/orders?page=${page + 1}`}>
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

