"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { updateOrderItemAction } from "./actions";

interface OrderItemFormProps {
  item: any;
}

export function OrderItemForm({ item }: OrderItemFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateOrderItemAction.bind(null, item.id),
    null
  );

  return (
    <form action={formAction}>
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Item Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  defaultValue={item.quantity}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="unitPrice">Unit Price *</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  defaultValue={item.unitPrice}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="subtotal">Subtotal *</Label>
                <Input
                  id="subtotal"
                  name="subtotal"
                  type="number"
                  step="0.01"
                  defaultValue={item.subtotal}
                  required
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </Card>

        {state?.error && (
          <div className="text-sm text-destructive">{state.error}</div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Update Order Item"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

