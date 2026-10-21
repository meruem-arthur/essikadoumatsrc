# UMaT Essikado SRC Website

Public website + admin CMS for the Students' Representative Council, UMaT **Essikado Campus**.
Next.js 15 (App Router) · TypeScript · Tailwind 4 · Drizzle · Neon Postgres · Cloudinary · Vercel. One app: public site at `/`, admin at `/admin`.

Architecture follows `essikado-src-sports-hub` (resource-driven admin, roles/permissions, signed Cloudinary uploads).
Image rendering follows `gesa-essikado` (crossfading hero with scrims + translucent text panel, face-biased crops, masonry gallery, zoom/swipe lightbox).
Page structure follows umatsrc.edu.gh (main campus).

## Pages
Home · About SRC · Judicial Committee · Local NUGS · SRC Constitution · Executives (+profile) · Committees (+members) · News (+categories) · SRC Projects · Events · Media (albums + lightbox) · Academics · Resources · Freshers' Guide · Contact (form → admin inbox).

## Local setup
1. `cp .env.example .env.local` (and `.env` for the seed script) and fill in every value.
2. `npm install` then `npm run typecheck`.
3. `npm run db:generate && npm run db:migrate` (creates ./drizzle migrations and applies them to Neon).
4. `npm run db:seed` (roles, first Super Admin, starter pages). `npm run dev`. Log in at `/admin/login`.

## Deploy (GitHub → Vercel)
Push to GitHub (never commit `.env*`), import into Vercel, add all `.env.example` variables (set `NEXT_PUBLIC_SITE_URL` to the production URL), run `db:migrate` + `db:seed` once against the production DB, deploy.
Public queries fail soft, so the build succeeds even before the DB is populated.

## First-time content (in this order)
1. Admin → **Settings**: site name, contact details, social links, portal URL, SRC Sports URL, logo.
2. Admin → **Site → Homepage Hero**: 2–4 wide photos with headline + buttons.
3. Admin → **People → Executives** (order 1 = President, shown on the home page), Pillars (VC, Dean), Committees (+ Members).
   Use *Shown on* = `judicial` / `nugs` to populate those two pages.
4. Admin → **Content → Pages**: edit About, Constitution, Academics, Freshers' Guide, etc.
5. Admin → **Site → Home Stats**, **Footer Links**, **Page Banners** (a banner photo per page).
6. Media: create an **Album**, then click **Photos** to upload many at once; add captions there.

## Features added after v1
- **Contact alerts:** new messages are emailed to Settings → contact email (or `CONTACT_NOTIFY_EMAIL`); Reply goes straight to the sender. Messages are always saved in Admin → Messages first.
- **Rate limiting** (database-backed, no extra service): contact form 3/hour per IP; login 5 failures per email / 20 per IP per 15 min; reset requests 10/hour per IP.
- **Cloudinary cleanup:** replacing or deleting an image/record/album removes the file from Cloudinary (best effort, only inside `umat-src/`).
- **Gallery ordering:** Admin → Media Albums → Photos: ← → reorder, Make first, Set cover. First upload becomes the cover automatically.
- **Videos:** Admin → Videos (YouTube). Shown on /media with click-to-play (no YouTube scripts load until pressed).
- **Search:** `/search` across news, projects, events, executives, committees (magnifier in the header).
- **Draft preview:** in admin lists, “Preview ↗” opens a draft/unpublished item exactly as visitors would see it (admins only).
- **Activity log:** Admin → Activity log (Super Admin): who created/updated/deleted what.
- **Analytics:** Vercel Web Analytics is included. Enable it in the Vercel dashboard → Analytics tab (privacy-friendly, no cookies).
- **Launch checklist:** on the admin dashboard, shows what content is still missing before launch.
After pulling this update run `npm run db:generate && npm run db:migrate` (new tables: `rate_events`, `videos`, `audit_log`).

## Roles & who does what
- **Super Admin** (created by the seed script): everything, plus adding/removing admins (Admin Users) and the Activity log. Give this to one or two trusted people.
- **Admin**: manages all content and site settings (hero images, page text, quick links, executives, news, gallery, messages…) but cannot add/edit users or see the Activity log.
- **Secretariat / Media Team**: optional limited roles for helpers.
Flow: the Super Admin signs in → Admin Users → adds each admin with a temporary password → the admin signs in and changes it under My account (or uses Forgot password).

## Admin notes
- **Forgot password:** `/admin/forgot-password` emails a single-use link (30 min). Needs `RESEND_API_KEY` + `MAIL_FROM` (verify your domain in Resend). Without them, local dev prints the link in the terminal and production refuses to send. After pulling this update run `npm run db:generate && npm run db:migrate` (new `password_resets` table).
- Admin lives at `/admin` on whatever domain you attach in Vercel (e.g. `essikadoumatsrc.com/admin`). Set `NEXT_PUBLIC_SITE_URL` to that domain.
- **Admin Users** (Super Admin only): add users, assign roles, disable, reset passwords. Everyone can change their own password under **My account**; changing a password signs out all other sessions. The last active Super Admin can't be removed or disabled.
- Content types live in `src/features/admin/resources.ts`: one entry = list + form + validation + permission.
- Roles are rows in `roles` (permissions are strings like `news:write`; `*` = all). Defaults: Super Admin, Secretariat, Media Team.
- Text fields support light formatting: blank line = paragraph, `## ` heading, `- ` bullets.
- Image focus: people use `focus="portrait"`, banners use `soft` (see `.object-portrait*` in `globals.css`).
- Brand colours/fonts: `@theme` block in `src/app/globals.css`.

## Not built yet
Contact-form rate limiting, video embeds in Media, automated tests.
