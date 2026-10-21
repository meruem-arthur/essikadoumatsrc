import * as s from "@/db/schema";

export type Field = {
  name: string; label: string; required?: boolean; help?: string;
  type: "text" | "textarea" | "number" | "bool" | "select" | "date" | "datetime" | "image" | "ref";
  options?: string[]; ref?: { table: any; label: string }; folder?: string;
};
export type Resource = {
  key: string; label: string; group: string; table: any; perm: string;
  slugFrom?: string; titleCol: string; cols: string[]; fields: Field[]; orderBy?: string; preview?: string;
};

const t = (name: string, label: string, required = false, help?: string): Field => ({ name, label, type: "text", required, help });
const area = (name: string, label: string, required = false, help?: string): Field => ({ name, label, type: "textarea", required, help });
const bool = (name: string, label: string): Field => ({ name, label, type: "bool" });
const num = (name: string, label: string, help?: string): Field => ({ name, label, type: "number", help });
const img = (name: string, label: string, folder: string, required = false): Field => ({ name, label, type: "image", folder, required });
const sel = (name: string, label: string, options: string[], required = true): Field => ({ name, label, type: "select", options, required });
const ref = (name: string, label: string, table: any, l: string, required = false): Field => ({ name, label, type: "ref", ref: { table, label: l }, required });
const dt = (name: string, label: string, required = false): Field => ({ name, label, type: "datetime", required });
const status = sel("status", "Status", ["draft", "published"]);
const FORMAT = "Formatting: blank line = new paragraph · start a line with ## for a heading · start lines with - for bullets.";
const order = num("displayOrder", "Display order", "Lower numbers show first.");

export const PAGE_KEYS = ["about", "judicial-committee", "local-nugs", "constitution", "academics", "freshers-guide"];
export const HERO_KEYS = ["executives", "committees", "news", "projects", "events", "media", "resources", "contact", ...PAGE_KEYS];

