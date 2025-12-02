// Load environment variables from .env file
import { config } from "dotenv";
config({ quiet: true });

import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import * as schema from "../server/schema";

/**
 * Seed script for generating millions of realistic records
 *
 * This script will:
 * 1. Generate 500 venues
 * 2. Generate 5,000 events
 * 3. Generate ~15,000 ticket types (2-4 per event)
 * 4. Generate 800,000 customers
 * 5. Generate 1,500,000 orders
 * 6. Generate ~2,000,000 order items
 * 7. Generate 3,500,000 tickets
 *
 * Usage: npm run db:seed
 */

// ============================================
// CONFIGURATION
// ============================================

  const CONFIG = {
    venues: 500,
    events: 5000,
    ticketTypesPerEvent: { min: 2, max: 4 },
    customers: 800_000,
    orders: 1_500_000,
    orderItemsPerOrder: { min: 1, max: 3 },
    ticketsTarget: 3_500_000,
    batchSize: 1000, // Batch size for inserts (safe for most tables)
  };

// ============================================
// HELPER FUNCTIONS
// ============================================

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniqueCode(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

function weightedRandomStatus<T>(
  statuses: Array<{ value: T; weight: number }>
): T {
  const totalWeight = statuses.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;

  for (const status of statuses) {
    random -= status.weight;
    if (random <= 0) {
      return status.value;
    }
  }

  return statuses[0].value;
}

function logProgress(message: string, count?: number) {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  console.log(
    `[${timestamp}] ${message}${count ? ` (${count.toLocaleString()})` : ""} | Memory: ${memUsage}MB`
  );
}

async function insertBatch<T>(
  tableName: string,
  table: any,
  data: T[],
  totalCount: number
) {
  const batchSize = CONFIG.batchSize;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await db.insert(table).values(batch);
    logProgress(
      `  Inserted ${tableName}`,
      Math.min(i + batchSize, data.length)
    );
  }
}

// ============================================
// DATA GENERATION FUNCTIONS
// ============================================

function generateVenues(count: number) {
  logProgress(`Generating ${count} venues...`);
  const venues = [];
  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];
  const venueTypes = [
    "Arena",
    "Stadium",
    "Theater",
    "Concert Hall",
    "Convention Center",
    "Club",
  ];

  for (let i = 0; i < count; i++) {
    const isVirtual = i < count * 0.1 ? 1 : 0; // 10% virtual venues
    venues.push({
      name: isVirtual
        ? `${faker.company.name()} Virtual Venue`
        : `${faker.company.name()} ${randomFromArray(venueTypes)}`,
      description: faker.lorem.paragraph(),
      addressLine1: isVirtual ? null : faker.location.streetAddress(),
      addressLine2:
        isVirtual || Math.random() > 0.3 ? null : faker.location.secondaryAddress(),
      city: isVirtual ? null : faker.location.city(),
      state: isVirtual ? null : faker.location.state(),
      country: isVirtual ? null : faker.location.country(),
      postalCode: isVirtual ? null : faker.location.zipCode(),
      capacity: isVirtual ? null : randomInt(100, 50000),
      timezone: randomFromArray(timezones),
      isVirtual,
      phone: faker.phone.number(),
      email: faker.internet.email(),
      website: faker.internet.url(),
      imageUrl: `https://picsum.photos/seed/${i}/800/600`,
    });
  }

  return venues;
}

