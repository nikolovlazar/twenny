# Coding Standards

## Next.js 16 Patterns

- **App Router** - Use the App Router for all routing
- **Server Components** - Default to Server Components for data fetching
- **Server Actions** - Use Server Actions for mutations (defined in `server/actions.ts`)
- **Client Components** - Only use `"use client"` when necessary for interactivity

## TypeScript

- Full type safety across the application
- Strict mode enabled
- Leverage Drizzle ORM types for database operations

## Route Organization

```
app/
├── (site)/          # Public-facing pages (grouped route)
├── checkout/        # Checkout flow pages
├── admin/           # Protected admin pages
└── api/             # API routes (Better-Auth)
```

## Server-Side Structure

```
server/
├── use-cases/       # Business logic + data access
├── services/        # Cross-cutting concerns
├── db.ts            # Drizzle database instance
├── schema.ts        # Database schema definitions
├── auth.ts          # Better-Auth configuration
├── queue.ts         # BullMQ queue setup
├── worker.ts        # Background worker process
└── actions.ts       # Server Actions
```

## Layered Architecture

### Use Cases Pattern

Use cases combine business logic and data access in a single layer:

- **Location**: `server/use-cases/`
- **Direct Database Access**: Use cases query Drizzle directly (no repository layer)
- **Responsibilities**:
  - Implement business rules and validation
  - Execute database queries and mutations
  - Orchestrate calls to services
  - Handle transaction boundaries

**Example structure:**
```
server/use-cases/
├── tickets/
│   ├── reserve-tickets.ts
│   ├── purchase-tickets.ts
│   └── release-expired-reservations.ts
└── events/
    ├── get-event-details.ts
    └── list-events.ts
```

### Services

Services handle cross-cutting concerns and external integrations:

- **Location**: `server/services/`
- **Examples**: Email service, file upload service, payment service
- **Called by**: Use cases
- **Keep them focused**: One service per concern

### Flow Pattern

**API Route or Server Action** → **Use Case** → **Drizzle** + **Services**

1. API Routes/Server Actions receive requests
2. Call appropriate use case(s)
3. Use cases contain business logic and database operations
4. Use cases call services for cross-cutting concerns
5. Return results to the caller

### Transaction Management

- Use cases handle transactions with Drizzle's `db.transaction()`
- No abstraction layer to complicate transaction boundaries
- Keep transaction scope clear and explicit within use cases

**Example:**
```typescript
export async function reserveTickets(eventId: string, quantity: number) {
  return db.transaction(async (tx) => {
    // All queries within this callback are part of the transaction
    const tickets = await tx.select()...
    await tx.update()...
    return tickets;
  });
}
```

### Design Principles

- **Pragmatic over purist**: Inspired by Clean Architecture but simplified
- **No over-engineering**: No DI containers, no complex abstractions
- **Transaction-friendly**: Direct database access makes transactions simple
- **MVP-appropriate**: Structure grows with the project, not ahead of it

## Component Organization

- Shared components live in `components/`
- Use shadcn/ui components for UI consistency
- Tailwind CSS for styling

## Intentional MVP Mistakes (Educational Tracking)

The following issues are intentionally present in the MVP and fixed throughout the series:

### Database Issues
- **Missing Indexes** - No indexes on `starts_at`, `price`, `reserved_until`, etc.
- **N+1 Queries** - Classic N+1 query patterns everywhere
- **Slow Queries** - Queries that perform poorly at scale

### Concurrency Issues
- **Ticket Race Conditions** - Double booking possible (no SELECT FOR UPDATE)
- **No Transaction Safety** - Missing proper transaction handling

### Scalability Issues
- **setTimeout Reservations** - In-memory setTimeout fails across multiple instances
- **No Caching** - Every request hits the database
- **Cache Stampede** - Multiple requests for same data cause database overload
- **Synchronous Heavy Work** - Blocking operations in request handlers

### Resource Issues
- **20 MB Uploaded Images** - No image optimization or resizing
- **No Rate Limiting** - Scalpers can overwhelm the system

### Fix Progress (Updated as series progresses)

Track which issues have been addressed:
- [ ] Missing database indexes
- [ ] N+1 queries
- [ ] Double booking race condition
- [ ] setTimeout → BullMQ migration
- [ ] Image optimization with Sharp
- [ ] Redis caching layer
- [ ] Rate limiting implementation
- [ ] Async background job processing

