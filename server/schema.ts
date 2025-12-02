import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  decimal,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================
// BETTER-AUTH TABLES
// ============================================
// Import Better-Auth tables for authentication
export * from "../auth-schema";

// ============================================
// ENUMS
// ============================================

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "cancelled",
  "completed",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "completed",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "valid",
  "used",
  "cancelled",
  "refunded",
]);

// ============================================
// TABLES
// ============================================

// Venues - Physical or virtual locations where events take place
export const venues = pgTable(
  "venues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    // Address fields
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    country: varchar("country", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),
    // Venue details
    capacity: integer("capacity"), // Total capacity (null for virtual venues)
    timezone: varchar("timezone", { length: 50 }).notNull().default("UTC"),
    isVirtual: integer("is_virtual").notNull().default(0), // 0 = physical, 1 = virtual
    // Contact information
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 500 }),
    // Metadata
    imageUrl: varchar("image_url", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Intentionally removed indexes for demo purposes:
    // - nameIdx: Makes name filtering slow
    // - cityIdx: Makes city filtering slow
    // This creates slow pagination/filtering that Sentry can detect!
  })
);

// Events - Main events that customers can purchase tickets for
export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "restrict" }),
    // Basic event information
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    shortDescription: varchar("short_description", { length: 500 }),
    // Date and time
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    timezone: varchar("timezone", { length: 50 }).notNull(),
    // Status and visibility
    status: eventStatusEnum("status").notNull().default("draft"),
    isPublished: integer("is_published").notNull().default(0), // 0 = not published, 1 = published
    publishedAt: timestamp("published_at"),
    // Capacity and inventory
    totalCapacity: integer("total_capacity").notNull(), // Total tickets available
    // Pricing
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    // Media
    bannerImageUrl: varchar("banner_image_url", { length: 500 }),
    thumbnailImageUrl: varchar("thumbnail_image_url", { length: 500 }),
    // Additional information
    category: varchar("category", { length: 100 }),
    tags: text("tags"), // JSON array of tags
    ageRestriction: varchar("age_restriction", { length: 50 }),
    // SEO and metadata
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: varchar("meta_description", { length: 500 }),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("events_slug_idx").on(table.slug),
    venueIdIdx: index("events_venue_id_idx").on(table.venueId),
    // Intentionally removed indexes for demo purposes:
    // - startDateIdx: Makes ORDER BY start_date slow
    // - statusIdx: Makes WHERE status = 'published' slow
    // - categoryIdx: Makes WHERE category = ? slow
    // This creates slow pagination that Sentry can detect!
  })
);

// Ticket Types - Different tiers/types of tickets for each event
export const ticketTypes = pgTable(
  "ticket_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    // Ticket type information
    name: varchar("name", { length: 255 }).notNull(), // e.g., "VIP", "General Admission", "Early Bird"
    description: text("description"),
    // Pricing
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    // Inventory - quantity defines how many inventory slots to create
    quantity: integer("quantity").notNull(), // Total available (creates this many inventory slots)
    // Sale period
    saleStartDate: timestamp("sale_start_date"),
    saleEndDate: timestamp("sale_end_date"),
    // Purchase limits
    minQuantityPerOrder: integer("min_quantity_per_order").default(1),
    maxQuantityPerOrder: integer("max_quantity_per_order").default(10),
    // Display order
    sortOrder: integer("sort_order").notNull().default(0),
    // Status
    isActive: integer("is_active").notNull().default(1), // 0 = inactive, 1 = active
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdIdx: index("ticket_types_event_id_idx").on(table.eventId),
    eventIdSortOrderIdx: index("ticket_types_event_id_sort_order_idx").on(
      table.eventId,
      table.sortOrder
    ),
  })
);

// Ticket Inventory - Pre-allocated slots for each ticket type
// Each row represents a single ticket that can be sold
export const ticketInventory = pgTable(
  "ticket_inventory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketTypeId: uuid("ticket_type_id")
      .notNull()
      .references(() => ticketTypes.id, { onDelete: "cascade" }),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    ticketTypeIdIdx: index("ticket_inventory_ticket_type_id_idx").on(
      table.ticketTypeId
    ),
  })
);

