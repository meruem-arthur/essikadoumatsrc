import "server-only";
import { headers } from "next/headers";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { rateEvents } from "@/db/schema";

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}
/** True when `key` already has `max` or more events in `bucket` within the last `windowSec` seconds. */
export async function isLimited(bucket: string, key: string, max: number, windowSec: number) {
  const [{ n }] = await db.select({ n: count() }).from(rateEvents)
    .where(and(eq(rateEvents.bucket, bucket), eq(rateEvents.key, key), gte(rateEvents.createdAt, new Date(Date.now() - windowSec * 1000))));
  return n >= max;
}
export async function record(bucket: string, key: string) {
  await db.insert(rateEvents).values({ bucket, key });
  if (Math.random() < 0.02) await db.delete(rateEvents).where(lt(rateEvents.createdAt, new Date(Date.now() - 86_400_000))); // housekeeping
}
