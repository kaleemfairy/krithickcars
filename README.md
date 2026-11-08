# Krithick Cars — Showroom & Admin Portal

Pre-owned car showroom and staff portal for Krithick Cars, GST Road, Chennai.
Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma 7 + PostgreSQL, Vercel Blob and TypeScript.

## Quick start (local)

```bash
npm install
cp .env.example .env        # set SESSION_SECRET to a long random string
npm run db:local -- -d      # start a local Postgres (prisma dev) in the background
npx prisma dev ls           # copy its postgres:// URL into DATABASE_URL in .env
npm run setup               # apply migrations, generate the Prisma client, seed demo data
npm run dev                 # http://localhost:3000
```

The staff portal is at `/admin`. The seed script creates a login from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev server / production build / production server |
| `npm run db:local` | Start a local Postgres server (`prisma dev`) |
| `npm run db:migrate` | Create and apply a migration after you edit `prisma/schema.prisma` |
| `npm run db:seed` | **Resets** vehicles and leads to the demo data and (re)sets the staff password |
| `npm run db:bootstrap` | Safe version run on every deploy: creates the staff login if missing, demo cars only if inventory is empty |
| `npm run db:reset` | Drop the database, re-run every migration, then seed |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |

## What's included

**Public showroom** (`src/app/(showroom)`)
- Hero with the spotlight deal (the car marked "Spotlight" in admin) and trust stats
- Search (make/model) plus filters for budget, fuel, transmission and body type, and sorting. The state lives in the URL, so filtered links can be shared
- Vehicle cards with a photo carousel, spec badges, the RTO code, the price in lakhs and an estimated EMI
- `/cars/[slug]` detail page: full specs, inspection summary, an EMI calculator and test-drive booking
- **WhatsApp enquiry** on every car through `buildWhatsAppUrl()` in `src/lib/whatsapp.ts`, using the exact pre-filled message from the brief
- Sell/Exchange valuation form: stores a lead, then hands the details off to WhatsApp
- Trust (KC Certified), deliveries, showroom location and hours, footer, and a sticky Call/WhatsApp bar on mobile

**Admin portal** (`src/app/admin`)
- Staff login: a signed JWT in an httpOnly cookie. `proxy.ts` makes an early redirect check, and `requireStaff()` checks again on every page, action and upload
- Dashboard: stock count and value, new leads (and how many came from WhatsApp), cars sold this month, the pipeline, and a recent-inventory table where you can change a car's status in place
- Inventory list filtered by status (Draft / Live / Under Inspection / Token Booked / Sold)
- **Intake studio** (`/admin/inventory/new`, `/admin/inventory/[id]`) in six sections: identity (the reg plate is auto-formatted and the RTO auto-detected), mechanical, 6-angle photo uploader (drag-and-drop or phone camera), pricing with a confidential floor price, EMI preview and the KC Certified badge, the 160-point inspection, and a live preview of the WhatsApp message
  - **Save as Draft** needs only the basics. **Publish Live** also needs all 6 photo angles and, for certified cars, the non-accidental sign-off. The same zod schema checks the form in the browser and again on the server
- Leads: WhatsApp clicks are logged as "WhatsApp visitor" leads. Staff add the customer's name and number, move the lead through its statuses, and can call or WhatsApp back in one tap

The floor price never reaches the public pages: `toPublic()` strips it before any showroom data is rendered.

## Project layout

```
prisma/              schema, migrations, seed.ts
src/proxy.ts         admin route guard (Next 16's replacement for middleware)
src/lib/             db, auth/session, queries, whatsapp, format (₹ / lakhs / EMI), zod schemas
src/app/(showroom)/  public pages
src/app/admin/       login + (portal) pages
src/app/actions/     server actions (public forms, admin mutations)
src/app/api/         upload, uploaded-image serving, WhatsApp-click tracking
src/components/      showroom/ and admin/ UI
src/data/            image URLs taken from the design mock-ups (demo only)
```

## Deploying (GitHub + Vercel)

1. Push this folder to a **private** GitHub repo.
2. On [vercel.com](https://vercel.com): **Add New → Project** → import the repo (Next.js is auto-detected).
   Vercel runs `npm run vercel-build`: apply migrations → bootstrap staff login + demo cars (empty database only) → build.
3. In the project's **Storage** tab, connect:
   - **Neon (Postgres)**: sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
   - **Blob**: sets `BLOB_READ_WRITE_TOKEN`, so photo uploads go to Vercel Blob.
4. In **Settings → Environment Variables**, add:
   - `SESSION_SECRET`: a new long random string (not your local one)
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`: the real staff login, with a strong password
   - optional `SEED_DEMO_DATA=false` to start with an empty showroom
5. **Deployments → Redeploy.** After that, every `git push` to `main` deploys automatically.

The first deploy fails until the database is connected (step 3). That's expected; redeploy after step 4.

**Changing the staff password later:** `db:bootstrap` never overwrites an existing login. Either edit the user in Neon, or run `npm run db:seed` with the production `DATABASE_URL`. **Careful:** `db:seed` also resets the inventory. A "change password" screen in the admin portal would be a good next feature.

### Notes

- **Photos:** in production they're stored in Vercel Blob; locally, in `./uploads`. Large phone photos are downscaled in the browser (max 2000px) to stay under Vercel's 4.5 MB request limit.
- **Demo images:** the seed data uses images from the design mock-ups (`src/data/design-images.json`). Those URLs are temporary, and the extra angles are generic stand-in shots. Replace them with real photos through the admin portal.
- **Business details:** phone, address, hours and map link are all in `DEALER` in `src/lib/constants.ts`. EMI assumptions (80% loan, 5 years, 11.5%) are in `EMI_DEFAULTS` in `src/lib/format.ts`.