// Customers - People who purchase tickets (may or may not have user accounts)
export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Link to auth user (nullable for guest checkout)
    userId: varchar("user_id", { length: 255 }), // better-auth user id
    // Customer information
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    // Billing address
    billingAddressLine1: varchar("billing_address_line1", { length: 255 }),
    billingAddressLine2: varchar("billing_address_line2", { length: 255 }),
    billingCity: varchar("billing_city", { length: 100 }),
    billingState: varchar("billing_state", { length: 100 }),
    billingCountry: varchar("billing_country", { length: 100 }),
    billingPostalCode: varchar("billing_postal_code", { length: 20 }),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Intentionally removed indexes for demo purposes:
    // - emailIdx: Makes email lookups slow
    // - userIdIdx: Makes user_id lookups slow
    // This creates slow pagination/filtering that Sentry can detect!
  })
);

// Orders - Purchase transactions
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    // Order identification
    orderNumber: varchar("order_number", { length: 50 }).notNull(),
    // Order status
    status: orderStatusEnum("status").notNull().default("pending"),
    // Payment information
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("pending"),
    paymentMethod: varchar("payment_method", { length: 50 }), // e.g., "credit_card", "paypal"
    paymentIntentId: varchar("payment_intent_id", { length: 255 }), // Stripe/payment provider ID
    // Amounts
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
    fees: decimal("fees", { precision: 10, scale: 2 }).notNull().default("0"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    // Customer snapshot (stored at time of order for record keeping)
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    customerFirstName: varchar("customer_first_name", { length: 100 }).notNull(),
    customerLastName: varchar("customer_last_name", { length: 100 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 50 }),
    // Timestamps
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    orderNumberIdx: uniqueIndex("orders_order_number_idx").on(table.orderNumber),
    customerIdIdx: index("orders_customer_id_idx").on(table.customerId),
    // Intentionally removed indexes for demo purposes:
    // - statusIdx: Makes status filtering slow
    // - paymentStatusIdx: Makes payment status filtering slow
    // - createdAtIdx: Makes ORDER BY createdAt slow (pagination!)
    // This creates slow pagination/filtering that Sentry can detect!
  })
);

// Order Items - Line items for each order
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    ticketTypeId: uuid("ticket_type_id")
      .notNull()
      .references(() => ticketTypes.id, { onDelete: "restrict" }),
    // Item details
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    // Snapshot of ticket type info at time of purchase
    ticketTypeName: varchar("ticket_type_name", { length: 255 }).notNull(),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
    // Intentionally removed indexes for demo purposes:
    // - ticketTypeIdIdx: Makes joins slow
    // This creates slow pagination that Sentry can detect!
  })
);

// Tickets - Individual tickets generated from order items
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Relationships
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "restrict" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    ticketTypeId: uuid("ticket_type_id")
      .notNull()
      .references(() => ticketTypes.id, { onDelete: "restrict" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    // Link to inventory slot - UNIQUE constraint catches race conditions
    inventorySlotId: uuid("inventory_slot_id")
      .notNull()
      .references(() => ticketInventory.id, { onDelete: "restrict" }),
    // Ticket identification
    ticketCode: varchar("ticket_code", { length: 100 }).notNull(), // Unique code for validation/QR
    barcode: varchar("barcode", { length: 255 }), // Additional barcode if needed
    // Ticket status
    status: ticketStatusEnum("status").notNull().default("valid"),
    // Attendee information (can be different from purchaser)
    attendeeFirstName: varchar("attendee_first_name", { length: 100 }),
    attendeeLastName: varchar("attendee_last_name", { length: 100 }),
    attendeeEmail: varchar("attendee_email", { length: 255 }),
    // Check-in tracking
    isCheckedIn: integer("is_checked_in").notNull().default(0), // 0 = not checked in, 1 = checked in
    checkedInAt: timestamp("checked_in_at"),
    checkedInBy: varchar("checked_in_by", { length: 255 }), // Staff/admin who checked in
    // Metadata snapshot
    eventTitle: varchar("event_title", { length: 255 }).notNull(),
    ticketTypeName: varchar("ticket_type_name", { length: 255 }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    // Transfer tracking (for future use)
    transferredFrom: uuid("transferred_from"), // Previous owner if transferred
    transferredAt: timestamp("transferred_at"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    ticketCodeIdx: uniqueIndex("tickets_ticket_code_idx").on(table.ticketCode),
    // UNIQUE constraint on inventory_slot_id - this catches the race condition!
    // Two tickets cannot claim the same inventory slot
    inventorySlotIdx: uniqueIndex("tickets_inventory_slot_idx").on(
      table.inventorySlotId
    ),
    // Intentionally removed indexes for demo purposes:
    // - orderIdIdx: Makes joins slow
    // - eventIdIdx: Makes joins slow
    // - customerIdIdx: Makes joins slow
    // - statusIdx: Makes status filtering slow
    // - emailIdx: Makes email lookups slow
    // This creates slow pagination/filtering that Sentry can detect!
  })
);

