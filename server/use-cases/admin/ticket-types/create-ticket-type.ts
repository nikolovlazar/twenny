import { db } from "@/server/db";
import { ticketTypes, ticketInventory } from "@/server/schema";

export interface CreateTicketTypeInput {
  eventId: string;
  name: string;
  description?: string;
  price: string;
  quantity: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
  minQuantityPerOrder?: number;
  maxQuantityPerOrder?: number;
  sortOrder?: number;
  isActive: number;
}

export async function createTicketType(input: CreateTicketTypeInput) {
  // Use a transaction to create ticket type and inventory slots together
  return await db.transaction(async (tx) => {
    // 1. Create the ticket type
    const [ticketType] = await tx
      .insert(ticketTypes)
      .values({
        ...input,
        sortOrder: input.sortOrder || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 2. Create inventory slots for this ticket type
    // Each slot represents a single ticket that can be sold
    const inventorySlots = Array.from({ length: input.quantity }, () => ({
      ticketTypeId: ticketType.id,
      createdAt: new Date(),
    }));

    if (inventorySlots.length > 0) {
      await tx.insert(ticketInventory).values(inventorySlots);
    }

    return ticketType;
  });
}

