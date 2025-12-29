import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Create the database client
// For local development, uses a local SQLite file
// For production, set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./omni.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export * from "./schema";
