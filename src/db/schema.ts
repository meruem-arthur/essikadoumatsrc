import { pgTable, uuid, text, integer, boolean, timestamp, date, jsonb, pgEnum, index } from "drizzle-orm/pg-core";

/** Every image is stored as a Cloudinary reference. */
export type Img = { publicId: string; url: string; alt?: string };

const id = () => uuid("id").primaryKey().defaultRandom();
const stamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};
const img = (n: string) => jsonb(n).$type<Img>();
const slug = () => text("slug").notNull().unique();

export const publishStatus = pgEnum("publish_status", ["draft", "published"]);
export const priority = pgEnum("priority", ["low", "normal", "high", "urgent"]);
export const committeeKind = pgEnum("committee_kind", ["committee", "judicial", "nugs"]);
export const projectStatus = pgEnum("project_status", ["planned", "ongoing", "completed"]);

// ---- Auth (permissions are strings like "news:write"; "*" = everything) ----
export const roles = pgTable("roles", {
  id: id(), key: text("key").notNull().unique(), name: text("name").notNull(),
  permissions: text("permissions").array().notNull().default([]), ...stamps,
});
export const users = pgTable("users", {
  id: id(), email: text("email").notNull().unique(), name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  roleId: uuid("role_id").notNull().references(() => roles.id),
  isActive: boolean("is_active").notNull().default(true), lastLoginAt: timestamp("last_login_at"), ...stamps,
});

// ---- People ----
export const executives = pgTable("executives", {
  id: id(), fullName: text("full_name").notNull(), slug: slug(), position: text("position").notNull(),
  programme: text("programme"), level: text("level"), bio: text("bio"), email: text("email"),
  profileImage: img("profile_image"),
  isActive: boolean("is_active").notNull().default(true), displayOrder: integer("display_order").notNull().default(0), ...stamps,
});
export const pillars = pgTable("pillars", {
  id: id(), fullName: text("full_name").notNull(), title: text("title").notNull(), message: text("message"),
  profileImage: img("profile_image"),
  isActive: boolean("is_active").notNull().default(true), displayOrder: integer("display_order").notNull().default(0), ...stamps,
});
/** kind: "committee" → /committees, "judicial" → /judicial-committee, "nugs" → /local-nugs */
export const committees = pgTable("committees", {
  id: id(), name: text("name").notNull(), slug: slug(), kind: committeeKind("kind").notNull().default("committee"),
  description: text("description"), coverImage: img("cover_image"),
  isActive: boolean("is_active").notNull().default(true), displayOrder: integer("display_order").notNull().default(0), ...stamps,
});
export const committeeMembers = pgTable("committee_members", {
  id: id(), committeeId: uuid("committee_id").notNull().references(() => committees.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(), role: text("role"), profileImage: img("profile_image"), bio: text("bio"),
  isActive: boolean("is_active").notNull().default(true), displayOrder: integer("display_order").notNull().default(0), ...stamps,
}, (t) => [index("cm_committee_idx").on(t.committeeId)]);

// ---- Editorial ----
export const news = pgTable("news", {
  id: id(), title: text("title").notNull(), slug: slug(), category: text("category").notNull().default("news"),
  excerpt: text("excerpt"), content: text("content").notNull(), coverImage: img("cover_image"),
  author: text("author"), isFeatured: boolean("is_featured").notNull().default(false),
  status: publishStatus("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }), ...stamps,
});
export const projects = pgTable("projects", {
  id: id(), title: text("title").notNull(), slug: slug(), summary: text("summary"), content: text("content"),
  coverImage: img("cover_image"), status: projectStatus("status").notNull().default("ongoing"), year: text("year"),
  isFeatured: boolean("is_featured").notNull().default(false),
  publishStatus: publishStatus("publish_status").notNull().default("draft"), ...stamps,
});
export const events = pgTable("events", {
  id: id(), title: text("title").notNull(), slug: slug(), description: text("description"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(), endsAt: timestamp("ends_at", { withTimezone: true }),
  venue: text("venue"), coverImage: img("cover_image"), isFeatured: boolean("is_featured").notNull().default(false),
  status: publishStatus("status").notNull().default("draft"), ...stamps,
});
export const announcements = pgTable("announcements", {
  id: id(), title: text("title").notNull(), slug: slug(), description: text("description").notNull(),
  flyer: img("flyer"), priority: priority("priority").notNull().default("normal"),
  publishedAt: timestamp("published_at", { withTimezone: true }), expiresAt: timestamp("expires_at", { withTimezone: true }),
  status: publishStatus("status").notNull().default("draft"), ...stamps,
});

// ---- Media ----
export const galleryAlbums = pgTable("gallery_albums", {
  id: id(), title: text("title").notNull(), slug: slug(), description: text("description"),
  year: integer("year"), albumDate: date("album_date"), coverImage: img("cover_image"),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: publishStatus("status").notNull().default("draft"), ...stamps,
});
export const galleryImages = pgTable("gallery_images", {
  id: id(), albumId: uuid("album_id").notNull().references(() => galleryAlbums.id, { onDelete: "cascade" }),
  publicId: text("public_id").notNull(), url: text("url").notNull(), width: integer("width"), height: integer("height"),
  caption: text("caption"), altText: text("alt_text"), displayOrder: integer("display_order").notNull().default(0), ...stamps,
}, (t) => [index("gallery_album_idx").on(t.albumId)]);

// ---- Content blocks ----
/** Long-form static pages: about, judicial-committee, local-nugs, constitution, academics, freshers-guide */
export const pages = pgTable("pages", {
  id: id(), pageKey: text("page_key").notNull().unique(), title: text("title").notNull(), subtitle: text("subtitle"),
  body: text("body").notNull(), image: img("image"), ctaLabel: text("cta_label"), ctaHref: text("cta_href"), ...stamps,
});
export const documents = pgTable("documents", {
  id: id(), title: text("title").notNull(), description: text("description"), url: text("url").notNull(),
  category: text("category"), isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0), ...stamps,
});
export const stats = pgTable("stats", {
  id: id(), label: text("label").notNull(), value: text("value").notNull(),
  isActive: boolean("is_active").notNull().default(true), displayOrder: integer("display_order").notNull().default(0), ...stamps,
});
export const quickLinks = pgTable("quick_links", {
  id: id(), label: text("label").notNull(), url: text("url").notNull(), groupName: text("group_name").notNull().default("Quick Links"),
  isActive: boolean("is_active").notNull().default(true), displayOrder: integer("display_order").notNull().default(0), ...stamps,
});
export const messages = pgTable("messages", {
  id: id(), name: text("name").notNull(), email: text("email").notNull(), phone: text("phone"), subject: text("subject"),
  body: text("body").notNull(), isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- Site configuration ----
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(), value: jsonb("value").notNull(), updatedAt: stamps.updatedAt,
});
export const pageHeroes = pgTable("page_heroes", {
  id: id(), pageKey: text("page_key").notNull().unique(), title: text("title"), subtitle: text("subtitle"), image: img("image"), ...stamps,
});
export const heroSlides = pgTable("hero_slides", {
  id: id(), heading: text("heading").notNull(), description: text("description"), image: img("image").notNull(),
  ctaLabel: text("cta_label"), ctaHref: text("cta_href"), secondaryCtaLabel: text("secondary_cta_label"), secondaryCtaHref: text("secondary_cta_href"),
  isActive: boolean("is_active").notNull().default(true), displayOrder: integer("display_order").notNull().default(0), ...stamps,
});
