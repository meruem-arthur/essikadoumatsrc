import "server-only";
import { and, asc, desc, eq, gte, ilike, isNull, lte, or, isNotNull, ne } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";

/**
 * Public queries never throw: if the DB is unreachable (e.g. at build time before
 * env vars exist) pages render their empty states instead of failing the build.
 */
function safe<A extends unknown[], R>(fn: (...a: A) => PromiseLike<R>, fallback: R) {
  return async (...a: A): Promise<R> => {
    try { return await fn(...a); } catch (e) { console.error("[db]", (e as Error).message); return fallback; }
  };
}
const first = <T>(rows: T[]) => rows[0] as T | undefined;

export const fmt = (d: Date | string | null) => d ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" }).format(new Date(d)) : "";
export const fmtDay = (d: Date | string | null) => d ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Africa/Accra" }).format(new Date(d)) : "";
export const fmtParts = (d: Date | string) => {
  const x = new Date(d);
  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: "Africa/Accra" }).format(x),
    month: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "Africa/Accra" }).format(x),
    time: new Intl.DateTimeFormat("en-GB", { timeStyle: "short", timeZone: "Africa/Accra" }).format(x),
  };
};

// ---- Settings ----
export type Settings = Awaited<ReturnType<typeof getSettings>>;
export const getSettings = safe(async () => {
  const rows = await db.select().from(s.siteSettings);
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, any>;
  return {
    siteName: (m.site_name as string) ?? "UMaT Essikado SRC",
    tagline: m.tagline as string | undefined,
    campus: (m.campus as string) ?? "Essikado Campus",
    email: m.contact_email as string | undefined,
    phone: m.phone as string | undefined,
    address: m.address as string | undefined,
    poBox: m.po_box as string | undefined,
    hours: m.office_hours as string | undefined,
    footer: m.footer_text as string | undefined,
    sportsUrl: m.sports_url as string | undefined,
    railersUrl: m.railers_url as string | undefined,
    portalUrl: m.portal_url as string | undefined,
    mapUrl: m.map_url as string | undefined,
    socials: (m.socials ?? {}) as Record<string, string>,
    logo: m.logo as s.Img | undefined,
    sidebarImage: m.sidebar_image as s.Img | undefined,
  };
}, { siteName: "UMaT Essikado SRC", campus: "Essikado Campus", socials: {} } as any);

// ---- Heroes & pages ----
export const heroSlides = safe(() => db.select().from(s.heroSlides).where(eq(s.heroSlides.isActive, true)).orderBy(asc(s.heroSlides.displayOrder)), []);
export const pageHero = safe(async (key: string) => first(await db.select().from(s.pageHeroes).where(eq(s.pageHeroes.pageKey, key)).limit(1)), undefined);
export const pageByKey = safe(async (key: string) => first(await db.select().from(s.pages).where(eq(s.pages.pageKey, key)).limit(1)), undefined);

// ---- Home blocks ----
export const activeStats = safe(() => db.select().from(s.stats).where(eq(s.stats.isActive, true)).orderBy(asc(s.stats.displayOrder)), []);
export const activePillars = safe(() => db.select().from(s.pillars).where(eq(s.pillars.isActive, true)).orderBy(asc(s.pillars.displayOrder)), []);
export const quickLinks = safe(() => db.select().from(s.quickLinks).where(eq(s.quickLinks.isActive, true)).orderBy(asc(s.quickLinks.displayOrder)), []);
export const activeDocuments = safe(() => db.select().from(s.documents).where(eq(s.documents.isActive, true)).orderBy(asc(s.documents.displayOrder)), []);

// ---- People ----
export const executivesList = safe((limit?: number) => {
  const q = db.select().from(s.executives).where(eq(s.executives.isActive, true)).orderBy(asc(s.executives.displayOrder));
  return limit ? q.limit(limit) : q;
}, []);
export const executiveBySlug = safe(async (slug: string) => first(await db.select().from(s.executives).where(and(eq(s.executives.slug, slug), eq(s.executives.isActive, true)))), undefined);

