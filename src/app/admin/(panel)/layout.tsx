import Link from "next/link";
import { eq, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { RESOURCES, GROUPS } from "@/features/admin/resources";
import { logout } from "../login/actions";

export const dynamic = "force-dynamic";
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  const showMsgs = can(s.permissions, "messages:write");
  const unread = showMsgs ? (await db.select({ n: count() }).from(messages).where(eq(messages.isRead, false)))[0].n : 0;
  const link = "block rounded px-2 py-1 hover:bg-white/10";
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-forest p-4 text-chalk md:min-h-screen md:w-64 md:shrink-0">
        <p className="display mb-1 text-2xl">SRC Admin</p><p className="mb-4 text-xs opacity-60">UMaT Essikado</p>
        <nav className="flex gap-4 overflow-x-auto whitespace-nowrap pb-2 text-sm md:flex-col md:gap-3 md:overflow-visible md:pb-0">
          <Link href="/admin/dashboard" className={link}>Dashboard</Link>
          {showMsgs && <Link href="/admin/messages" className={link}>Messages{unread > 0 && <span className="ml-2 rounded-full bg-gold px-2 text-xs font-bold text-ink">{unread}</span>}</Link>}
          {GROUPS.map((g) => {
            const items = Object.values(RESOURCES).filter((r) => r.group === g && can(s.permissions, r.perm));
            if (!items.length) return null;
            return (<div key={g} className="md:mt-1"><p className="hidden px-2 text-[10px] tracking-[.28em] text-goldlight md:block">{g.toUpperCase()}</p>
              <div className="flex gap-2 md:block">{items.map((r) => <Link key={r.key} href={`/admin/${r.key}`} className={link}>{r.label}</Link>)}</div></div>);
          })}
          {can(s.permissions, "settings:write") && <Link href="/admin/settings" className={link}>Settings</Link>}
          {can(s.permissions, "users:write") && <Link href="/admin/users" className={link}>Admin Users</Link>}
          <Link href="/admin/account" className={link}>My account</Link>
          <Link href="/" target="_blank" className={`${link} opacity-70`}>View site ↗</Link>
        </nav>
        <form action={logout} className="mt-6"><p className="mb-2 text-xs opacity-60">{s.name} · {s.role}</p>
          <button className="rounded bg-gold px-3 py-1 text-sm font-semibold text-ink">Log out</button></form>
      </aside>
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
