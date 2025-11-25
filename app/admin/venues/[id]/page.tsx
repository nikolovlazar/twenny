import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getVenue } from "@/server/use-cases/admin/venues/get-venue";
import { notFound } from "next/navigation";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getVenue(id);

  if (!venue) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={venue.name}
        breadcrumbs={[
          { label: "Venues", href: "/admin/venues" },
          { label: venue.name },
        ]}
      />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="mt-1">{venue.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Type</dt>
              <dd className="mt-1">{venue.isVirtual === 1 ? "Virtual" : "Physical"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Capacity</dt>
              <dd className="mt-1">{venue.capacity?.toLocaleString() || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Timezone</dt>
              <dd className="mt-1">{venue.timezone}</dd>
            </div>
          </dl>
        </Card>

        {venue.description && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground">{venue.description}</p>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Address Line 1</dt>
              <dd className="mt-1">{venue.addressLine1 || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Address Line 2</dt>
              <dd className="mt-1">{venue.addressLine2 || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">City</dt>
              <dd className="mt-1">{venue.city || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">State</dt>
              <dd className="mt-1">{venue.state || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Country</dt>
              <dd className="mt-1">{venue.country || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Postal Code</dt>
              <dd className="mt-1">{venue.postalCode || "N/A"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd className="mt-1">{venue.phone || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1">{venue.email || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Website</dt>
              <dd className="mt-1">
                {venue.website ? (
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {venue.website}
                  </a>
                ) : (
                  "N/A"
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/admin/venues/${venue.id}/edit`}>Edit Venue</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/venues">Back to Venues</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