export const committeesByKind = safe((kind: "committee" | "judicial" | "nugs") =>
  db.select().from(s.committees).where(and(eq(s.committees.kind, kind), eq(s.committees.isActive, true))).orderBy(asc(s.committees.displayOrder)), []);
export const committeeBySlug = safe(async (slug: string) => first(await db.select().from(s.committees).where(and(eq(s.committees.slug, slug), eq(s.committees.isActive, true)))), undefined);
export const membersOf = safe((committeeId: string) =>
  db.select().from(s.committeeMembers).where(and(eq(s.committeeMembers.committeeId, committeeId), eq(s.committeeMembers.isActive, true))).orderBy(asc(s.committeeMembers.displayOrder)), []);
export const membersOfKind = safe((kind: "committee" | "judicial" | "nugs") =>
  db.select({ m: s.committeeMembers, committee: s.committees.name }).from(s.committeeMembers)
    .innerJoin(s.committees, eq(s.committeeMembers.committeeId, s.committees.id))
    .where(and(eq(s.committees.kind, kind), eq(s.committees.isActive, true), eq(s.committeeMembers.isActive, true)))
    .orderBy(asc(s.committees.displayOrder), asc(s.committeeMembers.displayOrder)), []);

// ---- News / projects / events / announcements ----
const live = () => and(eq(s.news.status, "published"), lte(s.news.publishedAt, new Date()));
export const publishedNews = safe((limit: number = 50, category?: string) =>
  db.select().from(s.news).where(and(live(), category ? eq(s.news.category, category) : undefined)).orderBy(desc(s.news.publishedAt)).limit(limit), []);
export const newsBySlug = safe(async (slug: string, preview: boolean = false) => first(await db.select().from(s.news).where(and(eq(s.news.slug, slug), preview ? undefined : live()))), undefined);
export const relatedNews = safe((id: string) => db.select().from(s.news).where(and(live(), ne(s.news.id, id))).orderBy(desc(s.news.publishedAt)).limit(3), []);

export const publishedProjects = safe((limit: number = 50) =>
  db.select().from(s.projects).where(eq(s.projects.publishStatus, "published")).orderBy(desc(s.projects.isFeatured), desc(s.projects.createdAt)).limit(limit), []);
export const projectBySlug = safe(async (slug: string, preview: boolean = false) => first(await db.select().from(s.projects).where(and(eq(s.projects.slug, slug), preview ? undefined : eq(s.projects.publishStatus, "published")))), undefined);

export const upcomingEvents = safe((limit: number = 50) =>
  db.select().from(s.events).where(and(eq(s.events.status, "published"), gte(s.events.startsAt, new Date()))).orderBy(asc(s.events.startsAt)).limit(limit), []);
export const pastEvents = safe((limit: number = 50) =>
  db.select().from(s.events).where(and(eq(s.events.status, "published"), lte(s.events.startsAt, new Date()))).orderBy(desc(s.events.startsAt)).limit(limit), []);
export const eventBySlug = safe(async (slug: string, preview: boolean = false) => first(await db.select().from(s.events).where(and(eq(s.events.slug, slug), preview ? undefined : eq(s.events.status, "published")))), undefined);

export const latestAnnouncement = safe(async () => first(await db.select().from(s.announcements).where(and(eq(s.announcements.status, "published"),
  or(isNull(s.announcements.expiresAt), gte(s.announcements.expiresAt, new Date())))).orderBy(desc(s.announcements.priority), desc(s.announcements.publishedAt)).limit(1)), undefined);
export const announcementsList = safe(() => db.select().from(s.announcements).where(and(eq(s.announcements.status, "published"),
  or(isNull(s.announcements.expiresAt), gte(s.announcements.expiresAt, new Date())))).orderBy(desc(s.announcements.publishedAt)), []);
