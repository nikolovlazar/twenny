# Features

## Public Site

- **Browse Events** - View available events from a large catalog
- **Event Details** - Individual event pages with ticket information
- **Reserve Tickets** - Users can reserve tickets for purchase

## Ticket Reservation System

- **15-Minute Reservations** - Tickets are held for 15 minutes during checkout
- **Automatic Expiration** - Reservations expire and return to pool automatically
- **MVP Issue**: Initially uses in-memory setTimeout (breaks at scale)
- **Production Fix**: Replaced with BullMQ for reliability

## Checkout Flow

- **Fake Payment** - Simulated payment processing (no real transactions)
- **MVP Issue**: Double-spend vulnerability (same ticket can be purchased twice)
- **Production Fix**: SELECT FOR UPDATE to prevent race conditions

## Admin Dashboard

- **Route**: `/admin/*`
- **Protection**: AdminGuard layout component
- **Purpose**: Manage events, view tickets, and monitor system

## Data Scale

- **Events**: 300,000 pre-seeded events
- **Tickets**: 3-5 million pre-seeded tickets
- **Purpose**: Demonstrate performance issues at realistic scale
- **Seeding**: `scripts/seed-huge.ts`

## Progressive Features (Added Through Series)

- Rate limiting to prevent scalpers
- Image optimization with Sharp
- Redis caching layer
- Full Sentry observability integration

