import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getOrderDetailsAction } from "@/server/actions";
import { CheckCircleIcon, TicketIcon } from "lucide-react";

interface ConfirmationPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;

  if (!params.orderId) {
    notFound();
  }

  const result = await getOrderDetailsAction(params.orderId);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Success Message */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircleIcon className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900">
            Order Confirmed!
          </h1>
          <p className="text-lg text-zinc-600">
            Your tickets have been sent to{" "}
            <span className="font-medium text-zinc-900">{order.customerEmail}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="mb-6 rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm text-zinc-600">Order Number</p>
              <p className="text-xl font-semibold text-zinc-900">
                {order.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-600">Total Paid</p>
              <p className="text-xl font-semibold text-zinc-900">
                ${parseFloat(order.total).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Status</span>
              <span className="font-medium capitalize text-green-600">
                {order.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Payment Status</span>
              <span className="font-medium capitalize text-green-600">
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Order Date</span>
              <span className="font-medium text-zinc-900">
                {new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date(order.createdAt))}
              </span>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="mb-8 rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <TicketIcon className="h-5 w-5 text-zinc-600" />
            <h2 className="text-xl font-semibold text-zinc-900">Your Tickets</h2>
          </div>

          <div className="space-y-4">
            {order.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-lg border bg-zinc-50 p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-900">
                      {ticket.eventTitle}
                    </h3>
                    <p className="text-sm text-zinc-600">{ticket.ticketTypeName}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {ticket.status}
                  </span>
                </div>
                <div className="rounded bg-white p-3">
                  <p className="text-xs text-zinc-500">Ticket Code</p>
                  <p className="font-mono text-sm font-medium text-zinc-900">
                    {ticket.ticketCode}
                  </p>
                </div>
                <div className="mt-3 rounded-lg border-2 border-dashed border-zinc-300 bg-white p-4 text-center">
                  <p className="text-xs text-zinc-500">QR Code Placeholder</p>
                  <div className="my-2 text-4xl">📱</div>
                  <p className="text-xs text-zinc-500">
                    QR code will be available in future version
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8 rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900">
            Customer Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Name</span>
              <span className="font-medium text-zinc-900">
                {order.customerFirstName} {order.customerLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Email</span>
              <span className="font-medium text-zinc-900">
                {order.customerEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">What's Next?</h3>
          <ul className="mb-4 space-y-2 text-sm text-blue-800">
            <li>• Check your email for ticket confirmation</li>
            <li>• Save your ticket codes for event entry</li>
            <li>• Arrive early on the event day</li>
            <li>• Have your ticket ready at the entrance</li>
          </ul>
          <div className="flex gap-3">
            <Link href="/events" className="flex-1">
              <Button variant="outline" className="w-full">
                Browse More Events
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

