"use client";

import { DataTable, Column } from "@/components/admin/data-table";

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
}

export function VenuesTable({ venues }: VenuesTableProps) {
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
    <DataTable
      data={venues}
      columns={columns}
      getItemId={(venue) => venue.id}
      basePath="/admin/venues"
      emptyMessage="No venues found. Create one to get started."
    />
  );
}

