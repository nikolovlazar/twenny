# Twenny Performance Lessons

This repository includes an interactive lesson system to demonstrate how to optimize database performance in production applications using Sentry for monitoring.

## Lesson 1: Tickets Pagination Optimization

**Problem:** With millions of tickets (13M+), offset-based pagination becomes exponentially slower as you navigate to higher page numbers. Page 10000 can take 20+ seconds to load.

**Solution:** Add database indexes and switch to cursor-based pagination for consistent fast performance.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Make sure Docker is running
docker-compose up -d

# Run migrations
npm run db:migrate

# Seed the database (this will take ~30 minutes for 13M tickets)
npm run db:seed

# Set yourself as admin
npm run db:set-admin
```

### 3. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in.

## Using the Lesson CLI

The lesson system uses an interactive CLI to switch between optimized and unoptimized states.

### Switch Lesson States

```bash
npm run lesson
```

This will prompt you to:
1. Select a lesson (currently only Lesson 1 is available)
2. Choose optimization state:
   - **Unoptimized**: Offset pagination, no indexes (slow for high page numbers)
   - **Optimized**: Cursor pagination, with indexes (consistently fast)

### Check Current State

```bash
npm run lesson:status
```

## Demo Workflow

### 1. Start with Unoptimized State

```bash
npm run lesson
# Select: Lesson 1 → Unoptimized
npm run dev
```

Visit `http://localhost:3000/admin/tickets?page=10000`

**What you'll see:**
- Query takes 15-30 seconds
- In Sentry: filter by `optimized:false` to see slow traces
- Performance degrades as page number increases

### 2. Apply Optimization

```bash
npm run lesson
# Select: Lesson 1 → Optimized
```

**What happens:**
- Creates 6 database indexes on tickets table (takes ~5-10 minutes)
- Swaps code templates to use cursor-based pagination
- Updates Sentry tags to `optimized:true`

Restart your dev server:
```bash
npm run dev
```

Visit `http://localhost:3000/admin/tickets`

**What you'll see:**
- Query takes <500ms regardless of position
- In Sentry: filter by `optimized:true` to see fast traces
- Consistent performance throughout dataset

### 3. Compare in Sentry

In Sentry's Performance tab:
1. Filter traces by `optimized:false` - see the problem
2. Filter traces by `optimized:true` - see the solution
3. Compare duration graphs side-by-side

## What Gets Changed

### Unoptimized State

**Files:**
- `server/use-cases/admin/tickets/list-tickets-admin.ts` - Offset pagination
- `app/admin/tickets/page.tsx` - Uses `?page=123` param
- `components/admin/pagination.tsx` - Page number navigation

**Database:**
- No indexes on `created_at`, `status`, or foreign keys
- Queries use `OFFSET` which skips rows inefficiently

**Sentry Attributes:**
- `optimized: false`
- `pagination.type: "offset"`
- `pagination.page: 10000`
- `pagination.offset: 199980`

### Optimized State

**Files:**
- `server/use-cases/admin/tickets/list-tickets-admin.ts` - Cursor pagination
- `server/lib/cursor-helpers.ts` - Cursor encoding/decoding utilities
- `app/admin/tickets/page.tsx` - Uses `?cursor=xyz` param
- `components/admin/cursor-pagination.tsx` - Next/Previous navigation

**Database:**
- 6 indexes on tickets table:
  - `tickets_created_at_id_idx` - Composite index for cursor pagination
  - `tickets_status_idx` - For filtering
  - `tickets_order_id_idx` - For joins
  - `tickets_event_id_idx` - For joins
  - `tickets_customer_id_idx` - For joins
  - `tickets_attendee_email_idx` - For lookups

**Sentry Attributes:**
- `optimized: true`
- `pagination.type: "cursor"`
- `pagination.cursor: "base64..."

## Technical Details

### Template System

The lesson system uses a template swapping approach:

```
templates/
  lesson-1/
    unoptimized/
      server/use-cases/admin/tickets/list-tickets-admin.ts
      app/admin/tickets/page.tsx
      components/admin/pagination.tsx
    optimized/
      server/use-cases/admin/tickets/list-tickets-admin.ts
      server/lib/cursor-helpers.ts
      app/admin/tickets/page.tsx
      components/admin/cursor-pagination.tsx
  lesson-2/
    unoptimized/
      ...
    optimized/
      ...
```

When you run `npm run lesson`, it:
1. Copies files from the selected lesson and state directory to the active codebase
2. Applies or removes database indexes
3. Updates `.optimization-state.json` to track current state

### Cursor Pagination

Cursor pagination uses composite sorting on `(created_at, id)` to:
- Avoid skipping rows (no OFFSET)
- Maintain consistent page boundaries
- Work efficiently with indexes

Example query:
```sql
SELECT * FROM tickets
WHERE (created_at, id) < ($1, $2)  -- cursor position
ORDER BY created_at DESC, id DESC
LIMIT 21  -- +1 to detect more results
```

### Index Benefits

The composite index `(created_at DESC, id DESC)` allows Postgres to:
- Sort efficiently without a separate sort step
- Use index-only scans when possible
- Jump directly to cursor position

## Future Lessons

More lessons coming soon! The framework is designed to be extensible:
- Lesson 2: Optimize Orders pagination
- Lesson 3: Fix N+1 queries
- Lesson 4: Add caching layer

## Troubleshooting

### Indexes Already Exist

If you see "index already exists" errors, the indexes are already in place. Run:
```bash
npm run lesson
# Select: Lesson 1 → Unoptimized
```

This will remove the indexes so you can demo the "before" state again.

### Dependencies Not Found

If you get import errors for `prompts` or `chalk`:
```bash
npm install
```

### State File Issues

If the CLI behaves unexpectedly, delete the state file:
```bash
rm .optimization-state.json
```

Then run `npm run lesson` to start fresh.

## Learn More

- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Database Indexing Strategies](https://use-the-index-luke.com/)
- [Cursor Pagination Best Practices](https://www.postgresql.org/docs/current/queries-limit.html)