function generateEvents(count: number, venueIds: string[]) {
  logProgress(`Generating ${count} events...`);
  const events = [];
  const categories = [
    "Concert",
    "Sports",
    "Theater",
    "Comedy",
    "Conference",
    "Festival",
    "Exhibition",
    "Workshop",
  ];
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const startDate = faker.date.between({ from: twoYearsAgo, to: oneYearFromNow });
    const isPast = startDate < now;
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + randomInt(2, 8));

    // 60% past (completed), 30% future (published), 10% mixed
    let status: "draft" | "published" | "cancelled" | "completed";
    let isPublished = 0;
    let publishedAt = null;

    if (isPast) {
      // Past events
      status = weightedRandomStatus([
        { value: "completed" as const, weight: 85 },
        { value: "cancelled" as const, weight: 15 },
      ]);
      isPublished = 1;
      publishedAt = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before
    } else {
      // Future events
      status = weightedRandomStatus([
        { value: "published" as const, weight: 75 },
        { value: "draft" as const, weight: 15 },
        { value: "cancelled" as const, weight: 10 },
      ]);
      isPublished = status === "published" ? 1 : 0;
      publishedAt =
        status === "published"
          ? new Date(startDate.getTime() - 60 * 24 * 60 * 60 * 1000)
          : null;
    }

    const category = randomFromArray(categories);
    const title = `${faker.music.songName()} ${category} ${faker.number.int({ min: 2020, max: 2026 })}`;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100) +
      "-" +
      i;

    events.push({
      venueId: randomFromArray(venueIds),
      title,
      slug,
      description: faker.lorem.paragraphs(3),
      shortDescription: faker.lorem.sentence(),
      startDate,
      endDate,
      timezone: "America/New_York",
      status,
      isPublished,
      publishedAt,
      totalCapacity: randomInt(100, 10000),
      currency: "USD",
      bannerImageUrl: `https://picsum.photos/seed/${i}/1200/400`,
      thumbnailImageUrl: `https://picsum.photos/seed/${i}/400/400`,
      category,
      tags: JSON.stringify([
        category.toLowerCase(),
        faker.word.adjective(),
        faker.word.noun(),
      ]),
      ageRestriction: Math.random() > 0.7 ? "18+" : null,
      metaTitle: title,
      metaDescription: faker.lorem.sentence(),
    });
  }

  return events;
}

function generateTicketTypes(events: Array<{ id: string; startDate: Date }>) {
  logProgress(`Generating ticket types for ${events.length} events...`);
  const ticketTypes: Array<{
    eventId: string;
    name: string;
    description: string;
    price: string;
    quantity: number;
    saleStartDate: Date;
    saleEndDate: Date;
    minQuantityPerOrder: number;
    maxQuantityPerOrder: number;
    sortOrder: number;
    isActive: number;
  }> = [];
  const typeNames = [
    { name: "VIP", priceMin: 200, priceMax: 500 },
    { name: "General Admission", priceMin: 30, priceMax: 100 },
    { name: "Early Bird", priceMin: 20, priceMax: 60 },
    { name: "Student", priceMin: 10, priceMax: 40 },
    { name: "Group", priceMin: 25, priceMax: 75 },
  ];

  for (const event of events) {
    const numTypes = randomInt(
      CONFIG.ticketTypesPerEvent.min,
      CONFIG.ticketTypesPerEvent.max
    );
    const selectedTypes = faker.helpers.arrayElements(typeNames, numTypes);

    selectedTypes.forEach((type, index) => {
      const quantity = randomInt(50, 10000);
      const saleStartDate = new Date(
        event.startDate.getTime() - 90 * 24 * 60 * 60 * 1000
      ); // 90 days before
      const saleEndDate = new Date(
        event.startDate.getTime() - 1 * 60 * 60 * 1000
      ); // 1 hour before

      ticketTypes.push({
        eventId: event.id,
        name: type.name,
        description: `${type.name} ticket with exclusive benefits`,
        price: (Math.random() * (type.priceMax - type.priceMin) + type.priceMin).toFixed(2),
        quantity,
        saleStartDate,
        saleEndDate,
        minQuantityPerOrder: 1,
        maxQuantityPerOrder: type.name === "Group" ? 20 : 10,
        sortOrder: index,
        isActive: 1,
      });
    });
  }

  return ticketTypes;
}

function generateInventorySlots(
  ticketTypes: Array<{ id: string; quantity: number }>
) {
  logProgress(
    `Generating inventory slots for ${ticketTypes.length} ticket types...`
  );
  const inventorySlots: Array<{
    ticketTypeId: string;
    createdAt: Date;
  }> = [];

  for (const ticketType of ticketTypes) {
    // Create 'quantity' inventory slots for each ticket type
    for (let i = 0; i < ticketType.quantity; i++) {
      inventorySlots.push({
        ticketTypeId: ticketType.id,
        createdAt: new Date(),
      });
    }

    // Log progress every 100 ticket types
    if (inventorySlots.length % 100000 === 0) {
      logProgress(`  Generated inventory slots`, inventorySlots.length);
    }
  }

  return inventorySlots;
}

