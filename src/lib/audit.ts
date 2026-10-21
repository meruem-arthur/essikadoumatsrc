import "server-only";
import { db } from "@/db";
import { auditLog } from "@/db/schema";

/** Never lets a logging failure break the action being logged. */
export async function audit(who: { userId: string; name: string }, action: string, resource: string, label?: string | null, recordId?: string | null) {
  try { await db.insert(auditLog).values({ userId: who.userId, userName: who.name, action, resource, label: label?.slice(0, 200) ?? null, recordId: recordId ?? null }); }
  catch (e) { console.error("[audit]", (e as Error).message); }
}
