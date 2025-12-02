import { config } from "dotenv";
config({ quiet: true });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create a postgres connection
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it's not supported for "Transaction" pool mode
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create a Drizzle instance
export const db = drizzle(client, { schema });

// Export the client for Better-Auth
export const pgClient = client;

