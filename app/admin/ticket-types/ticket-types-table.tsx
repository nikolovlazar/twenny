"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationData } from "@/components/admin/pagination";
import Link from "next/link";
import { Eye, Edit } from "lucide-react";

interface TicketTypeData {
  id: string;
  name: string;
  eventId: string;
  eventTitle: string | null;
  formattedPrice: string;
  formattedQuantity: string;
  activeText: string;
}

interface TicketTypesTableProps {
  data: TicketTypeData[];
  pagination: PaginationData;
}

export function TicketTypesTable({ data, pagination }: TicketTypesTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No ticket types found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              data.map((ticketType) => (
                <TableRow key={ticketType.id}>
                  <TableCell>{ticketType.name}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/events/${ticketType.eventId}`}
                      className="text-primary hover:underline"
                    >
                      {ticketType.eventTitle}
                    </Link>
                  </TableCell>
                  <TableCell>{ticketType.formattedPrice}</TableCell>
                  <TableCell>{ticketType.formattedQuantity}</TableCell>
                  <TableCell>{ticketType.activeText}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/ticket-types/${ticketType.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/ticket-types/${ticketType.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        pagination={pagination}
        basePath="/admin/ticket-types"
        itemName="ticket types"
      />
    </div>
  );
}

