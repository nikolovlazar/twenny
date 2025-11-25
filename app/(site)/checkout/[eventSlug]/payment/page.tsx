"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/order-summary";
import { createOrderAction, getAvailableTicketTypesAction } from "@/server/actions";

interface TicketType {
  id: string;
  name: string;
  price: string;
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventSlug = params.eventSlug as string;
  const ticketsParam = searchParams.get("tickets");

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selections, setSelections] = useState<Record<string, number>>({});
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "",
    billingState: "",
    billingCountry: "",
    billingPostalCode: "",
  });

  useEffect(() => {
    if (!ticketsParam) {
      router.push(`/checkout/${eventSlug}`);
      return;
    }

    // Parse tickets
    const parsed = ticketsParam.split(",").reduce((acc, item) => {
      const [id, qty] = item.split(":");
      acc[id] = parseInt(qty, 10);
      return acc;
    }, {} as Record<string, number>);

    setSelections(parsed);

    // Parse customer data from URL
    const customer = {
      firstName: searchParams.get("firstName") || "",
      lastName: searchParams.get("lastName") || "",
      email: searchParams.get("email") || "",
      phone: searchParams.get("phone") || "",
      billingAddressLine1: searchParams.get("billingAddressLine1") || "",
      billingAddressLine2: searchParams.get("billingAddressLine2") || "",
      billingCity: searchParams.get("billingCity") || "",
      billingState: searchParams.get("billingState") || "",
      billingCountry: searchParams.get("billingCountry") || "",
      billingPostalCode: searchParams.get("billingPostalCode") || "",
    };

    if (!customer.firstName || !customer.lastName || !customer.email) {
      router.push(`/checkout/${eventSlug}/details?tickets=${ticketsParam}`);
      return;
    }

    setCustomerData(customer);

    async function loadTicketTypes() {
      try {
        // We need to get event ID first - in a real app this would be better structured
        // For now, we'll use the first ticket type ID to get event ID
        const firstTicketId = Object.keys(parsed)[0];

        // Import the action to get event details
        const { getEventDetailsAction } = await import("@/server/actions");
        const eventResult = await getEventDetailsAction(eventSlug);

        if (!eventResult.success || !eventResult.data) {
          setError("Event not found");
          return;
        }

        const ticketTypesResult = await getAvailableTicketTypesAction(eventResult.data.id);
        if (!ticketTypesResult.success) {
          setError("Failed to load ticket types");
          return;
        }

        setTicketTypes(ticketTypesResult.data || []);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTicketTypes();
  }, [eventSlug, ticketsParam, searchParams, router]);

  const handleCompletePurchase = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Prepare order data
      const tickets = Object.entries(selections).map(([ticketTypeId, quantity]) => ({
        ticketTypeId,
        quantity,
      }));

      const orderData = {
        customer: customerData,
        tickets,
        paymentMethod: "credit_card",
      };

      const result = await createOrderAction(orderData);

      if (!result.success) {
        setError(result.error || "Failed to create order");
        return;
      }

      // Redirect to confirmation page
      router.push(`/checkout/${eventSlug}/confirmation?orderId=${result.data.orderId}`);
    } catch (err) {
      setError("An error occurred while processing your order");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (error && !submitting) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  // Calculate order summary
  const orderItems = Object.entries(selections)
    .map(([ticketTypeId, quantity]) => {
      const ticketType = ticketTypes.find((tt) => tt.id === ticketTypeId);
      if (!ticketType) return null;
      return {
        name: ticketType.name,
        quantity,
        price: ticketType.price,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotal = orderItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const fees = subtotal * 0.05;
  const total = subtotal + tax + fees;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
              ✓
            </div>
            <span className="mt-2 text-sm text-zinc-600">Tickets</span>
          </div>
          <div className="h-px w-16 bg-zinc-300" />
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
              ✓
            </div>
            <span className="mt-2 text-sm text-zinc-600">Details</span>
          </div>
          <div className="h-px w-16 bg-zinc-300" />
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
              3
            </div>
            <span className="mt-2 text-sm font-medium text-zinc-900">Payment</span>
          </div>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-zinc-900">Complete Your Purchase</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Payment Info */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900">
                Customer Information
              </h2>
              <div className="mb-6 space-y-2 text-sm">
                <p className="text-zinc-600">
                  <span className="font-medium text-zinc-900">Name:</span>{" "}
                  {customerData.firstName} {customerData.lastName}
                </p>
                <p className="text-zinc-600">
                  <span className="font-medium text-zinc-900">Email:</span>{" "}
                  {customerData.email}
                </p>
                {customerData.phone && (
                  <p className="text-zinc-600">
                    <span className="font-medium text-zinc-900">Phone:</span>{" "}
                    {customerData.phone}
                  </p>
                )}
              </div>

              <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-8">
                <div className="text-center">
                  <div className="mb-4 text-4xl">💳</div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                    Fake Payment for MVP
                  </h3>
                  <p className="mb-6 text-sm text-zinc-600">
                    This is a demo checkout. No real payment will be processed.
                    Click the button below to complete your order.
                  </p>
                  <Button
                    onClick={handleCompletePurchase}
                    disabled={submitting}
                    size="lg"
                    className="w-full max-w-md"
                  >
                    {submitting ? "Processing..." : "Complete Purchase"}
                  </Button>
                  {error && (
                    <p className="mt-4 text-sm text-red-600">{error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={orderItems}
              subtotal={subtotal}
              tax={tax}
              fees={fees}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

