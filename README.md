# Henry Gichunge — Personal Brand Website

Ideas. Education. Innovation.

## Stack
React, TypeScript, Vite, Tailwind CSS v4, React Router, Lucide icons.
Backend: Cloudflare Workers with Hono and D1. R2 is added in a later batch.

## Project layout
- `src/` — the React website
- `worker/` — the Hono API (runs as a Cloudflare Worker)
- `migrations/` and `db/` — database schema and starter content (see `db/README.md`)
- `wrangler.toml` — Cloudflare Worker configuration
- `public/` — static files

## Run locally (Termux)
Requires Node.js 20.19 or newer.

    npm install
    npm run dev

Open http://localhost:5173
The API is served by the same command, for example http://localhost:5173/api/health
The D1 database does not exist locally, so /api/health/db returns a 503 there. That is expected.

## Build
    npm run build

## Deployment
Cloudflare builds and deploys from GitHub on every push to `main`.
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
Wrangler is not a project dependency: Cloudflare's builder provides it.
The Worker name in `wrangler.toml` must match the Worker in the Cloudflare dashboard.

## Editing content
Website text, projects and links are in `src/data/site.ts` and `src/data/content.ts`.
To use your own photo, put it in `public/images/` and set `portraitSrc` in `src/data/site.ts`.

## Status
Batches 01-06: homepage, public pages, design refinement, API foundation, database schema, deployment.