export const announcementBySlug = safe(async (slug: string, preview: boolean = false) => first(await db.select().from(s.announcements).where(and(eq(s.announcements.slug, slug), preview ? undefined : eq(s.announcements.status, "published")))), undefined);

// ---- Gallery / media ----
export const albums = safe((opts: { year?: number; limit?: number } = {}) =>
  db.select().from(s.galleryAlbums).where(and(eq(s.galleryAlbums.status, "published"), opts.year ? eq(s.galleryAlbums.year, opts.year) : undefined))
    .orderBy(desc(s.galleryAlbums.isFeatured), desc(s.galleryAlbums.albumDate), desc(s.galleryAlbums.createdAt)).limit(opts.limit ?? 100), []);
export const albumYears = safe(async () => (await db.selectDistinct({ y: s.galleryAlbums.year }).from(s.galleryAlbums)
  .where(and(eq(s.galleryAlbums.status, "published"), isNotNull(s.galleryAlbums.year))).orderBy(desc(s.galleryAlbums.year))).map((r) => r.y as number), [] as number[]);
export const albumBySlug = safe(async (slug: string, preview: boolean = false) => first(await db.select().from(s.galleryAlbums).where(and(eq(s.galleryAlbums.slug, slug), preview ? undefined : eq(s.galleryAlbums.status, "published")))), undefined);
export const albumImages = safe((albumId: string) => db.select().from(s.galleryImages).where(eq(s.galleryImages.albumId, albumId)).orderBy(asc(s.galleryImages.displayOrder)), []);
/** Photos for the home page "Life & Culture" strip: newest images from published albums. */
export const recentPhotos = safe((limit: number = 12) =>
  db.select({ img: s.galleryImages, album: s.galleryAlbums.title }).from(s.galleryImages)
    .innerJoin(s.galleryAlbums, eq(s.galleryImages.albumId, s.galleryAlbums.id))
    .where(eq(s.galleryAlbums.status, "published")).orderBy(desc(s.galleryImages.createdAt)).limit(limit), []);

// ---- Videos ----
export const publishedVideos = safe((limit: number = 60) =>
  db.select().from(s.videos).where(eq(s.videos.status, "published")).orderBy(asc(s.videos.displayOrder), desc(s.videos.createdAt)).limit(limit), []);

// ---- Search ----
const like = (term: string) => `%${term.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
export const searchSite = safe(async (term: string) => {
  const pat = like(term);
  const [newsR, projectsR, eventsR, execsR, committeesR] = await Promise.all([
    db.select().from(s.news).where(and(live(), or(ilike(s.news.title, pat), ilike(s.news.excerpt, pat), ilike(s.news.content, pat)))).orderBy(desc(s.news.publishedAt)).limit(8),
    db.select().from(s.projects).where(and(eq(s.projects.publishStatus, "published"), or(ilike(s.projects.title, pat), ilike(s.projects.summary, pat), ilike(s.projects.content, pat)))).limit(8),
    db.select().from(s.events).where(and(eq(s.events.status, "published"), or(ilike(s.events.title, pat), ilike(s.events.description, pat), ilike(s.events.venue, pat)))).orderBy(desc(s.events.startsAt)).limit(8),
    db.select().from(s.executives).where(and(eq(s.executives.isActive, true), or(ilike(s.executives.fullName, pat), ilike(s.executives.position, pat), ilike(s.executives.programme, pat)))).limit(8),
    db.select().from(s.committees).where(and(eq(s.committees.isActive, true), eq(s.committees.kind, "committee"), or(ilike(s.committees.name, pat), ilike(s.committees.description, pat)))).limit(8),
  ]);
  return { news: newsR, projects: projectsR, events: eventsR, executives: execsR, committees: committeesR };
}, { news: [], projects: [], events: [], executives: [], committees: [] } as any);
