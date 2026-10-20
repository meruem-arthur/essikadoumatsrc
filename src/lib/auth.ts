import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { can } from "./permissions";

export const COOKIE = "src_session";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET!);
export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

/** Fingerprint of the current password hash: changing a password invalidates every older session. */
const fp = (hash: string) => createHash("sha256").update(hash).digest("hex").slice(0, 16);

export async function createSession(userId: string, passwordHash: string) {
  const token = await new SignJWT({ pv: fp(passwordHash) }).setProtectedHeader({ alg: "HS256" })
    .setSubject(userId).setIssuedAt().setExpirationTime("7d").sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 604800,
  });
}
export async function destroySession() { (await cookies()).delete(COOKIE); }

/** Re-reads user + role from the DB on every request, so role changes/deactivation apply immediately. */
export const getSession = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    const [row] = await db.select({
      userId: users.id, name: users.name, email: users.email,
      active: users.isActive, role: roles.key, permissions: roles.permissions, hash: users.passwordHash,
    }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(eq(users.id, payload.sub!));
    if (!row?.active || payload.pv !== fp(row.hash)) return null;
    const { hash: _h, ...safe } = row;
    return safe;
  } catch { return null; }
});

/** Call at the top of EVERY admin page, server action and route handler. Never rely on middleware alone. */
export async function requireAdmin(permission?: string) {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (permission && !can(s.permissions, permission)) throw new Error("FORBIDDEN");
  return s;
}
