"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { updateCustomerAction } from "./actions";

interface CustomerFormProps {
  customer: any;
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateCustomerAction.bind(null, customer.id),
    null
  );

  return (
    <form action={formAction}>
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={customer.firstName}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={customer.lastName}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={customer.email}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={customer.phone || ""}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="billingAddressLine1">Address Line 1</Label>
              <Input
                id="billingAddressLine1"
                name="billingAddressLine1"
                defaultValue={customer.billingAddressLine1 || ""}
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="billingAddressLine2">Address Line 2</Label>
              <Input
                id="billingAddressLine2"
                name="billingAddressLine2"
                defaultValue={customer.billingAddressLine2 || ""}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billingCity">City</Label>
                <Input
                  id="billingCity"
                  name="billingCity"
                  defaultValue={customer.billingCity || ""}
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="billingState">State</Label>
                <Input
                  id="billingState"
                  name="billingState"
                  defaultValue={customer.billingState || ""}
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="billingCountry">Country</Label>
                <Input
                  id="billingCountry"
                  name="billingCountry"
                  defaultValue={customer.billingCountry || ""}
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="billingPostalCode">Postal Code</Label>
                <Input
                  id="billingPostalCode"
                  name="billingPostalCode"
                  defaultValue={customer.billingPostalCode || ""}
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
            {isPending ? "Saving..." : "Update Customer"}
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

