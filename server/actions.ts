"use server";

import { z } from "zod";
import { listEvents, type ListEventsParams } from "./use-cases/events/list-events";
import { getEventBySlug } from "./use-cases/events/get-event-by-slug";
import { getAvailableTicketTypes } from "./use-cases/events/get-available-ticket-types";
import { createOrder, type CreateOrderInput } from "./use-cases/orders/create-order";
import { getOrderDetails } from "./use-cases/orders/get-order-details";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const searchEventsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const customerSchema = z.object({
  userId: z.string().optional().nullable(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingCountry: z.string().optional(),
  billingPostalCode: z.string().optional(),
});

const ticketSelectionSchema = z.object({
  ticketTypeId: z.string().uuid("Valid ticket type ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

const createOrderSchema = z.object({
  customer: customerSchema,
  tickets: z.array(ticketSelectionSchema).min(1, "At least one ticket is required"),
  paymentMethod: z.string().optional(),
});

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Search and list events with filters
 */
export async function searchEventsAction(params: unknown) {
  try {
    const validated = searchEventsSchema.parse(params);

    const searchParams: ListEventsParams = {
      search: validated.search,
      category: validated.category,
      dateFrom: validated.dateFrom ? new Date(validated.dateFrom) : undefined,
      dateTo: validated.dateTo ? new Date(validated.dateTo) : undefined,
      page: validated.page,
      limit: validated.limit,
    };

    const result = await listEvents(searchParams);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input parameters",
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search events",
    };
  }
}

/**
 * Get event details by slug
 */
export async function getEventDetailsAction(slug: string) {
  try {
    if (!slug || typeof slug !== "string") {
      return {
        success: false,
        error: "Invalid event slug",
      };
    }

    const event = await getEventBySlug(slug);

    if (!event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch event details",
    };
  }
}

/**
 * Get available ticket types for an event
 */
export async function getAvailableTicketTypesAction(eventId: string) {
  try {
    if (!eventId || typeof eventId !== "string") {
      return {
        success: false,
        error: "Invalid event ID",
      };
    }

    const ticketTypes = await getAvailableTicketTypes(eventId);

    return {
      success: true,
      data: ticketTypes,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch ticket types",
    };
  }
}

/**
 * Create a new order with tickets
 */
export async function createOrderAction(input: unknown) {
  try {
    const validated = createOrderSchema.parse(input);

    const orderInput: CreateOrderInput = {
      customer: {
        userId: validated.customer.userId,
        firstName: validated.customer.firstName,
        lastName: validated.customer.lastName,
        email: validated.customer.email,
        phone: validated.customer.phone,
        billingAddressLine1: validated.customer.billingAddressLine1,
        billingAddressLine2: validated.customer.billingAddressLine2,
        billingCity: validated.customer.billingCity,
        billingState: validated.customer.billingState,
        billingCountry: validated.customer.billingCountry,
        billingPostalCode: validated.customer.billingPostalCode,
      },
      tickets: validated.tickets,
      paymentMethod: validated.paymentMethod,
    };

    const result = await createOrder(orderInput);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid order data",
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

/**
 * Get order details by order ID
 */
export async function getOrderDetailsAction(orderId: string) {
  try {
    if (!orderId || typeof orderId !== "string") {
      return {
        success: false,
        error: "Invalid order ID",
      };
    }

    const order = await getOrderDetails(orderId);

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch order details",
    };
  }
}
