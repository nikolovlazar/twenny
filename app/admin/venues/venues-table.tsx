"use client";

import { DataTable, Column } from "@/components/admin/data-table";
import { Pagination, PaginationData } from "@/components/admin/pagination";

type Venue = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  capacity: number | null;
  isVirtual: number;
  address: string | null;
  onlineUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface VenuesTableProps {
  venues: Venue[];
  pagination: PaginationData;
}

export function VenuesTable({ venues, pagination }: VenuesTableProps) {
  const columns: Column<Venue>[] = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "city",
      label: "City",
    },
    {
      key: "country",
      label: "Country",
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (venue) => venue.capacity?.toLocaleString() || "N/A",
    },
    {
      key: "isVirtual",
      label: "Type",
      render: (venue) => (venue.isVirtual === 1 ? "Virtual" : "Physical"),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={venues}
        columns={columns}
        getItemId={(venue) => venue.id}
        basePath="/admin/venues"
        emptyMessage="No venues found. Create one to get started."
      />

      <Pagination
        pagination={pagination}
        basePath="/admin/venues"
        itemName="venues"
      />
    </div>
  );
}

