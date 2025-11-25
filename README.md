# twenny – The Last 20% Ticketing App

A deliberately fragile, single Next.js demo built for the video/blog series **"From MVP to Production with Sentry"**.

Purpose: Show developers exactly what breaks after the MVP when real traffic hits, and how to fix the final, painful 20% using Sentry.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or your preferred package manager

### Local Development Setup

1. **Clone and install dependencies**

```bash
npm install
```

2. **Start Docker services (PostgreSQL & Redis)**

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- pgAdmin on `localhost:5050` (optional, user: admin@admin.com, password: admin)

3. **Set up environment variables**

Copy `.env.example` to `.env.local` and update if needed:

```bash
cp .env.example .env.local
```

4. **Run database migrations**

```bash
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Apply migrations to database
```

5. **Seed the database (optional for now)**

```bash
npm run db:seed  # Seeds 300k events + 3-5M tickets
```

⚠️ **Warning**: Seeding takes several minutes and will stress your database intentionally!

6. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

7. **Start the worker (optional, for queue processing)**

In a separate terminal:

```bash
npm run worker
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations from schema |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:seed` | Seed database with huge dataset |
| `npm run worker` | Start BullMQ worker process |

## 🏗️ Project Structure

```
twenny/
├── app/                    # Next.js App Router
│   ├── (site)/            # Public pages
│   ├── checkout/          # Checkout flow
│   └── admin/             # Admin dashboard
├── server/                # Server-side code
│   ├── use-cases/         # Business logic + data access
│   ├── services/          # Cross-cutting concerns
│   ├── db.ts              # Drizzle instance
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # Better Auth config
│   ├── queue.ts           # BullMQ setup
│   ├── worker.ts          # Worker process
│   └── actions.ts         # Server Actions
├── components/            # Shared React components
│   └── ui/                # shadcn/ui components
├── scripts/               # Utility scripts
│   └── seed-huge.ts       # Database seeding
├── migrations/            # Drizzle migrations
└── docker-compose.yml     # Local services
```

## 🛠️ Tech Stack

- **Next.js 16** - App Router, Server Components, Server Actions
- **TypeScript** - Full type safety
- **Drizzle ORM** + postgres.js
- **Better-Auth** - Authentication & sessions
- **PostgreSQL** - Primary database
- **Redis** + **BullMQ** - Background jobs
- **Sharp** - Image processing
- **Tailwind CSS** + **shadcn/ui** - Styling

## 🎯 Series Overview

This project is intentionally built with common MVP mistakes that will be progressively fixed:

1. ✅ MVP in <2 hours (works great)
2. 🔜 Seed 300k events → site dies
3. 🔜 Find slow queries with Sentry Performance
4. 🔜 Add missing indexes → 100-300× faster
5. 🔜 Fix N+1 with Drizzle joins
6. 🔜 Fix double-spend with SELECT FOR UPDATE
7. 🔜 Replace setTimeout with BullMQ
8. 🔜 Scale workers horizontally
9. 🔜 Stop scalpers with rate limiting
10. 🔜 Fix image bloat with Sharp
11. 🔜 Add Redis caching
12. 🔜 Full Sentry observability

## 🐳 Docker Deployment

The application can be deployed as three separate processes from one Dockerfile:

- **web** - Next.js server
- **worker** - BullMQ worker
- **cron** - Scheduled jobs (optional)

Build the image:

```bash
docker build -t twenny .
```

Run different processes:

```bash
# Web server
docker run -p 3000:3000 twenny node server.js

# Worker
docker run twenny npm run worker
```

## 📝 License

MIT

## 🤝 Contributing

This is an educational project. Feel free to explore, learn, and suggest improvements!
