"use client";

import { DataTable, Column } from "@/components/admin/data-table";
import { Pagination, PaginationData } from "@/components/admin/pagination";
import Link from "next/link";

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

interface OrderItemsTableProps {
  orderItems: OrderItem[];
  pagination: PaginationData;
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

  return (
    <div className="space-y-4">
      <DataTable
        data={orderItems}
        columns={columns}
        getItemId={(item) => item.id}
        basePath="/admin/order-items"
        emptyMessage="No order items found."
      />

      <Pagination
        pagination={pagination}
        basePath="/admin/order-items"
        itemName="order items"
      />
    </div>
  );
}