function generateCustomers(count: number) {
  logProgress(`Generating ${count} customers...`);
  const customers = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const hasUserId = Math.random() > 0.3; // 70% registered users

    customers.push({
      userId: hasUserId ? `user_${faker.string.alphanumeric(16)}` : null,
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number(),
      billingAddressLine1: faker.location.streetAddress(),
      billingAddressLine2:
        Math.random() > 0.7 ? faker.location.secondaryAddress() : null,
      billingCity: faker.location.city(),
      billingState: faker.location.state(),
      billingCountry: faker.location.country(),
      billingPostalCode: faker.location.zipCode(),
    });

    // Log progress every 50k
    if ((i + 1) % 50000 === 0) {
      logProgress(`  Generated customers`, i + 1);
    }
  }

  return customers;
}

function generateOrders(
  count: number,
  customerIds: string[]
) {
  logProgress(`Generating ${count} orders...`);
  const orders = [];
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const now = new Date();

  const paymentMethods = ["credit_card", "paypal", "apple_pay", "google_pay"];

  for (let i = 0; i < count; i++) {
    const createdAt = faker.date.between({ from: twoYearsAgo, to: now });
    const customer = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    };

    const status = weightedRandomStatus([
      { value: "completed" as const, weight: 85 },
      { value: "pending" as const, weight: 10 },
      { value: "cancelled" as const, weight: 3 },
      { value: "refunded" as const, weight: 2 },
    ]);

    const paymentStatus =
      status === "completed"
        ? "completed"
        : status === "pending"
          ? weightedRandomStatus([
              { value: "pending" as const, weight: 60 },
              { value: "failed" as const, weight: 40 },
            ])
          : status === "refunded"
            ? "refunded"
            : "failed";

    const subtotal = randomInt(50, 1000);
    const tax = (subtotal * 0.08).toFixed(2);
    const fees = (subtotal * 0.05).toFixed(2);
    const total = (
      parseFloat(subtotal.toString()) +
      parseFloat(tax) +
      parseFloat(fees)
    ).toFixed(2);

    orders.push({
      customerId: randomFromArray(customerIds),
      orderNumber: generateUniqueCode("ORD"),
      status,
      paymentStatus: paymentStatus as
        | "pending"
        | "completed"
        | "failed"
        | "refunded",
      paymentMethod: randomFromArray(paymentMethods),
      paymentIntentId:
        status === "completed" ? `pi_${faker.string.alphanumeric(24)}` : null,
      subtotal: subtotal.toString(),
      tax,
      fees,
      total,
      currency: "USD",
      customerEmail: customer.email,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      customerPhone: customer.phone,
      completedAt: status === "completed" ? createdAt : null,
      cancelledAt: status === "cancelled" ? createdAt : null,
      createdAt,
    });

    // Log progress every 100k
    if ((i + 1) % 100000 === 0) {
      logProgress(`  Generated orders`, i + 1);
    }
  }

  return orders;
}

function generateOrderItems(
  orders: Array<{ id: string; subtotal: string }>,
  ticketTypeIds: string[]
) {
  logProgress(`Generating order items for ${orders.length} orders...`);
  const orderItems = [];

  for (const order of orders) {
    const numItems = randomInt(
      CONFIG.orderItemsPerOrder.min,
      CONFIG.orderItemsPerOrder.max
    );

    let orderSubtotal = 0;

    for (let i = 0; i < numItems; i++) {
      const quantity = randomInt(1, 8);
      const unitPrice = randomInt(10, 200);
      const subtotal = quantity * unitPrice;
      orderSubtotal += subtotal;

      orderItems.push({
        orderId: order.id,
        ticketTypeId: randomFromArray(ticketTypeIds),
        quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2),
        ticketTypeName: randomFromArray([
          "VIP",
          "General Admission",
          "Early Bird",
          "Student",
          "Group",
        ]),
      });
    }

    // Log progress every 100k
    if (orderItems.length % 100000 === 0) {
      logProgress(`  Generated order items`, orderItems.length);
    }
  }

  return orderItems;
}

