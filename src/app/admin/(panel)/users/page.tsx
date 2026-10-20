import Link from "next/link";
import { asc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { deleteUser } from "@/features/admin/user-actions";
import DeleteButton from "@/features/admin/DeleteButton";
import { CreateUserForm } from "@/features/admin/UserForms";

export default async function Page({ searchParams }: { searchParams: Promise<{ created?: string; saved?: string; deleted?: string }> }) {
  const me = await requireAdmin("users:write"); const f = await searchParams;
  const [rows, roleList] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, isActive: users.isActive, last: users.lastLoginAt, role: roles.name }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).orderBy(asc(users.name)),
    db.select({ id: roles.id, name: roles.name }).from(roles).orderBy(asc(roles.name))]);
  return (<div className="max-w-4xl space-y-5"><h1 className="display text-4xl">Admin Users</h1>
    {(f.created || f.saved || f.deleted) && <p role="status" className="rounded-lg bg-emerald/10 px-4 py-2 text-sm font-semibold text-emerald">{f.created ? "User created." : f.saved ? "Saved." : "User deleted."}</p>}
    <CreateUserForm roles={roleList} />
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm">
      <thead className="bg-black/5"><tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Last login</th><th /></tr></thead>
      <tbody>{rows.map((u) => (<tr key={u.id} className="border-t border-black/5">
        <td className="p-3"><p className="font-semibold">{u.name}{u.id === me.userId && " (you)"}</p><p className="text-black/50">{u.email}</p></td>
        <td className="p-3">{u.role}</td><td className="p-3">{u.isActive ? "Active" : "Disabled"}</td>
        <td className="p-3">{u.last ? u.last.toLocaleString("en-GB", { timeZone: "Africa/Accra" }) : "Never"}</td>
        <td className="whitespace-nowrap p-3"><div className="flex gap-3"><Link href={`/admin/users/${u.id}`} className="text-emerald">Edit</Link>{u.id !== me.userId && <DeleteButton action={deleteUser.bind(null, u.id)} />}</div></td></tr>))}</tbody></table></div></div>);
}
