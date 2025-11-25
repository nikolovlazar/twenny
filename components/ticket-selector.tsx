"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantityAvailable: number;
  maxQuantityPerOrder: number | null;
}

interface TicketSelectorProps {
  ticketTypes: TicketType[];
  onContinue: (selections: Record<string, number>) => void;
}

export function TicketSelector({ ticketTypes, onContinue }: TicketSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleIncrement = (ticketTypeId: string, max: number) => {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      if (current < max) {
        return { ...prev, [ticketTypeId]: current + 1 };
      }
      return prev;
    });
  };

  const handleDecrement = (ticketTypeId: string) => {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      if (current > 0) {
        return { ...prev, [ticketTypeId]: current - 1 };
      }
      return prev;
    });
  };

  const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const subtotal = ticketTypes.reduce((sum, tt) => {
    const qty = quantities[tt.id] || 0;
    return sum + parseFloat(tt.price) * qty;
  }, 0);

  const handleContinue = () => {
    const selections = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .reduce((acc, [id, qty]) => ({ ...acc, [id]: qty }), {});

    if (Object.keys(selections).length === 0) {
      alert("Please select at least one ticket");
      return;
    }

    onContinue(selections);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {ticketTypes.map((ticketType) => {
          const quantity = quantities[ticketType.id] || 0;
          const maxQty = Math.min(
            ticketType.quantityAvailable,
            ticketType.maxQuantityPerOrder || ticketType.quantityAvailable
          );

          return (
            <div
              key={ticketType.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900">{ticketType.name}</h3>
                {ticketType.description && (
                  <p className="text-sm text-zinc-600">{ticketType.description}</p>
                )}
                <p className="mt-1 text-lg font-semibold text-zinc-900">
                  ${parseFloat(ticketType.price).toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500">
                  {ticketType.quantityAvailable} available
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleDecrement(ticketType.id)}
                  disabled={quantity === 0}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleIncrement(ticketType.id, maxQty)}
                  disabled={quantity >= maxQty}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {totalQuantity > 0 && (
        <div className="rounded-lg border bg-zinc-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium text-zinc-700">Subtotal ({totalQuantity} tickets)</span>
            <span className="text-xl font-semibold text-zinc-900">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <Button onClick={handleContinue} className="w-full" size="lg">
            Continue to Details
          </Button>
        </div>
      )}
    </div>
  );
}