function generateTicketData(
  orderItem: {
    id: string;
    orderId: string;
    ticketTypeId: string;
    quantity: number;
    unitPrice: string;
  },
  eventIds: string[],
  customerIds: string[],
  inventorySlotId: string,
  usedCodes: Set<string>
) {
  function generateUniqueTicketCode(): string {
    let code: string;
    do {
      code = `TKT-${faker.string.alphanumeric(12).toUpperCase()}`;
    } while (usedCodes.has(code));
    usedCodes.add(code);
    return code;
  }

  const isPastEvent = Math.random() > 0.2; // 80% past events
  const status = isPastEvent
    ? weightedRandomStatus([
        { value: "used" as const, weight: 90 },
        { value: "valid" as const, weight: 5 },
        { value: "cancelled" as const, weight: 3 },
        { value: "refunded" as const, weight: 2 },
      ])
    : weightedRandomStatus([
        { value: "valid" as const, weight: 85 },
        { value: "cancelled" as const, weight: 10 },
        { value: "refunded" as const, weight: 5 },
      ]);

  const isCheckedIn = status === "used" ? 1 : 0;
  const checkedInAt = isCheckedIn === 1 ? faker.date.past({ years: 1 }) : null;

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    orderId: orderItem.orderId,
    orderItemId: orderItem.id,
    eventId: randomFromArray(eventIds),
    ticketTypeId: orderItem.ticketTypeId,
    customerId: randomFromArray(customerIds),
    inventorySlotId,
    ticketCode: generateUniqueTicketCode(),
    barcode: Math.random() > 0.5 ? faker.string.numeric(13) : null,
    status,
    attendeeFirstName: Math.random() > 0.3 ? firstName : null,
    attendeeLastName: Math.random() > 0.3 ? lastName : null,
    attendeeEmail:
      Math.random() > 0.3 ? faker.internet.email({ firstName, lastName }) : null,
    isCheckedIn,
    checkedInAt,
    checkedInBy:
      isCheckedIn === 1 ? `staff_${faker.string.alphanumeric(8)}` : null,
    eventTitle: `Event ${faker.music.songName()}`,
    ticketTypeName: randomFromArray([
      "VIP",
      "General Admission",
      "Early Bird",
      "Student",
      "Group",
    ]),
    price: orderItem.unitPrice,
    transferredFrom: Math.random() > 0.95 ? faker.string.uuid() : null,
    transferredAt: Math.random() > 0.95 ? faker.date.past({ years: 1 }) : null,
  };
}

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function main() {
  const startTime = Date.now();
  console.log("\n🌱 Starting LARGE database seed...");
  console.log("⚠️  This will take 20-40 minutes for millions of records\n");

  try {
    // STEP 1: Venues
    logProgress("STEP 1/8: Seeding venues");
    const venues = generateVenues(CONFIG.venues);
    await insertBatch("venues", schema.venues, venues, venues.length);
    const venueRecords = await db.select({ id: schema.venues.id }).from(schema.venues);
    const venueIds = venueRecords.map((v) => v.id);
    logProgress(`✓ Created ${venueIds.length} venues`);

    // STEP 2: Events
    logProgress("\nSTEP 2/8: Seeding events");
    const events = generateEvents(CONFIG.events, venueIds);
    await insertBatch("events", schema.events, events, events.length);
    const eventRecords = await db
      .select({ id: schema.events.id, startDate: schema.events.startDate })
      .from(schema.events);
    logProgress(`✓ Created ${eventRecords.length} events`);

    // STEP 3: Ticket Types
    logProgress("\nSTEP 3/8: Seeding ticket types");
    const ticketTypes = generateTicketTypes(eventRecords);
    await insertBatch(
      "ticket_types",
      schema.ticketTypes,
      ticketTypes,
      ticketTypes.length
    );
    const ticketTypeRecords = await db
      .select({ id: schema.ticketTypes.id, quantity: schema.ticketTypes.quantity })
      .from(schema.ticketTypes);
    const ticketTypeIds = ticketTypeRecords.map((t) => t.id);
    logProgress(`✓ Created ${ticketTypeIds.length} ticket types`);

    // STEP 4: Inventory Slots (pre-allocated tickets) - batched inserts for speed
    logProgress("\nSTEP 4/8: Seeding inventory slots");
    let totalInventorySlots = 0;

    // Accumulate slots and batch insert for speed
    // PostgreSQL limit: 65534 params, we have 2 params per slot, so max ~32k rows
    let pendingSlots: { ticketTypeId: string; createdAt: Date }[] = [];
    const SLOT_INSERT_BATCH_SIZE = 30000; // Max safe batch size for Postgres

    for (let i = 0; i < ticketTypeRecords.length; i++) {
      const ticketType = ticketTypeRecords[i];
      const createdAt = new Date();

      // Add all slots for this ticket type to pending
      for (let j = 0; j < ticketType.quantity; j++) {
        pendingSlots.push({ ticketTypeId: ticketType.id, createdAt });

        // Flush when we hit batch size
        if (pendingSlots.length >= SLOT_INSERT_BATCH_SIZE) {
          await db.insert(schema.ticketInventory).values(pendingSlots);
          totalInventorySlots += pendingSlots.length;
          pendingSlots = [];
        }
      }

      // Log progress every 500 ticket types
      if ((i + 1) % 500 === 0 || i === ticketTypeRecords.length - 1) {
        logProgress(`  Processed ticket types ${i + 1}/${ticketTypeRecords.length}, total slots: ${totalInventorySlots.toLocaleString()}`);
      }
    }

    // Insert remaining slots
    if (pendingSlots.length > 0) {
      await db.insert(schema.ticketInventory).values(pendingSlots);
      totalInventorySlots += pendingSlots.length;
    }

    logProgress(`✓ Created ${totalInventorySlots.toLocaleString()} inventory slots`);

    // STEP 5: Customers (in batches to avoid memory issues)
    logProgress("\nSTEP 5/8: Seeding customers");
    const customerBatchSize = 50000;
    const customerIds: string[] = [];
    for (let i = 0; i < CONFIG.customers; i += customerBatchSize) {
      const batchCount = Math.min(customerBatchSize, CONFIG.customers - i);
      const customerBatch = generateCustomers(batchCount);
      await insertBatch(
        "customers",
        schema.customers,
        customerBatch,
        batchCount
      );
      const addedCustomers = await db
        .select({ id: schema.customers.id })
        .from(schema.customers)
        .limit(batchCount)
        .offset(i);
      customerIds.push(...addedCustomers.map((c) => c.id));
    }
    logProgress(`✓ Created ${customerIds.length} customers`);

    // STEP 6: Orders (in batches)
    logProgress("\nSTEP 6/8: Seeding orders");
    const orderBatchSize = 100000;
    const orderIds: Array<{ id: string; subtotal: string }> = [];
    for (let i = 0; i < CONFIG.orders; i += orderBatchSize) {
      const batchCount = Math.min(orderBatchSize, CONFIG.orders - i);
      const orderBatch = generateOrders(batchCount, customerIds);
      await insertBatch("orders", schema.orders, orderBatch, batchCount);
      const addedOrders = await db
        .select({ id: schema.orders.id, subtotal: schema.orders.subtotal })
        .from(schema.orders)
        .limit(batchCount)
        .offset(i);
      orderIds.push(...addedOrders);
    }
    logProgress(`✓ Created ${orderIds.length} orders`);

    // STEP 7: Order Items (in batches)
    logProgress("\nSTEP 7/8: Seeding order items");
    const orderItemBatchSize = 100000;
    let totalOrderItems = 0;
    for (let i = 0; i < orderIds.length; i += orderItemBatchSize) {
      const orderBatch = orderIds.slice(i, i + orderItemBatchSize);
      const orderItemBatch = generateOrderItems(orderBatch, ticketTypeIds);
      await insertBatch(
        "order_items",
        schema.orderItems,
        orderItemBatch,
        orderItemBatch.length
      );
      totalOrderItems += orderItemBatch.length;
    }
    logProgress(`✓ Created ${totalOrderItems} order items`);

    // STEP 8: Tickets - fetch inventory slots from DB on-demand, batch inserts for speed
    logProgress("\nSTEP 8/8: Seeding tickets");
    const eventIdsArray = eventRecords.map((e) => e.id);
    let totalTickets = 0;
    const usedCodes = new Set<string>();

    // Track how many slots we've used per ticket type (offset for DB queries)
    const slotOffsetByTicketType = new Map<string, number>();

    // Accumulator for batch inserts - collect tickets across multiple order item batches
    // Tickets have ~20 columns = 20 params each, so max 65534/20 = ~3200 rows
    let pendingTickets: ReturnType<typeof generateTicketData>[] = [];
    const TICKET_INSERT_BATCH_SIZE = 3000; // Max safe batch size for Postgres

    // Process order items in batches
    const orderItemFetchBatchSize = 25000; // Fetch more at once
    let orderItemOffset = 0;

    while (true) {
      // Fetch a batch of order items from the database
      const orderItemBatch = await db
        .select({
          id: schema.orderItems.id,
          orderId: schema.orderItems.orderId,
          ticketTypeId: schema.orderItems.ticketTypeId,
          quantity: schema.orderItems.quantity,
          unitPrice: schema.orderItems.unitPrice,
        })
        .from(schema.orderItems)
        .limit(orderItemFetchBatchSize)
        .offset(orderItemOffset);

      if (orderItemBatch.length === 0) break;

      // Group order items by ticket type to batch fetch inventory slots
      const orderItemsByTicketType = new Map<string, typeof orderItemBatch>();
      for (const item of orderItemBatch) {
        const items = orderItemsByTicketType.get(item.ticketTypeId) || [];
        items.push(item);
        orderItemsByTicketType.set(item.ticketTypeId, items);
      }

      // Process each ticket type group
      for (const [ticketTypeId, items] of orderItemsByTicketType) {
        // Calculate total slots needed for these order items
        const totalSlotsNeeded = items.reduce((sum, item) => sum + item.quantity, 0);

        // Get current offset for this ticket type
        const currentOffset = slotOffsetByTicketType.get(ticketTypeId) || 0;

        // Fetch inventory slots from DB
        const inventorySlots = await db
          .select({ id: schema.ticketInventory.id })
          .from(schema.ticketInventory)
          .where(eq(schema.ticketInventory.ticketTypeId, ticketTypeId))
          .offset(currentOffset)
          .limit(totalSlotsNeeded);

        // Update offset for next batch
        slotOffsetByTicketType.set(ticketTypeId, currentOffset + inventorySlots.length);

        // Generate tickets using these slots and add to pending batch
        let slotIndex = 0;
        for (const orderItem of items) {
          for (let i = 0; i < orderItem.quantity; i++) {
            if (slotIndex >= inventorySlots.length) break;

            const ticket = generateTicketData(
              orderItem,
              eventIdsArray,
              customerIds,
              inventorySlots[slotIndex].id,
              usedCodes
            );
            pendingTickets.push(ticket);
            slotIndex++;
          }
        }

        // Flush pending tickets when we hit the batch size
        while (pendingTickets.length >= TICKET_INSERT_BATCH_SIZE) {
          const batch = pendingTickets.splice(0, TICKET_INSERT_BATCH_SIZE);
          await db.insert(schema.tickets).values(batch);
          totalTickets += batch.length;
        }
      }

      orderItemOffset += orderItemFetchBatchSize;
      logProgress(`  Processed ${orderItemOffset.toLocaleString()} order items, generated ${totalTickets.toLocaleString()} tickets`);

      // Clear usedCodes periodically to free memory
      if (usedCodes.size > 100000) {
        usedCodes.clear();
      }
    }

    // Insert any remaining tickets
    if (pendingTickets.length > 0) {
      await db.insert(schema.tickets).values(pendingTickets);
      totalTickets += pendingTickets.length;
    }

    logProgress(`✓ Created ${totalTickets.toLocaleString()} tickets`);

    // Final statistics
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEED COMPLETE - Final Statistics:");
    console.log("=".repeat(60));
    console.log(`   Venues:          ${venueIds.length.toLocaleString()}`);
    console.log(`   Events:          ${eventRecords.length.toLocaleString()}`);
    console.log(`   Ticket Types:    ${ticketTypeIds.length.toLocaleString()}`);
    console.log(`   Inventory Slots: ${totalInventorySlots.toLocaleString()}`);
    console.log(`   Customers:       ${customerIds.length.toLocaleString()}`);
    console.log(`   Orders:          ${orderIds.length.toLocaleString()}`);
    console.log(`   Order Items:     ${totalOrderItems.toLocaleString()}`);
    console.log(`   Tickets:         ${totalTickets.toLocaleString()}`);
    console.log("=".repeat(60));
    console.log(`   Time elapsed:    ${elapsed} minutes`);
    console.log("=".repeat(60));
    console.log("\n✅ Database seeded successfully!");
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
