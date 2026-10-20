import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// neon-http only opens a connection when a query runs, so a missing URL
// must not crash at import time (e.g. during `next build` before env is set).
const url = process.env.DATABASE_URL ?? "postgresql://missing:missing@localhost.invalid/missing";
export const db = drizzle(neon(url), { schema });
