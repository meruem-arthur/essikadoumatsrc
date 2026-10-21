import Link from "next/link";
import { desc, count } from "drizzle-orm";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const PAGE = 50;
export default async function Page({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  await requireAdmin("activity:read");
  const page = Math.max(1, Number((await searchParams).p) || 1);
  const [rows, [{ n }]] = await Promise.all([
    db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(PAGE).offset((page - 1) * PAGE),
    db.select({ n: count() }).from(auditLog)]);
  return (<div className="max-w-4xl space-y-4"><h1 className="display text-4xl">Activity log</h1>
    <p className="text-sm text-black/60">Who changed what, most recent first.</p>
    {rows.length === 0 ? <p className="rounded-xl bg-white p-10 text-center text-black/60">No activity recorded yet.</p> : (
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm">
        <thead className="bg-black/5"><tr><th className="p-3">When</th><th className="p-3">Who</th><th className="p-3">Action</th><th className="p-3">What</th></tr></thead>
        <tbody>{rows.map((r) => (<tr key={r.id} className="border-t border-black/5">
          <td className="whitespace-nowrap p-3 text-black/60">{r.createdAt.toLocaleString("en-GB", { timeZone: "Africa/Accra" })}</td>
          <td className="p-3 font-semibold">{r.userName}</td><td className="p-3">{r.action}</td>
          <td className="p-3"><span className="text-black/50">{r.resource}</span>{r.label && <> · {r.label}</>}</td></tr>))}</tbody></table></div>)}
    <p className="text-sm text-black/60">{n} entries · page {page} of {Math.max(1, Math.ceil(n / PAGE))}
      {page > 1 && <Link className="ml-3 text-emerald" href={`?p=${page - 1}`}>Newer</Link>}{page * PAGE < n && <Link className="ml-3 text-emerald" href={`?p=${page + 1}`}>Older</Link>}</p></div>);
}
