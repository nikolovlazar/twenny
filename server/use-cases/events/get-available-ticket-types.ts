import { db } from "../../db";
import * as schema from "../../schema";
import { eq, and, sql, notInArray } from "drizzle-orm";

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
 * Calculates availability from inventory slots:
 * - Total slots = quantity (from ticket_inventory count)
 * - Sold slots = tickets linked to inventory slots
 * - Available = Total - Sold
 */
export async function getAvailableTicketTypes(
  eventId: string
): Promise<AvailableTicketType[]> {
  const now = new Date();

  // Get ticket types with sold count calculated from tickets table
  const ticketTypes = await db
    .select({
      id: schema.ticketTypes.id,
      name: schema.ticketTypes.name,
      description: schema.ticketTypes.description,
      price: schema.ticketTypes.price,
      quantity: schema.ticketTypes.quantity,
      saleStartDate: schema.ticketTypes.saleStartDate,
      saleEndDate: schema.ticketTypes.saleEndDate,
      minQuantityPerOrder: schema.ticketTypes.minQuantityPerOrder,
      maxQuantityPerOrder: schema.ticketTypes.maxQuantityPerOrder,
      sortOrder: schema.ticketTypes.sortOrder,
    })
    .from(schema.ticketTypes)
    .where(
      and(
        eq(schema.ticketTypes.eventId, eventId),
        eq(schema.ticketTypes.isActive, 1)
      )
    )
    .orderBy(schema.ticketTypes.sortOrder);

  // Get sold counts for each ticket type
  const soldCounts = await db
    .select({
      ticketTypeId: schema.tickets.ticketTypeId,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.tickets)
    .where(
      sql`${schema.tickets.ticketTypeId} IN (${sql.join(
        ticketTypes.map((tt) => sql`${tt.id}`),
        sql`, `
      )})`
    )
    .groupBy(schema.tickets.ticketTypeId);

  const soldCountMap = new Map(
    soldCounts.map((sc) => [sc.ticketTypeId, sc.count])
  );

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
      const sold = soldCountMap.get(tt.id) || 0;
      return tt.quantity > sold;
    })
    .map((tt) => {
      const quantitySold = soldCountMap.get(tt.id) || 0;
      return {
        id: tt.id,
        name: tt.name,
        description: tt.description,
        price: tt.price,
        quantity: tt.quantity,
        quantitySold,
        quantityAvailable: tt.quantity - quantitySold,
        saleStartDate: tt.saleStartDate,
        saleEndDate: tt.saleEndDate,
        minQuantityPerOrder: tt.minQuantityPerOrder,
        maxQuantityPerOrder: tt.maxQuantityPerOrder,
        sortOrder: tt.sortOrder,
      };
    });

  return availableTicketTypes;
}

