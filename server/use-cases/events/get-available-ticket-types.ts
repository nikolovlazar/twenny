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
 * - Total slots = COUNT from ticket_inventory table (source of truth)
 * - Sold slots = tickets linked to inventory slots
 * - Available = Total - Sold
 */
export async function getAvailableTicketTypes(
  eventId: string
): Promise<AvailableTicketType[]> {
  const now = new Date();

  // Get ticket types for the event
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

  if (ticketTypes.length === 0) {
    return [];
  }

  const ticketTypeIds = ticketTypes.map((tt) => tt.id);

  // Get sold counts for each ticket type from tickets table
  const soldCounts = await db
    .select({
      ticketTypeId: schema.tickets.ticketTypeId,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.tickets)
    .where(
      sql`${schema.tickets.ticketTypeId} IN (${sql.join(
        ticketTypeIds.map((ttId) => sql`${ttId}`),
        sql`, `
      )})`
    )
    .groupBy(schema.tickets.ticketTypeId);

  // Get total inventory slots for each ticket type from ticket_inventory table
  const inventoryCounts = await db
    .select({
      ticketTypeId: schema.ticketInventory.ticketTypeId,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.ticketInventory)
    .where(
      sql`${schema.ticketInventory.ticketTypeId} IN (${sql.join(
        ticketTypeIds.map((ttId) => sql`${ttId}`),
        sql`, `
      )})`
    )
    .groupBy(schema.ticketInventory.ticketTypeId);

  const soldCountMap = new Map(
    soldCounts.map((sc) => [sc.ticketTypeId, sc.count])
  );

  const inventoryCountMap = new Map(
    inventoryCounts.map((ic) => [ic.ticketTypeId, ic.count])
  );

  // Filter by sale dates and calculate availability based on actual inventory slots
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

      // Check if there are tickets available based on actual inventory slots
      const sold = soldCountMap.get(tt.id) || 0;
      const totalInventorySlots = inventoryCountMap.get(tt.id) || 0;
      return totalInventorySlots > sold;
    })
    .map((tt) => {
      const quantitySold = soldCountMap.get(tt.id) || 0;
      const totalInventorySlots = inventoryCountMap.get(tt.id) || 0;
      return {
        id: tt.id,
        name: tt.name,
        description: tt.description,
        price: tt.price,
        quantity: totalInventorySlots, // Use actual inventory slot count
        quantitySold,
        quantityAvailable: totalInventorySlots - quantitySold,
        saleStartDate: tt.saleStartDate,
        saleEndDate: tt.saleEndDate,
        minQuantityPerOrder: tt.minQuantityPerOrder,
        maxQuantityPerOrder: tt.maxQuantityPerOrder,
        sortOrder: tt.sortOrder,
      };
    });

  return availableTicketTypes;
}

