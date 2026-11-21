# Henry Gichunge — Personal Brand Website

Ideas. Education. Innovation.

A personal brand website and private content manager, built on Cloudflare.

## Stack
React, TypeScript, Vite, Tailwind CSS v4, React Router, Lucide icons.
Backend: Cloudflare Worker with Hono, D1 database. Images and CV: Cloudinary. Spam check: Cloudflare Turnstile.

## Project layout
- `src/` — the React website and the admin screens (`src/pages/admin`)
- `worker/` — the API and page server (runs as a Cloudflare Worker)
- `migrations/`, `db/` — database schema and starter content (see `db/README.md`)
- `scripts/` — `hash-password.mjs` (admin password hash) and `security-check.mjs` (live-site checks)
- `public/` — static files
- `wrangler.toml` — Cloudflare Worker configuration
- `SECURITY.md` — how the site is protected and what to do in an emergency

## Run locally (Termux)
Requires Node.js 20.19 or newer.

    npm install
    npm run dev

Open http://localhost:5173
The database, admin sign-in, uploads and contact form need Cloudflare, so they work only on the live site.

## Build
    npm run build

## Deployment
Cloudflare builds and deploys from GitHub on every push to `main`.
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
Wrangler is not a project dependency: Cloudflare's builder provides it.
The Worker name in `wrangler.toml` must match the Worker in the Cloudflare dashboard.

## Managing content
Sign in at `/admin`. From there you can edit the profile, projects, articles, background, skills, CV,
contact messages and SEO settings. No code changes are needed.

## Secrets
Set in the Cloudflare dashboard, never in this repository. The list is in `SECURITY.md` and `db/README.md`.

## Checking the live site
    node scripts/security-check.mjs https://your-site-address

## Status
Batches 1-19 complete: public site, admin dashboard, uploads, contact form, SEO and security hardening.
Remaining: custom domain and go-live.