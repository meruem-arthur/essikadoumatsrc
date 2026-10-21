import Link from "next/link";
import { PageHeader, Wrap, Empty } from "@/components/public/ui";
import { searchSite, fmtDay } from "@/lib/queries";

export const metadata = { title: "Search", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const r = q.length >= 2 ? await searchSite(q) : null;
  const groups = r ? [
    { title: "News", items: r.news.map((n: any) => ({ id: n.id, href: `/news/${n.slug}`, title: n.title, sub: `${n.category} · ${fmtDay(n.publishedAt)}` })) },
    { title: "Projects", items: r.projects.map((p: any) => ({ id: p.id, href: `/projects/${p.slug}`, title: p.title, sub: p.status })) },
    { title: "Events", items: r.events.map((e: any) => ({ id: e.id, href: `/events/${e.slug}`, title: e.title, sub: fmtDay(e.startsAt) })) },
    { title: "Executives", items: r.executives.map((e: any) => ({ id: e.id, href: `/executives/${e.slug}`, title: e.fullName, sub: e.position })) },
    { title: "Committees", items: r.committees.map((c: any) => ({ id: c.id, href: `/committees/${c.slug}`, title: c.name, sub: "" })) },
  ].filter((g) => g.items.length) : [];
  return (<><PageHeader pageKey="search" title="Search" sub="Find news, projects, events and people." />
    <Wrap narrow>
      <form action="/search" className="flex gap-2"><input name="q" defaultValue={q} autoFocus type="search" placeholder="Search the SRC site…" className="min-w-0 flex-1 rounded-lg border border-black/15 bg-white px-4 py-3" />
        <button className="rounded-lg bg-emerald px-5 font-semibold text-white">Search</button></form>
      {r === null ? (q ? <Empty>Type at least 2 characters.</Empty> : null)
        : groups.length === 0 ? <Empty>No results for “{q}”.</Empty>
        : groups.map((g) => (<section key={g.title}><h2 className="display mb-3 text-3xl">{g.title}</h2>
          <ul className="divide-y divide-black/10 rounded-xl bg-white shadow-sm">{g.items.map((i: any) => (<li key={i.id}>
            <Link href={i.href} className="block p-4 hover:bg-black/5"><p className="font-semibold">{i.title}</p>{i.sub && <p className="text-sm capitalize text-black/50">{i.sub}</p>}</Link></li>))}</ul></section>))}
    </Wrap></>);
}
