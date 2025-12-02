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
import { StatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import { Eye, Edit } from "lucide-react";

interface EventData {
  id: string;
  title: string;
  venueName: string;
  formattedStartDate: string;
  status: string;
  publishedText: string;
  formattedCapacity: string;
}

interface EventsTableProps {
  data: EventData[];
  pagination: PaginationData;
}

export function EventsTable({ data, pagination }: EventsTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No events found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              data.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.venueName}</TableCell>
                  <TableCell>{event.formattedStartDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={event.status} type="event" />
                  </TableCell>
                  <TableCell>{event.publishedText}</TableCell>
                  <TableCell>{event.formattedCapacity}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/events/${event.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/events/${event.id}/edit`}>
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
        basePath="/admin/events"
        itemName="events"
      />
    </div>
  );
}



