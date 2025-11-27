"use client";

import { DataTable, Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  ticketTypeName: string;
  orderId: string;
  orderNumber: string | null;
  eventTitle: string | null;
  createdAt: Date;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

interface OrderItemsTableProps {
  orderItems: OrderItem[];
  pagination: Pagination;
}

export function OrderItemsTable({ orderItems, pagination }: OrderItemsTableProps) {
  const columns: Column<OrderItem>[] = [
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

  const { page, total, totalPages, hasNext, hasPrev } = pagination;
  const startItem = (page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(page * pagination.pageSize, total);

  return (
    <div className="space-y-4">
      <DataTable
        data={orderItems}
        columns={columns}
        getItemId={(item) => item.id}
        basePath="/admin/order-items"
        emptyMessage="No order items found."
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {total.toLocaleString()} order items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              asChild={hasPrev}
            >
              {hasPrev ? (
                <Link href={`/admin/order-items?page=${page - 1}`}>
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
                <Link href={`/admin/order-items?page=${page + 1}`}>
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

