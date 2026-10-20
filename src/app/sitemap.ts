import type { MetadataRoute } from "next";
import * as q from "@/lib/queries";

export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [news, projects, events, execs, albums, committees] = await Promise.all([
    q.publishedNews(500), q.publishedProjects(500), q.upcomingEvents(200), q.executivesList(), q.albums({ limit: 500 }), q.committeesByKind("committee")]);
  const fixed = ["", "/about", "/judicial-committee", "/local-nugs", "/constitution", "/executives", "/committees", "/news", "/projects", "/events", "/media", "/academics", "/resources", "/freshers-guide", "/contact"];
  return [
    ...fixed.map((p) => ({ url: `${base}${p}` })),
    ...news.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: n.updatedAt })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updatedAt })),
    ...events.map((e) => ({ url: `${base}/events/${e.slug}`, lastModified: e.updatedAt })),
    ...execs.map((e) => ({ url: `${base}/executives/${e.slug}` })),
    ...albums.map((a) => ({ url: `${base}/media/${a.slug}`, lastModified: a.updatedAt })),
    ...committees.map((c) => ({ url: `${base}/committees/${c.slug}` })),
  ];
}
