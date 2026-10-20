import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { EditUserForm } from "@/features/admin/UserForms";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin("users:write"); const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [u] = await db.select().from(users).where(eq(users.id, id)); if (!u) notFound();
  const roleList = await db.select({ id: roles.id, name: roles.name }).from(roles).orderBy(asc(roles.name));
  return (<div className="space-y-4"><h1 className="display text-4xl">Edit user</h1>
    <EditUserForm id={id} roles={roleList} isSelf={id === me.userId} user={{ name: u.name, email: u.email, roleId: u.roleId, isActive: u.isActive }} /></div>);
}
