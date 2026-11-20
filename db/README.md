# Database (Cloudflare D1)

Database name: `henrygichunge-db`

## Migrations (schema)
Applied in order, once each, by pasting into the D1 console in the Cloudflare dashboard.
Never edit a migration that has been applied: add a new numbered file instead.

| File | Contents | Applied |
|------|----------|---------|
| migrations/0001_profile_and_settings.sql | profile, settings, social links | [x] |
| migrations/0002_projects.sql | projects, focus areas, links | [x] |
| migrations/0003_articles_and_background.sql | articles, experience/education, skills | [x] |
| migrations/0004_admin_auth.sql | admin sessions, login attempts | [x] |
| migrations/0005_contact_enquiries.sql | contact form messages | [ ] |

## Seed (starter content)
| File | Applied |
|------|---------|
| db/seed/001_initial_content.sql | [x] |

Tick the boxes (edit this file) as you apply each one.

## Rules for SQL files (important)
The D1 console input is a single line, so pasted line breaks are lost.
- Never use `--` comments in these files: one would comment out everything after it.
- Use `char(10)` for line breaks inside text values.

## Secrets (Cloudflare dashboard, never in this repository)
Set under Workers & Pages > henry-gichunge > Settings > Variables and Secrets, type "Secret".
Never paste a secret into chat, files or Git.

| Name | Purpose |
|------|---------|
| ADMIN_EMAIL | the one email allowed to sign in |
| ADMIN_PASSWORD_HASH | made on your phone with `node scripts/hash-password.mjs` |
| CLOUDINARY_CLOUD_NAME | Cloudinary account name (images and CV) |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| TURNSTILE_SITE_KEY | contact form spam check, public key (optional) |
| TURNSTILE_SECRET_KEY | contact form spam check, secret key (optional) |

If sign-in fails with a "resource limits" error, regenerate the hash with fewer iterations,
for example `node scripts/hash-password.mjs 30000`, and update the secret.

## Why manual?
Wrangler's local runtime does not run on Android/Termux, so migrations are applied by hand
in the dashboard. D1's automatic migration history is therefore not recorded: this table is the record.

## Later
- Page SEO table (SEO batch)