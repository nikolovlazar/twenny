import { db } from "../../db";
import * as schema from "../../schema";
import { eq, sql } from "drizzle-orm";
import { findOrCreateCustomer, type CustomerInput } from "../customers/find-or-create-customer";

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
 * This function:
 * 1. Validates ticket availability
 * 2. Creates/finds customer
 * 3. Creates order
 * 4. Creates order items
 * 5. Generates individual tickets
 * 6. Updates ticket type quantities
 *
 * MVP Issues:
 * - No SELECT FOR UPDATE (race condition possible)
 * - No inventory reservation system
 * - Simple transaction handling
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  return await db.transaction(async (tx) => {
    // 1. Validate ticket types and check availability
    const ticketTypesData = await Promise.all(
      input.tickets.map(async (ticket) => {
        const ticketTypes = await tx
          .select()
          .from(schema.ticketTypes)
          .where(eq(schema.ticketTypes.id, ticket.ticketTypeId))
          .limit(1);

        if (ticketTypes.length === 0) {
          throw new Error(`Ticket type ${ticket.ticketTypeId} not found`);
        }

        const ticketType = ticketTypes[0];

        // Check availability (MVP: no lock, race condition possible)
        const available = ticketType.quantity - ticketType.quantitySold;
        if (available < ticket.quantity) {
          throw new Error(
            `Not enough tickets available for ${ticketType.name}. Available: ${available}, Requested: ${ticket.quantity}`
          );
        }

        // Check max quantity per order
        if (
          ticketType.maxQuantityPerOrder &&
          ticket.quantity > ticketType.maxQuantityPerOrder
        ) {
          throw new Error(
            `Maximum ${ticketType.maxQuantityPerOrder} tickets allowed per order for ${ticketType.name}`
          );
        }

        return {
          ...ticketType,
          requestedQuantity: ticket.quantity,
        };
      })
    );

    // Get event details for the first ticket type (assuming all from same event)
    const firstTicketType = ticketTypesData[0];
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
    ticketTypesData.forEach((tt) => {
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

    // 6. Create order items and tickets
    const allTickets: Array<{
      id: string;
      ticketCode: string;
      eventTitle: string;
      ticketTypeName: string;
      price: string;
    }> = [];

    for (const ticketTypeData of ticketTypesData) {
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

      // Generate individual tickets
      for (let i = 0; i < ticketTypeData.requestedQuantity; i++) {
        const ticketCode = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        const tickets = await tx
          .insert(schema.tickets)
          .values({
            orderId: order.id,
            orderItemId: orderItem.id,
            eventId: event.id,
            ticketTypeId: ticketTypeData.id,
            customerId: customer.id,
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

      // Update ticket type quantity sold (MVP: no lock, race condition possible)
      await tx
        .update(schema.ticketTypes)
        .set({
          quantitySold: sql`${schema.ticketTypes.quantitySold} + ${ticketTypeData.requestedQuantity}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.ticketTypes.id, ticketTypeData.id));
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

