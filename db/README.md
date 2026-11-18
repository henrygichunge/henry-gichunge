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
| migrations/0004_admin_auth.sql | admin sessions, login attempts | [ ] |

## Seed (starter content)
| File | Applied |
|------|---------|
| db/seed/001_initial_content.sql | [x] |

Tick the boxes (edit this file) as you apply each one.

## Rules for SQL files (important)
The D1 console input is a single line, so pasted line breaks are lost.
- Never use `--` comments in these files: one would comment out everything after it.
- Use `char(10)` for line breaks inside text values.

## Admin login secrets (Cloudflare dashboard, never in this repository)
Set under Workers & Pages > henry-gichunge > Settings > Variables and Secrets, type "Secret":
- `ADMIN_EMAIL`: the one email allowed to sign in
- `ADMIN_PASSWORD_HASH`: made on your phone with `node scripts/hash-password.mjs`
Never paste the passphrase or the hash into chat, files or Git.
If sign-in fails with a "resource limits" error, regenerate the hash with fewer iterations,
for example `node scripts/hash-password.mjs 30000`, and update the secret.

## Why manual?
Wrangler's local runtime does not run on Android/Termux, so migrations are applied by hand
in the dashboard. D1's automatic migration history is therefore not recorded: this table is the record.

## Later
- Batch 12: media_assets table
- Batch 13: contact_enquiries table
- Batch 14: page SEO table