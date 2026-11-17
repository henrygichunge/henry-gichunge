# Henry Gichunge — Personal Brand Website

Ideas. Education. Innovation.

## Stack
React, TypeScript, Vite, Tailwind CSS v4, React Router, Lucide icons.
Backend: Cloudflare Workers with Hono. D1 and R2 are added in later batches.

## Project layout
- `src/` — the React website
- `worker/` — the Hono API (runs as a Cloudflare Worker)
- `wrangler.jsonc` — Cloudflare Worker configuration
- `public/` — static files

## Run locally (Termux)
Requires Node.js 20.19 or newer.

    npm install
    npm run dev

Open http://localhost:5173
The API is served by the same command, for example http://localhost:5173/api/health
(`npm run preview` serves the website only, without the API.)

## Build
    npm run build

## How deployment works
Cloudflare builds and deploys from GitHub (set up in the final batches).
Wrangler is not a project dependency: Cloudflare's builder provides it.
The Worker name in `wrangler.jsonc` must match the Worker created in the Cloudflare dashboard.

## Editing content
Website text, projects and links are in `src/data/site.ts` and `src/data/content.ts`.
To use your own photo, put it in `public/images/` and set `portraitSrc` in `src/data/site.ts`.

## Status
Batches 01-04 complete: homepage, public pages, design refinement, API foundation.