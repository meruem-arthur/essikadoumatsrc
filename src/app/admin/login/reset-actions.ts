"use server";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, gte, isNull, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { users, passwordResets } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { clientIp, isLimited, record } from "@/lib/ratelimit";

const sha = (t: string) => createHash("sha256").update(t).digest("hex");
const TTL_MIN = 30, MAX_PER_HOUR = 3;
type State = { error?: string; ok?: string } | undefined;

export async function requestReset(_: State, fd: FormData): Promise<State> {
  const generic = { ok: "If an account exists for that email, a reset link has been sent. It expires in 30 minutes." };
  const p = z.string().trim().email().toLowerCase().safeParse(fd.get("email"));
  if (!p.success) return { error: "Enter a valid email address." };
  try {
    const ip = await clientIp();
    if (await isLimited("reset-ip", ip, 10, 3600)) return generic;
    await record("reset-ip", ip);
    const [u] = await db.select().from(users).where(eq(users.email, p.data));
    if (!u || !u.isActive) return generic; // identical response: don't reveal which emails exist
    const [{ n }] = await db.select({ n: count() }).from(passwordResets)
      .where(and(eq(passwordResets.userId, u.id), gte(passwordResets.createdAt, new Date(Date.now() - 3600_000))));
    if (n >= MAX_PER_HOUR) return generic;
    const token = randomBytes(32).toString("base64url");
    await db.insert(passwordResets).values({ userId: u.id, tokenHash: sha(token), expiresAt: new Date(Date.now() + TTL_MIN * 60_000) });
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await sendMail({ to: u.email, subject: "Reset your SRC admin password",
      text: `Hello ${u.name},\n\nUse this link to set a new password (valid for ${TTL_MIN} minutes, one use):\n\n${base}/admin/reset-password?token=${token}\n\nIf you didn't ask for this, ignore this email; your password stays the same.` });
  } catch (e) { console.error("[reset]", (e as Error).message); }
  return generic;
}

export async function resetPassword(token: string, _: State, fd: FormData): Promise<State> {
  const p = z.object({ next: z.string().min(12, "Password must be at least 12 characters").max(100), confirm: z.string() }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  if (p.data.next !== p.data.confirm) return { error: "Passwords don't match." };
  const th = sha(token);
  const [r] = await db.select().from(passwordResets).where(and(eq(passwordResets.tokenHash, th), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date())));
  if (!r) return { error: "This link is invalid or has expired. Request a new one." };
  await db.update(users).set({ passwordHash: await hashPassword(p.data.next) }).where(eq(users.id, r.userId)); // also signs out all sessions
  await db.update(passwordResets).set({ usedAt: new Date() }).where(and(eq(passwordResets.userId, r.userId), isNull(passwordResets.usedAt)));
  redirect("/admin/login?reset=1");
}
