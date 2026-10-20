import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { roles, users, pages, siteSettings } from "../src/db/schema";
import { DEFAULT_ROLES } from "../src/lib/permissions";

const db = drizzle(neon(process.env.DATABASE_URL!));

/** Placeholder copy so the site never looks empty. Everything is editable in Admin → Pages. */
const STARTER_PAGES = [
  { pageKey: "about", title: "About SRC", subtitle: "The voice of the students of UMaT, Essikado Campus.",
    body: "## Who we are\n\nThe Students' Representative Council (SRC) is the highest student governing body at the Essikado Campus of the University of Mines and Technology.\n\n## What we do\n\n- Represent students before university management\n- Organise campus programmes, events and welfare initiatives\n- Deliver student-focused projects\n\nEdit this page in Admin → Pages." },
  { pageKey: "judicial-committee", title: "Judicial Committee", subtitle: "Upholding the SRC constitution.", body: "The Judicial Committee interprets the SRC constitution and settles disputes fairly.\n\nEdit this page in Admin → Pages." },
  { pageKey: "local-nugs", title: "Local NUGS", subtitle: "UMaT's chapter of the National Union of Ghana Students.", body: "Local NUGS links UMaT students to the national student movement.\n\nEdit this page in Admin → Pages." },
  { pageKey: "constitution", title: "SRC Constitution", subtitle: "The rules that govern the council.", body: "Upload the constitution PDF anywhere (e.g. Google Drive) and paste the link as this page's button link.\n\nEdit this page in Admin → Pages." },
  { pageKey: "academics", title: "Academics", subtitle: "Library, registration and academic support.", body: "## The Library\n\nThe UMaT Library supports learning and research with books, journals and digital resources.\n\nEvery semester, students must complete library registration to access its services.\n\nEdit this page in Admin → Pages." },
  { pageKey: "freshers-guide", title: "SRC Freshers' Guide", subtitle: "Welcome to UMaT! Your Freshers Starter Package.", body: "## Welcome\n\nWelcome to UMaT Essikado! This guide covers campus essentials, useful contacts and tips for your first weeks.\n\nEdit this page in Admin → Pages." },
];

async function main() {
  const { SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: pw } = process.env;
  if (!email || !pw || pw.length < 12) throw new Error("Set SEED_ADMIN_EMAIL and a 12+ char SEED_ADMIN_PASSWORD");
  for (const [key, r] of Object.entries(DEFAULT_ROLES))
    await db.insert(roles).values({ key, name: r.name, permissions: [...r.permissions] })
      .onConflictDoUpdate({ target: roles.key, set: { permissions: [...r.permissions], name: r.name } });
  const [sa] = await db.select().from(roles).where(eq(roles.key, "super_admin"));
  await db.insert(users).values({ email: email.toLowerCase(), name: "Super Admin", passwordHash: await bcrypt.hash(pw, 12), roleId: sa.id }).onConflictDoNothing();
  for (const p of STARTER_PAGES) await db.insert(pages).values(p).onConflictDoNothing();
  await db.insert(siteSettings).values({ key: "site_name", value: "UMaT Essikado SRC" }).onConflictDoNothing();
  console.log("Seeded roles, Super Admin and starter pages:", email);
}
main();
