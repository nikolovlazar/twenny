"use client";

import { DataTable, Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination, PaginationData } from "@/components/admin/pagination";
import Link from "next/link";

type Ticket = {
  id: string;
  ticketCode: string;
  status: string;
  eventTitle: string;
  ticketTypeName: string;
  price: string;
  isCheckedIn: number;
  checkedInAt: Date | null;
  attendeeEmail: string | null;
  customerEmail: string | null;
  eventId: string;
  createdAt: Date;
};

interface TicketsTableProps {
  tickets: Ticket[];
  pagination: PaginationData;
}

export function TicketsTable({ tickets, pagination }: TicketsTableProps) {
  const columns: Column<Ticket>[] = [
    {
      key: "ticketCode",
      label: "Ticket Code",
    },
    {
      key: "eventTitle",
      label: "Event",
      render: (ticket) => (
        <Link
          href={`/admin/events/${ticket.eventId}`}
          className="text-primary hover:underline"
        >
          {ticket.eventTitle}
        </Link>
      ),
    },
    {
      key: "ticketTypeName",
      label: "Type",
    },
    {
      key: "attendeeEmail",
      label: "Attendee",
      render: (ticket) => ticket.attendeeEmail || ticket.customerEmail || "N/A",
    },
    {
      key: "status",
      label: "Status",
      render: (ticket) => <StatusBadge status={ticket.status} type="ticket" />,
    },
    {
      key: "isCheckedIn",
      label: "Checked In",
      render: (ticket) => (ticket.isCheckedIn === 1 ? "Yes" : "No"),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={tickets}
        columns={columns}
        getItemId={(ticket) => ticket.id}
        basePath="/admin/tickets"
        emptyMessage="No tickets found."
      />

      <Pagination
        pagination={pagination}
        basePath="/admin/tickets"
        itemName="tickets"
      />
    </div>
  );
}

