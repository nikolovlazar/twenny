import { db } from "../../db";
import * as schema from "../../schema";
import { eq, and } from "drizzle-orm";

export interface CustomerInput {
  userId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
}

export interface Customer {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  billingAddressLine1: string | null;
  billingAddressLine2: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingCountry: string | null;
  billingPostalCode: string | null;
}

/**
 * Find existing customer or create a new one
 *
 * For authenticated users: find by userId
 * For guest users: find by email or create new
 *
 * MVP Issues:
 * - No deduplication logic for guest users
 * - Simple email matching (case sensitive)
 */
export async function findOrCreateCustomer(
  input: CustomerInput
): Promise<Customer> {
  // If userId is provided, try to find by userId first
  if (input.userId) {
    const existingCustomers = await db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.userId, input.userId))
      .limit(1);

    if (existingCustomers.length > 0) {
      return existingCustomers[0];
    }
  }

  // For guest users or if userId not found, check by email
  const existingByEmail = await db
    .select()
    .from(schema.customers)
    .where(
      and(
        eq(schema.customers.email, input.email),
        input.userId ? eq(schema.customers.userId, input.userId) : undefined
      )
    )
    .limit(1);

  if (existingByEmail.length > 0) {
    // Update the existing customer with new information
    const updated = await db
      .update(schema.customers)
      .set({
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null,
        billingAddressLine1: input.billingAddressLine1 || null,
        billingAddressLine2: input.billingAddressLine2 || null,
        billingCity: input.billingCity || null,
        billingState: input.billingState || null,
        billingCountry: input.billingCountry || null,
        billingPostalCode: input.billingPostalCode || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.customers.id, existingByEmail[0].id))
      .returning();

    return updated[0];
  }

  // Create new customer
  const newCustomers = await db
    .insert(schema.customers)
    .values({
      userId: input.userId || null,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || null,
      billingAddressLine1: input.billingAddressLine1 || null,
      billingAddressLine2: input.billingAddressLine2 || null,
      billingCity: input.billingCity || null,
      billingState: input.billingState || null,
      billingCountry: input.billingCountry || null,
      billingPostalCode: input.billingPostalCode || null,
    })
    .returning();

  return newCustomers[0];
}

