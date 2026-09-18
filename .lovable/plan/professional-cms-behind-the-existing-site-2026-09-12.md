# Professional CMS behind the existing site

Goal: a real, scalable admin system built with shadcn/ui, sitting behind the current site. The public pages keep their exact design, animations and layout.

## What I found in the audit

- The site is a TanStack Start app (not Next.js). Public pages are hand-written CSS in one large stylesheet — no Tailwind utility classes are loaded today.
- There is already a working content store (SQLite file) with a clean repository layer, migrations, hashed admin passwords and signed login sessions. I will keep and extend it, not replace it.
- Today only the PM Talks / Insights videos are managed in the admin. Everything else — homepage text, case studies, ventures, frameworks, profile, testimonials — lives in a hardcoded data file.
- Page titles and social tags are hardcoded per page. There is a static robots file and no sitemap.

Important, so there are no surprises: content added through the live published site is stored in a file that is reset on each publish, so live edits will not survive a republish. You chose to keep it that way for now; when the client starts managing content for real, I can move it to a hosted database without touching the screens.

## Admin area (rebuilt with shadcn/ui)

- Collapsible sidebar, header with breadcrumbs and account menu, content area — its own layout, fully separate from the public site.
- Sidebar groups: Dashboard · Content (Pages, Case Studies, Insights, Ventures, Frameworks) · Site (Homepage, Profile, Navigation, SEO, Media) · System (Settings, Admin Users, Activity log).
- New login screen: clean, minimal, clearly an admin tool.
- Dashboard: real counts per content type, drafts vs published, recently published and recently updated lists, and quick-create actions. No invented charts or analytics.
- Every list is a proper data table: search, status and topic filters, sorting, pagination, column visibility, row actions, bulk select where it helps. Status shown as badges.
- Every form: labelled fields, inline validation, save/loading states, unsaved-changes warning, cancel, delete confirmation, success and error toasts.
- Skeletons while loading and proper empty states.

## Content types made editable

Built on one shared foundation (status, slug, SEO, featured, timestamps, categories, tags, media) so each type reuses the same tables, services, tables and forms:

- Insights / PM Talks — extended with SEO fields (already live on the public page).
- Case Studies — title, client, industry, tags, images, results, sections, slug, SEO.
- Ventures — name, description, logo, website, status, content, slug, SEO.
- Frameworks — title, description, content, image, slug, SEO.
- Pages / Homepage — hero, intro, featured work selection, framework block, testimonials, call-to-action and footer text.
- Profile / About, Navigation links, and global Site Settings (site title, description, logo, favicon, social links, contact details, default share image).
- Media: a simple library of images with file name, URL, alt text and where each is used — built so real uploads can be added later.

Migration is done one section at a time, each verified against the current page before moving on: the page must look identical, just fed from the database instead of the data file. Anything not yet migrated keeps working exactly as it does today.

## SEO

- A dedicated SEO screen: global defaults (site title, description, default share image, social defaults), indexing and robots settings, sitemap status, plus a health overview listing content missing a title, description or share image, duplicate slugs, and draft vs published counts.
- Per-item SEO on every content form: title, meta description, canonical, slug, Open Graph and X/Twitter title, description and image, index/noindex, follow/nofollow.
- Public pages generate their tags from that data. Article data for Insights, breadcrumbs on deep pages, structured data where it genuinely applies.
- A sitemap generated from published content only, and robots rules that keep the admin and drafts out of search results. Correct 404 handling and status codes.

## Performance and freshness

- Public pages keep rendering on the server and read through a cached content service, so the database is not queried repeatedly for the same page.
- Publishing, updating, deleting or changing SEO clears the cache for that item, its listing page and the sitemap, so changes show immediately.
- No extra client-side fetching for content that is already rendered, and no admin code in the public bundle.

## Security

Password hashing and secure sessions stay. Every admin action re-checks authorisation on the server and validates its input; drafts are never reachable from public endpoints; the admin area is blocked from search engines.

## Technical notes

- shadcn/ui needs Tailwind, which is not currently loaded. I will load Tailwind's theme and utility layers only within the admin area (no global reset), so the public stylesheet and markup are untouched. Components split into `components/public/`, `components/admin/`, `components/ui/`.
- Data layer: shared `content`-style tables (status, slug, SEO, timestamps) with per-type detail tables, foreign keys, unique slugs per type, and indexes on slug, status, publish date, category and featured. New schema added as ordered migrations; existing video data is migrated in place.
- React components never touch SQL — admin actions and public queries both go through the service/repository layer, so the database can be swapped later.
- Verification: every public route checked at mobile, tablet and desktop against the current design; full admin flow (login, CRUD, publish, feature, delete, SEO, media) exercised end to end; typecheck and build run clean.

## Order of work

1. Admin foundation: shadcn setup, layout, sidebar, header, login, dashboard.
2. Shared content system: services, tables, forms, status, slugs, categories, media.
3. Insights migrated onto it.
4. Case Studies, Ventures, Frameworks, Homepage, Profile, Settings — one at a time.
5. SEO fields, sitemap, robots, structured data.
6. Caching, invalidation and a final public-site regression pass.
