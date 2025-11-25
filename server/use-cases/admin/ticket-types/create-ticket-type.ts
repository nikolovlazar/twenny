import { db } from "@/server/db";
import { ticketTypes } from "@/server/schema";

export interface CreateTicketTypeInput {
  eventId: string;
  name: string;
  description?: string;
  price: string;
  quantity: number;
  quantitySold?: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
  minQuantityPerOrder?: number;
  maxQuantityPerOrder?: number;
  sortOrder?: number;
  isActive: number;
}

export async function createTicketType(input: CreateTicketTypeInput) {
  const [ticketType] = await db
    .insert(ticketTypes)
    .values({
      ...input,
      quantitySold: input.quantitySold || 0,
      sortOrder: input.sortOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return ticketType;
}

