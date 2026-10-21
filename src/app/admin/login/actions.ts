"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword, destroySession } from "@/lib/auth";
import { clientIp, isLimited, record } from "@/lib/ratelimit";

const schema = z.object({ email: z.string().email().toLowerCase(), password: z.string().min(1) });
const DUMMY = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO5H3EoQXtM0uRk0b3qkMUXBGeSk3KZ9G"; // keeps timing similar when the user doesn't exist

export async function login(_: { error?: string } | undefined, form: FormData) {
  const p = schema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!p.success) return { error: "Enter a valid email and password." };
  const ip = await clientIp();
  // 5 failures per email and 20 per IP in 15 minutes; successful logins don't count.
  if ((await isLimited("login-email", p.data.email, 5, 900)) || (await isLimited("login-ip", ip, 20, 900)))
    return { error: "Too many failed attempts. Please wait 15 minutes and try again." };
  const [u] = await db.select().from(users).where(eq(users.email, p.data.email));
  const ok = await verifyPassword(p.data.password, u?.passwordHash ?? DUMMY);
  if (!u || !u.isActive || !ok) { await record("login-email", p.data.email); await record("login-ip", ip); return { error: "Invalid credentials." }; }
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, u.id));
  await createSession(u.id, u.passwordHash);
  redirect("/admin/dashboard");
}
export async function logout() { await destroySession(); redirect("/admin/login"); }
