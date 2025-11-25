import { db } from "../../db";
import * as schema from "../../schema";
import { eq, and } from "drizzle-orm";

export interface AvailableTicketType {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantity: number;
  quantitySold: number;
  quantityAvailable: number;
  saleStartDate: Date | null;
  saleEndDate: Date | null;
  minQuantityPerOrder: number | null;
  maxQuantityPerOrder: number | null;
  sortOrder: number;
}

/**
 * Get available ticket types for an event
 *
 * MVP Issues:
 * - No caching
 * - Sale date checks could be optimized
 */
export async function getAvailableTicketTypes(
  eventId: string
): Promise<AvailableTicketType[]> {
  const now = new Date();

  const ticketTypes = await db
    .select()
    .from(schema.ticketTypes)
    .where(
      and(
        eq(schema.ticketTypes.eventId, eventId),
        eq(schema.ticketTypes.isActive, 1)
      )
    )
    .orderBy(schema.ticketTypes.sortOrder);

  // Filter by sale dates and calculate availability
  const availableTicketTypes = ticketTypes
    .filter((tt) => {
      // Check if sale has started
      if (tt.saleStartDate && tt.saleStartDate > now) {
        return false;
      }

      // Check if sale has ended
      if (tt.saleEndDate && tt.saleEndDate < now) {
        return false;
      }

      // Check if there are tickets available
      return tt.quantity > tt.quantitySold;
    })
    .map((tt) => ({
      id: tt.id,
      name: tt.name,
      description: tt.description,
      price: tt.price,
      quantity: tt.quantity,
      quantitySold: tt.quantitySold,
      quantityAvailable: tt.quantity - tt.quantitySold,
      saleStartDate: tt.saleStartDate,
      saleEndDate: tt.saleEndDate,
      minQuantityPerOrder: tt.minQuantityPerOrder,
      maxQuantityPerOrder: tt.maxQuantityPerOrder,
      sortOrder: tt.sortOrder,
    }));

  return availableTicketTypes;
}

