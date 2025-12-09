import { config } from "dotenv";
config({ quiet: true });

import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Create a postgres connection
const connectionString = process.env.DATABASE_URL!;

// Create a Drizzle instance
export const db = drizzle(connectionString, { schema });