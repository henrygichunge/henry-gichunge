# Database (Cloudflare D1)

Database name: `henrygichunge-db`

## Migrations (schema)
Applied in order, once each. Run them in the D1 console in the Cloudflare dashboard.
Never edit a migration that has been applied: add a new numbered file instead.

| File | Contents | Applied |
|------|----------|---------|
| migrations/0001_profile_and_settings.sql | profile, settings, social links | [ ] |
| migrations/0002_projects.sql | projects, focus areas, links | [ ] |
| migrations/0003_articles_and_background.sql | articles, experience/education, skills | [ ] |

## Seed (starter content)
| File | Applied |
|------|---------|
| db/seed/001_initial_content.sql | [ ] |

Tick the boxes (edit this file) as you apply each one.

## Why manual?
Wrangler's local runtime does not run on Android/Termux, so migrations are applied by hand
in the dashboard. Because of that, D1's automatic migration history is not recorded:
this table is the record.

## Later
- Batch 09: media_assets table
- Batch 10: contact_enquiries table
- Batch 11: page SEO table