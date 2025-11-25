"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CustomerForm, type CustomerFormData } from "@/components/customer-form";
import { OrderSummary } from "@/components/order-summary";
import { getEventDetailsAction, getAvailableTicketTypesAction } from "@/server/actions";

interface TicketType {
  id: string;
  name: string;
  price: string;
}

export default function CheckoutDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventSlug = params.eventSlug as string;
  const ticketsParam = searchParams.get("tickets");

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selections, setSelections] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!ticketsParam) {
      router.push(`/checkout/${eventSlug}`);
      return;
    }

    // Parse tickets parameter
    const parsed = ticketsParam.split(",").reduce((acc, item) => {
      const [id, qty] = item.split(":");
      acc[id] = parseInt(qty, 10);
      return acc;
    }, {} as Record<string, number>);

    setSelections(parsed);

    async function loadData() {
      try {
        const eventResult = await getEventDetailsAction(eventSlug);
        if (!eventResult.success || !eventResult.data) {
          setError("Event not found");
          return;
        }

        setEventTitle(eventResult.data.title);

        const ticketTypesResult = await getAvailableTicketTypesAction(eventResult.data.id);
        if (!ticketTypesResult.success) {
          setError("Failed to load ticket types");
          return;
        }

        setTicketTypes(ticketTypesResult.data || []);
      } catch (err) {
        setError("Failed to load event details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventSlug, ticketsParam, router]);

  const handleSubmit = (formData: CustomerFormData) => {
    // Encode customer data as URL parameters
    const customerData = new URLSearchParams({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || "",
      billingAddressLine1: formData.billingAddressLine1 || "",
      billingAddressLine2: formData.billingAddressLine2 || "",
      billingCity: formData.billingCity || "",
      billingState: formData.billingState || "",
      billingCountry: formData.billingCountry || "",
      billingPostalCode: formData.billingPostalCode || "",
    });

    router.push(
      `/checkout/${eventSlug}/payment?tickets=${ticketsParam}&${customerData.toString()}`
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (error || !ticketsParam) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-red-600">{error || "Invalid checkout session"}</p>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
              2
            </div>
            <span className="mt-2 text-sm font-medium text-zinc-900">Details</span>
          </div>
          <div className="h-px w-16 bg-zinc-300" />
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-300 text-zinc-600">
              3
            </div>
            <span className="mt-2 text-sm text-zinc-600">Payment</span>
          </div>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-zinc-900">{eventTitle}</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Customer Form */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white p-6">
              <CustomerForm onSubmit={handleSubmit} />
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

