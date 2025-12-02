import { db } from "../../db";
import * as schema from "../../schema";
import { eq, notInArray, and } from "drizzle-orm";
import {
  findOrCreateCustomer,
  type CustomerInput,
} from "../customers/find-or-create-customer";

export interface TicketSelection {
  ticketTypeId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customer: CustomerInput;
  tickets: TicketSelection[];
  paymentMethod?: string;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  customerId: string;
  total: string;
  tickets: Array<{
    id: string;
    ticketCode: string;
    eventTitle: string;
    ticketTypeName: string;
    price: string;
  }>;
}

/**
 * Create a complete order with tickets
 *
 * This function uses pre-allocated inventory slots:
 * 1. Query available inventory slots (NO LOCK - enables race condition!)
 * 2. Creates/finds customer
 * 3. Creates order and order items
 * 4. Claims inventory slots by creating tickets with inventorySlotId
 * 5. UNIQUE constraint on inventorySlotId throws error if slot already claimed
 *
 * RACE CONDITION:
 * Two users can query the same slots as "available", but only one can
 * successfully INSERT a ticket claiming that slot. The second user gets
 * a unique constraint violation - which Sentry captures!
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  return await db.transaction(async (tx) => {
    // 1. Validate ticket types and find available inventory slots
    // IMPORTANT: No SELECT FOR UPDATE here - this enables the race condition!
    const ticketTypesWithSlots = await Promise.all(
      input.tickets.map(async (ticket) => {
        // Get ticket type info
        const ticketTypes = await tx
          .select()
          .from(schema.ticketTypes)
          .where(eq(schema.ticketTypes.id, ticket.ticketTypeId))
          .limit(1);

        if (ticketTypes.length === 0) {
          throw new Error(`Ticket type ${ticket.ticketTypeId} not found`);
        }

        const ticketType = ticketTypes[0];

        // Check max quantity per order
        if (
          ticketType.maxQuantityPerOrder &&
          ticket.quantity > ticketType.maxQuantityPerOrder
        ) {
          throw new Error(
            `Maximum ${ticketType.maxQuantityPerOrder} tickets allowed per order for ${ticketType.name}`
          );
        }

        // Find available inventory slots (slots not yet claimed by any ticket)
        // NO LOCK HERE - both users will get the same slots!
        const claimedSlotIds = tx
          .select({ id: schema.tickets.inventorySlotId })
          .from(schema.tickets);

        const availableSlots = await tx
          .select()
          .from(schema.ticketInventory)
          .where(
            and(
              eq(schema.ticketInventory.ticketTypeId, ticket.ticketTypeId),
              notInArray(schema.ticketInventory.id, claimedSlotIds)
            )
          )
          .limit(ticket.quantity);

        // Check if we have enough available slots
        if (availableSlots.length < ticket.quantity) {
          throw new Error(
            `Not enough tickets available for ${ticketType.name}. Available: ${availableSlots.length}, Requested: ${ticket.quantity}`
          );
        }

        return {
          ...ticketType,
          requestedQuantity: ticket.quantity,
          inventorySlots: availableSlots,
        };
      })
    );

    // Get event details for the first ticket type (assuming all from same event)
    const firstTicketType = ticketTypesWithSlots[0];
    const events = await tx
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, firstTicketType.eventId))
      .limit(1);

    if (events.length === 0) {
      throw new Error("Event not found");
    }

    const event = events[0];

    // 2. Find or create customer
    const customer = await findOrCreateCustomer(input.customer);

    // 3. Calculate order totals
    let subtotal = 0;
    ticketTypesWithSlots.forEach((tt) => {
      subtotal += parseFloat(tt.price) * tt.requestedQuantity;
    });

    const tax = subtotal * 0.08; // 8% tax
    const fees = subtotal * 0.05; // 5% service fee
    const total = subtotal + tax + fees;

    // 4. Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 5. Create order
    const orders = await tx
      .insert(schema.orders)
      .values({
        customerId: customer.id,
        orderNumber,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: input.paymentMethod || "credit_card",
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        fees: fees.toFixed(2),
        total: total.toFixed(2),
        currency: event.currency,
        customerEmail: customer.email,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerPhone: customer.phone,
      })
      .returning();

    const order = orders[0];

    // 6. Create order items and claim inventory slots by creating tickets
    const allTickets: Array<{
      id: string;
      ticketCode: string;
      eventTitle: string;
      ticketTypeName: string;
      price: string;
    }> = [];

    for (const ticketTypeData of ticketTypesWithSlots) {
      const unitPrice = parseFloat(ticketTypeData.price);
      const itemSubtotal = unitPrice * ticketTypeData.requestedQuantity;

      // Create order item
      const orderItems = await tx
        .insert(schema.orderItems)
        .values({
          orderId: order.id,
          ticketTypeId: ticketTypeData.id,
          quantity: ticketTypeData.requestedQuantity,
          unitPrice: unitPrice.toFixed(2),
          subtotal: itemSubtotal.toFixed(2),
          ticketTypeName: ticketTypeData.name,
        })
        .returning();

      const orderItem = orderItems[0];

      // Claim inventory slots by creating tickets
      // If another user already claimed a slot, this INSERT will fail with
      // UNIQUE CONSTRAINT VIOLATION on inventory_slot_id - Sentry captures this!
      for (let i = 0; i < ticketTypeData.requestedQuantity; i++) {
        const inventorySlot = ticketTypeData.inventorySlots[i];
        const ticketCode = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        const tickets = await tx
          .insert(schema.tickets)
          .values({
            orderId: order.id,
            orderItemId: orderItem.id,
            eventId: event.id,
            ticketTypeId: ticketTypeData.id,
            customerId: customer.id,
            inventorySlotId: inventorySlot.id, // Claim this slot!
            ticketCode,
            status: "valid",
            eventTitle: event.title,
            ticketTypeName: ticketTypeData.name,
            price: unitPrice.toFixed(2),
          })
          .returning();

        allTickets.push({
          id: tickets[0].id,
          ticketCode: tickets[0].ticketCode,
          eventTitle: tickets[0].eventTitle,
          ticketTypeName: tickets[0].ticketTypeName,
          price: tickets[0].price,
        });
      }
    }

    // 7. Mark order as completed (fake payment for MVP)
    await tx
      .update(schema.orders)
      .set({
        status: "completed",
        paymentStatus: "completed",
        paymentIntentId: `pi_fake_${Date.now()}`,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, order.id));

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: customer.id,
      total: total.toFixed(2),
      tickets: allTickets,
    };
  });
}