/** One entry = list + form + validation + permission. To add a content type: add an entry here (and a table in schema.ts). */
const LIST: Resource[] = [
  // ---- People ----
  { key: "executives", label: "Executives", group: "People", table: s.executives, perm: "executives:write", slugFrom: "fullName", titleCol: "fullName", orderBy: "displayOrder", cols: ["fullName", "position", "isActive", "displayOrder"],
    fields: [t("fullName", "Full name", true), t("position", "Position", true), t("programme", "Programme (e.g. BSc. Geomatic Engineering)"), t("level", "Level (e.g. Year 4)"), t("email", "Official email"),
      area("bio", "Biography / message", false, FORMAT), img("profileImage", "Photo", "executives"), order, bool("isActive", "Active (shown on site)")] },
  { key: "pillars", label: "Institutional Pillars", group: "People", table: s.pillars, perm: "executives:write", titleCol: "fullName", orderBy: "displayOrder", cols: ["fullName", "title", "isActive", "displayOrder"],
    fields: [t("fullName", "Full name", true), t("title", "Title (e.g. Vice Chancellor)", true), area("message", "Message"), img("profileImage", "Photo", "pillars"), order, bool("isActive", "Active")] },
  { key: "committees", label: "Committees", group: "People", table: s.committees, perm: "committees:write", slugFrom: "name", titleCol: "name", orderBy: "displayOrder", cols: ["name", "kind", "isActive", "displayOrder"],
    fields: [t("name", "Name", true), sel("kind", "Shown on", ["committee", "judicial", "nugs"]), area("description", "Description", false, FORMAT), img("coverImage", "Cover image", "committees"), order, bool("isActive", "Active")] },
  { key: "committee-members", label: "Committee Members", group: "People", table: s.committeeMembers, perm: "committees:write", titleCol: "fullName", orderBy: "displayOrder", cols: ["fullName", "role", "isActive", "displayOrder"],
    fields: [t("fullName", "Full name", true), ref("committeeId", "Committee / Judicial / NUGS group", s.committees, "name", true), t("role", "Role"), area("bio", "Biography"), img("profileImage", "Photo", "committees"), order, bool("isActive", "Active")] },

  // ---- Content ----
  { key: "news", preview: "/news/", label: "News", group: "Content", table: s.news, perm: "news:write", slugFrom: "title", titleCol: "title", cols: ["title", "category", "status", "publishedAt"],
    fields: [t("title", "Title", true), sel("category", "Category", ["news", "announcement", "press"]), t("excerpt", "Short excerpt"), area("content", "Content", true, FORMAT), img("coverImage", "Cover image", "news"),
      t("author", "Author"), bool("isFeatured", "Featured"), status, dt("publishedAt", "Published at")] },
  { key: "projects", preview: "/projects/", label: "Projects", group: "Content", table: s.projects, perm: "projects:write", slugFrom: "title", titleCol: "title", cols: ["title", "status", "year", "publishStatus"],
    fields: [t("title", "Title", true), t("summary", "Summary"), area("content", "Details", false, FORMAT), img("coverImage", "Cover image", "projects"), sel("status", "Project status", ["planned", "ongoing", "completed"]), t("year", "Year / session"),
      bool("isFeatured", "Featured"), sel("publishStatus", "Publish status", ["draft", "published"])] },
  { key: "events", preview: "/events/", label: "Events", group: "Content", table: s.events, perm: "events:write", slugFrom: "title", titleCol: "title", cols: ["title", "startsAt", "venue", "status"],
    fields: [t("title", "Title", true), area("description", "Description", false, FORMAT), dt("startsAt", "Starts", true), dt("endsAt", "Ends"), t("venue", "Venue"), img("coverImage", "Cover image", "events"), bool("isFeatured", "Featured"), status] },
  { key: "announcements", preview: "/announcements/", label: "Announcements", group: "Content", table: s.announcements, perm: "announcements:write", slugFrom: "title", titleCol: "title", cols: ["title", "priority", "status", "expiresAt"],
    fields: [t("title", "Title", true), area("description", "Description", true), img("flyer", "Flyer", "news"), sel("priority", "Priority", ["low", "normal", "high", "urgent"]), dt("publishedAt", "Publish date"), dt("expiresAt", "Expiry date"), status] },
  { key: "gallery", preview: "/media/", label: "Media Albums", group: "Content", table: s.galleryAlbums, perm: "gallery:write", slugFrom: "title", titleCol: "title", cols: ["title", "year", "isFeatured", "status"],
    fields: [t("title", "Title", true), area("description", "Description"), num("year", "Year"), { name: "albumDate", label: "Date", type: "date" }, img("coverImage", "Cover image", "gallery"), bool("isFeatured", "Featured"), status] },
  { key: "videos", label: "Videos (YouTube)", group: "Content", table: s.videos, perm: "gallery:write", titleCol: "title", orderBy: "displayOrder", cols: ["title", "status", "displayOrder"],
    fields: [t("title", "Title", true), t("url", "YouTube link", true, "Paste any YouTube link: watch, youtu.be, shorts or embed."), area("description", "Description"), order, bool("isFeatured", "Featured"), status] },
  { key: "pages", label: "Pages (About, Constitution…)", group: "Content", table: s.pages, perm: "pages:write", titleCol: "title", cols: ["pageKey", "title"],
    fields: [sel("pageKey", "Page", PAGE_KEYS), t("title", "Title", true), t("subtitle", "Subtitle"), area("body", "Body", true, FORMAT), img("image", "Side image", "pages"), t("ctaLabel", "Button label"), t("ctaHref", "Button link (e.g. constitution PDF)")] },
  { key: "documents", label: "Documents & Links", group: "Content", table: s.documents, perm: "documents:write", titleCol: "title", orderBy: "displayOrder", cols: ["title", "category", "isActive", "displayOrder"],
    fields: [t("title", "Title", true), t("url", "Link (https://…)", true), t("category", "Category (use 'academics' to show on the Academics page)"), area("description", "Description"), order, bool("isActive", "Active")] },

  // ---- Site ----
  { key: "hero-slides", label: "Homepage Hero", group: "Site", table: s.heroSlides, perm: "site:write", titleCol: "heading", orderBy: "displayOrder", cols: ["heading", "displayOrder", "isActive"],
    fields: [t("heading", "Heading", true), area("description", "Description"), img("image", "Image", "hero", true), t("ctaLabel", "Button label"), t("ctaHref", "Button link"), t("secondaryCtaLabel", "2nd button label"), t("secondaryCtaHref", "2nd button link"), order, bool("isActive", "Active")] },
  { key: "page-heroes", label: "Page Banners", group: "Site", table: s.pageHeroes, perm: "site:write", titleCol: "pageKey", cols: ["pageKey", "title"],
    fields: [sel("pageKey", "Page", HERO_KEYS), t("title", "Title override"), t("subtitle", "Subtitle"), img("image", "Banner image", "hero")] },
  { key: "stats", label: "Home Stats", group: "Site", table: s.stats, perm: "site:write", titleCol: "label", orderBy: "displayOrder", cols: ["label", "value", "isActive", "displayOrder"],
    fields: [t("label", "Label (e.g. Total Students)", true), t("value", "Value (e.g. 3,500+)", true), order, bool("isActive", "Active")] },
  { key: "quick-links", label: "Footer Links", group: "Site", table: s.quickLinks, perm: "site:write", titleCol: "label", orderBy: "displayOrder", cols: ["label", "groupName", "isActive", "displayOrder"],
    fields: [t("label", "Label", true), t("url", "URL (/page or https://…)", true), t("groupName", "Group heading (e.g. Quick Links)", true), order, bool("isActive", "Active")] },
];
export const RESOURCES: Record<string, Resource> = Object.fromEntries(LIST.map((r) => [r.key, r]));
export const GROUPS = ["People", "Content", "Site"];
