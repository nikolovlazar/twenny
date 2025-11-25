import { db } from "@/server/db";
import { customers } from "@/server/schema";
import { eq } from "drizzle-orm";

export interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const [customer] = await db
    .update(customers)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning();
  return customer;
}

