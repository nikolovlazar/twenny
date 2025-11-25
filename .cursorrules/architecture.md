# Architecture

## Tech Stack (2025)

- **Next.js 16** - App Router + Server Components + Server Actions
- **TypeScript** - Full type safety
- **Drizzle ORM** + postgres.js - You feel every missing index
- **Better-Auth** - Sessions, social login, rate limiting
- **PostgreSQL** - Primary database
- **Redis** + **BullMQ** - Background job processing (added when setTimeout fails)
- **Sharp** - Image processing
- **Tailwind CSS** + **shadcn/ui** - Styling
- **Docker** + docker-compose - Containerization

## Project Structure

Single Next.js app – ultra simple:

```
twenny/
├── app/
│   ├── (site)/                 # homepage, events list, event page
│   ├── checkout/               # checkout flow
│   ├── admin/                  # protected with AdminGuard layout
│   ├── api/auth/[...better-auth]/route.ts
│   └── layout.tsx
├── server/
│   ├── use-cases/              # business logic + data access
│   ├── services/               # cross-cutting concerns
│   ├── db.ts                   # Drizzle instance
│   ├── schema.ts               # tables (missing indexes on purpose)
│   ├── auth.ts                 # Better-Auth config
│   ├── queue.ts                # BullMQ setup
│   ├── worker.ts               # separate process entrypoint
│   └── actions.ts              # server actions
├── components/                 # shared UI components
├── scripts/seed-huge.ts        # 300k events + millions of tickets
├── migrations/                 # drizzle-kit migrations
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts
└── package.json
```

## Architecture Layers

This project uses a simplified, pragmatic approach inspired by Clean Architecture:

### Use Cases
- **Purpose**: Combine business logic and data access in one place
- **Location**: `server/use-cases/`
- **Direct Drizzle Access**: Use cases query the database directly (no repository abstraction)
- **Benefit**: Simpler transaction management with Drizzle's `db.transaction()`

### Services
- **Purpose**: Cross-cutting concerns and external integrations
- **Location**: `server/services/`
- **Examples**: Authentication, queue management, email, file uploads

### Flow Pattern
1. **API Routes / Server Actions** - Entry points for requests
2. **Use Cases** - Business logic + database queries
3. **Services** - Called by use cases for cross-cutting concerns

### Design Goals
- Keep it simple and pragmatic (MVP-friendly)
- Avoid over-engineering (no DI containers, no complex abstractions)
- Direct database access for easier transaction boundaries
- Enough structure to keep code organized as it scales

## Database

- **ORM**: Drizzle ORM with postgres.js driver
- **Schema**: Defined in `server/schema.ts`
- **Migrations**: Managed by drizzle-kit in `migrations/` directory
- **Intentional Issues**: Missing indexes on critical columns for educational purposes

## Authentication

- **System**: Better-Auth
- **Features**:
  - Session management
  - Social login support
  - Rate limiting (added later in series)
- **Config**: `server/auth.ts`

## Background Job Processing

- **Queue**: BullMQ (Redis-backed)
- **Setup**: `server/queue.ts`
- **Worker**: `server/worker.ts` (separate process)
- **Purpose**: Replaces setTimeout for reliable ticket reservation expiration

## Scaling Strategy

One Dockerfile → three processes:

1. **web** - Next.js server (horizontally scalable)
2. **worker** - BullMQ worker (horizontally scalable)
3. **cron** - Repeatable jobs (optional)

This architecture works perfectly on Railway, Hetzner, Fly.io, Render, and similar platforms.

## Deployment Targets

- Railway
- Hetzner
- Fly.io
- Render
- Any platform supporting Docker containers

