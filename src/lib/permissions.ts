// Add a role = insert a row in `roles`; no code change needed.
export const DEFAULT_ROLES = {
  super_admin: { name: "Super Admin", permissions: ["*"] },
  secretariat: { name: "Secretariat", permissions: [
    "executives:write", "committees:write", "pages:write", "documents:write", "messages:write", "events:write", "news:write", "announcements:write"] },
  media_team: { name: "Media Team", permissions: ["news:write", "projects:write", "events:write", "announcements:write", "gallery:write"] },
} as const;

export const can = (perms: readonly string[], needed: string) => perms.includes("*") || perms.includes(needed);
