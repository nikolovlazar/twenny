"use client";

import { DataTable, Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

interface TicketsTableProps {
  tickets: Ticket[];
  pagination: Pagination;
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

  const { page, total, totalPages, hasNext, hasPrev } = pagination;
  const startItem = (page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(page * pagination.pageSize, total);

  return (
    <div className="space-y-4">
      <DataTable
        data={tickets}
        columns={columns}
        getItemId={(ticket) => ticket.id}
        basePath="/admin/tickets"
        emptyMessage="No tickets found."
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {total.toLocaleString()} tickets
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              asChild={hasPrev}
            >
              {hasPrev ? (
                <Link href={`/admin/tickets?page=${page - 1}`}>
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
                <Link href={`/admin/tickets?page=${page + 1}`}>
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

