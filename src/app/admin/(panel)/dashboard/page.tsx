import Link from "next/link";
import { count, eq, gte, and } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function Dashboard() {
  await requireAdmin();
  const c = async (t: any, w?: any) => (await db.select({ n: count() }).from(t).where(w))[0].n;
  const stats: [string, number, string][] = [
    ["Executives", await c(s.executives, eq(s.executives.isActive, true)), "executives"],
    ["Committees", await c(s.committees), "committees"],
    ["Published news", await c(s.news, eq(s.news.status, "published")), "news"],
    ["Projects", await c(s.projects, eq(s.projects.publishStatus, "published")), "projects"],
    ["Upcoming events", await c(s.events, and(eq(s.events.status, "published"), gte(s.events.startsAt, new Date()))), "events"],
    ["Media albums", await c(s.galleryAlbums), "gallery"],
    ["Unread messages", await c(s.messages, eq(s.messages.isRead, false)), "messages"],
  ];
  return (<div className="space-y-6"><h1 className="display text-4xl">Dashboard</h1>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{stats.map(([l, n, h]) => (
      <Link key={l} href={`/admin/${h}`} className="rounded-xl bg-white p-5 shadow-sm hover:shadow-md"><p className="display text-5xl text-emerald">{n}</p><p className="text-sm text-black/60">{l}</p></Link>))}</div>
    <p className="text-sm text-black/60">Tip: start with Site → Homepage Hero, then Settings, Executives and Pages.</p></div>);
}
