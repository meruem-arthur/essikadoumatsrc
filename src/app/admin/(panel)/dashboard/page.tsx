import Link from "next/link";
import { count, eq, gte, and, like, inArray } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  await requireAdmin();
  const { denied } = await searchParams;
  const c = async (t: any, w?: any) => (await db.select({ n: count() }).from(t).where(w))[0].n as number;
  const st = await getSettings();
  const [heroes, execs, president, news, events, albumsWithPhotos, banners, statsN, placeholders, pagesN] = await Promise.all([
    c(s.heroSlides, eq(s.heroSlides.isActive, true)), c(s.executives, eq(s.executives.isActive, true)),
    db.select().from(s.executives).where(eq(s.executives.isActive, true)).orderBy(s.executives.displayOrder).limit(1),
    c(s.news, eq(s.news.status, "published")), c(s.events, eq(s.events.status, "published")),
    c(s.galleryAlbums, eq(s.galleryAlbums.status, "published")), c(s.pageHeroes), c(s.stats, eq(s.stats.isActive, true)),
    c(s.pages, like(s.pages.body, "%Edit this page in Admin%")), c(s.pages)]);
  const emailReady = !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
  const checks: { ok: boolean; label: string; href: string }[] = [
    { ok: !!(st.email && st.phone && st.address), label: "Contact details (email, phone, address)", href: "/admin/settings" },
    { ok: !!st.logo, label: "SRC logo uploaded", href: "/admin/settings" },
    { ok: !!st.portalUrl, label: "Student portal link", href: "/admin/settings" },
    { ok: heroes >= 1, label: "At least one homepage hero slide", href: "/admin/hero-slides" },
    { ok: execs >= 1 && !!president[0]?.profileImage, label: "Executives added (President has a photo)", href: "/admin/executives" },
    { ok: pagesN >= 6 && placeholders === 0, label: `Pages edited (${placeholders} still using placeholder text)`, href: "/admin/pages" },
    { ok: statsN >= 1, label: "Home stats", href: "/admin/stats" },
    { ok: banners >= 6, label: `Page banner photos (${banners} set)`, href: "/admin/page-heroes" },
    { ok: news >= 1, label: "At least one published news story", href: "/admin/news" },
    { ok: events >= 1, label: "At least one published event", href: "/admin/events" },
    { ok: albumsWithPhotos >= 1, label: "At least one published media album", href: "/admin/gallery" },
    { ok: emailReady, label: "Email sending configured (password reset + contact alerts)", href: "https://resend.com" },
  ];
  const done = checks.filter((x) => x.ok).length;
  const tiles: [string, number, string][] = [
    ["Executives", execs, "executives"], ["Published news", news, "news"], ["Upcoming events", await c(s.events, and(eq(s.events.status, "published"), gte(s.events.startsAt, new Date()))), "events"],
    ["Projects", await c(s.projects, eq(s.projects.publishStatus, "published")), "projects"], ["Media albums", albumsWithPhotos, "gallery"],
    ["Videos", await c(s.videos, eq(s.videos.status, "published")), "videos"], ["Unread messages", await c(s.messages, eq(s.messages.isRead, false)), "messages"]];
  return (<div className="space-y-6"><h1 className="display text-4xl">Dashboard</h1>
    {denied && <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">You don't have permission to open that page. Ask a Super Admin if you need access.</p>}
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{tiles.map(([l, n, h]) => (
      <Link key={l} href={`/admin/${h}`} className="rounded-xl bg-white p-5 shadow-sm hover:shadow-md"><p className="display text-5xl text-emerald">{n}</p><p className="text-sm text-black/60">{l}</p></Link>))}</div>
    <section className="max-w-2xl rounded-xl bg-white p-6 shadow-sm"><div className="mb-3 flex items-baseline justify-between"><h2 className="display text-3xl">Launch checklist</h2><p className="text-sm font-semibold text-emerald">{done} / {checks.length}</p></div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full bg-emerald" style={{ width: `${(done / checks.length) * 100}%` }} /></div>
      <ul className="space-y-2 text-sm">{checks.map((x) => (<li key={x.label} className="flex items-start gap-2">
        <span className={x.ok ? "text-emerald" : "text-black/30"} aria-hidden>{x.ok ? "✓" : "○"}</span>
        {x.ok ? <span className="text-black/50 line-through">{x.label}</span> : <Link href={x.href} className="font-semibold hover:text-emerald">{x.label} →</Link>}</li>))}</ul></section></div>);
}
