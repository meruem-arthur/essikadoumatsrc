// Add a role = insert a row in `roles`; no code change needed.
const CONTENT = [
  "executives:write", "committees:write", "news:write", "projects:write", "events:write", "announcements:write",
  "gallery:write", "pages:write", "documents:write", "messages:write", "site:write", "settings:write"] as const;

export const DEFAULT_ROLES = {
  // Super Admin: everything, including adding/removing admins and the activity log.
  super_admin: { name: "Super Admin", permissions: ["*"] },
  // Admin: all content and site settings, but cannot manage users or see the activity log.
  admin: { name: "Admin", permissions: [...CONTENT] },
  // Optional limited roles for helpers.
  secretariat: { name: "Secretariat", permissions: [
    "executives:write", "committees:write", "pages:write", "documents:write", "messages:write", "events:write", "news:write", "announcements:write"] },
  media_team: { name: "Media Team", permissions: ["news:write", "projects:write", "events:write", "announcements:write", "gallery:write"] },
} as const;

export const can = (perms: readonly string[], needed: string) => perms.includes("*") || perms.includes(needed);

/** Keeps the built-in roles in the database in sync with the code above (safe to run any time). */
export async function ensureDefaultRoles() {
  const { db } = await import("@/db");
  const { roles } = await import("@/db/schema");
  for (const [key, r] of Object.entries(DEFAULT_ROLES))
    await db.insert(roles).values({ key, name: r.name, permissions: [...r.permissions] })
      .onConflictDoUpdate({ target: roles.key, set: { name: r.name, permissions: [...r.permissions] } });
}
