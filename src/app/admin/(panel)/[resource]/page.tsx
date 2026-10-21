import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, ilike, count } from "drizzle-orm";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { RESOURCES } from "@/features/admin/resources";
import { remove } from "@/features/admin/actions";
import DeleteButton from "@/features/admin/DeleteButton";

const PAGE = 20;
export default async function ListPage({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ q?: string; p?: string; saved?: string; deleted?: string }> }) {
  const { resource } = await params; const { q = "", p = "1", saved, deleted } = await searchParams;
  const r = RESOURCES[resource]; if (!r) notFound();
  await requireAdmin(r.perm);
  const where = q ? ilike(r.table[r.titleCol], `%${q}%`) : undefined;
  const page = Math.max(1, Number(p) || 1);
  const sort = r.orderBy ? asc(r.table[r.orderBy]) : desc(r.table.createdAt ?? r.table.id);
  const rows = await db.select().from(r.table).where(where).orderBy(sort).limit(PAGE).offset((page - 1) * PAGE);
  const [{ n }] = await db.select({ n: count() }).from(r.table).where(where);
  const show = (v: any) => v == null ? "—" : typeof v === "boolean" ? (v ? "Yes" : "No") : v instanceof Date ? v.toLocaleString("en-GB", { timeZone: "Africa/Accra" }) : String(v).slice(0, 80);
  return (
    <div className="space-y-4">
      {(saved || deleted) && <p role="status" className="rounded-lg bg-emerald/10 px-4 py-2 text-sm font-semibold text-emerald">{saved ? "Saved successfully." : "Deleted."}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl">{r.label}</h1>
        <form className="flex gap-2"><input name="q" defaultValue={q} placeholder="Search…" className="rounded-lg border border-black/15 px-3 py-2" />
          <Link href={`/admin/${resource}/new`} className="rounded-lg bg-emerald px-4 py-2 font-semibold text-white">+ New</Link></form>
      </div>
      {rows.length === 0 ? <p className="rounded-xl bg-white p-10 text-center text-black/60">Nothing here yet.</p> : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm">
          <thead className="bg-black/5"><tr>{r.cols.map((c) => <th key={c} className="p-3 capitalize">{c.replace(/([A-Z])/g, " $1")}</th>)}<th /></tr></thead>
          <tbody>{rows.map((row: any) => (
            <tr key={row.id} className="border-t border-black/5">{r.cols.map((c) => <td key={c} className="p-3">{show(row[c])}</td>)}
              <td className="whitespace-nowrap p-3"><div className="flex items-center gap-3"><Link href={`/admin/${resource}/${row.id}`} className="text-emerald">Edit</Link>
                {r.preview && row.slug && <Link href={`${r.preview}${row.slug}?preview=1`} target="_blank" className="text-black/60 hover:text-emerald">Preview ↗</Link>}
                {resource === "gallery" && <Link href={`/admin/gallery-images/${row.id}`} className="font-semibold text-emerald">Photos</Link>}
                <DeleteButton action={remove.bind(null, resource, row.id)} /></div></td></tr>))}</tbody>
        </table></div>)}
      <p className="text-sm text-black/60">{n} total · page {page} of {Math.max(1, Math.ceil(n / PAGE))}
        {page > 1 && <Link className="ml-3 text-emerald" href={`?q=${q}&p=${page - 1}`}>Prev</Link>}
        {page * PAGE < n && <Link className="ml-3 text-emerald" href={`?q=${q}&p=${page + 1}`}>Next</Link>}</p>
    </div>
  );
}
