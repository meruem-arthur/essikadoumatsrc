"use server";
import { and, eq, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { requireAdmin, hashPassword, verifyPassword, createSession } from "@/lib/auth";

type State = { error?: string; ok?: string } | undefined;
const password = z.string().min(12, "Password must be at least 12 characters").max(100);
const uuid = z.string().uuid();

/** Never leave the site without an active Super Admin. */
async function otherActiveSuperAdmins(excludeId: string) {
  const [sa] = await db.select().from(roles).where(eq(roles.key, "super_admin"));
  const rows = await db.select({ id: users.id }).from(users).where(and(eq(users.roleId, sa.id), eq(users.isActive, true)));
  return rows.filter((r) => r.id !== excludeId).length;
}

export async function createUser(_: State, fd: FormData): Promise<State> {
  await requireAdmin("users:write");
  const p = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().toLowerCase(), roleId: uuid, password })
    .safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  try {
    await db.insert(users).values({ name: p.data.name, email: p.data.email, roleId: p.data.roleId, passwordHash: await hashPassword(p.data.password) });
  } catch { return { error: "That email is already in use." }; }
  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function updateUser(id: string, _: State, fd: FormData): Promise<State> {
  const me = await requireAdmin("users:write");
  uuid.parse(id);
  const p = z.object({ name: z.string().trim().min(2).max(100), roleId: uuid, newPassword: z.string().max(100).optional() }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  const isActive = fd.get("isActive") === "on";
  const [target] = await db.select({ roleKey: roles.key }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(eq(users.id, id));
  if (!target) return { error: "User not found." };
  const [newRole] = await db.select().from(roles).where(eq(roles.id, p.data.roleId));
  if (!newRole) return { error: "Unknown role." };
  const losesSuper = target.roleKey === "super_admin" && (newRole.key !== "super_admin" || !isActive);
  if (losesSuper && (await otherActiveSuperAdmins(id)) === 0) return { error: "There must always be at least one active Super Admin." };
  if (id === me.userId && !isActive) return { error: "You can't deactivate your own account." };
  const set: Record<string, unknown> = { name: p.data.name, roleId: p.data.roleId, isActive };
  if (p.data.newPassword) {
    const pw = password.safeParse(p.data.newPassword);
    if (!pw.success) return { error: pw.error.issues[0].message };
    set.passwordHash = await hashPassword(pw.data);
  }
  await db.update(users).set(set).where(eq(users.id, id));
  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

export async function deleteUser(id: string) {
  const me = await requireAdmin("users:write");
  uuid.parse(id);
  if (id === me.userId) return;
  const [target] = await db.select({ roleKey: roles.key }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(eq(users.id, id));
  if (target?.roleKey === "super_admin" && (await otherActiveSuperAdmins(id)) === 0) return;
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");
  redirect("/admin/users?deleted=1");
}

/** Any signed-in admin can change their own password (needs the current one). Other sessions are signed out. */
export async function changeOwnPassword(_: State, fd: FormData): Promise<State> {
  const me = await requireAdmin();
  const p = z.object({ current: z.string().min(1), next: password, confirm: z.string() }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  if (p.data.next !== p.data.confirm) return { error: "New passwords don't match." };
  const [u] = await db.select().from(users).where(eq(users.id, me.userId));
  if (!(await verifyPassword(p.data.current, u.passwordHash))) return { error: "Current password is incorrect." };
  const hash = await hashPassword(p.data.next);
  await db.update(users).set({ passwordHash: hash }).where(eq(users.id, u.id));
  await createSession(u.id, hash); // keep this browser signed in with the new fingerprint
  return { ok: "Password updated. Other devices have been signed out." };
}
