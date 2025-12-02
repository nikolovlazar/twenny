"use client";

import { DataTable, Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination, PaginationData } from "@/components/admin/pagination";

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

interface OrdersTableProps {
  orders: Order[];
  pagination: PaginationData;
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

  return (
    <div className="space-y-4">
      <DataTable
        data={orders}
        columns={columns}
        getItemId={(order) => order.id}
        basePath="/admin/orders"
        emptyMessage="No orders found."
      />

      <Pagination
        pagination={pagination}
        basePath="/admin/orders"
        itemName="orders"
      />
    </div>
  );
}

