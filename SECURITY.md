# Security notes

How this website protects itself, and what to do if something goes wrong.
Never put a password, hash, key or secret in this file, in chat, or in Git.

## What protects the site

- **Admin sign-in:** one account. The password is stored only as a PBKDF2 hash in a Cloudflare secret.
  Wrong attempts are limited (5 per connection and 30 overall in 15 minutes).
- **Sessions:** a random token in an HttpOnly, Secure, SameSite=Strict cookie. Only a hash of the token
  is stored. Sessions last 8 hours and end at sign-out.
- **Every admin API route is checked on the server.** The admin pages are only a convenience.
  Routes are registered below the guard in `worker/routes/admin.ts`.
- **Cross-site writes are refused:** any change request must come from this site's own address.
- **All input is validated on the server** (`worker/lib/validate.ts`). Page text is shown as plain text,
  never as HTML.
- **Images** must be uploaded to the owner's Cloudinary account. The CV must be a PDF in that account.
- **Uploads are signed by the server.** The Cloudinary secret never reaches the browser.
- **Contact form:** honeypot field, rate limits, duplicate filter and Cloudflare Turnstile.
- **Pages** are sent with a content-security policy and other security headers (`worker/seo/security.ts`).
- **Admin pages** are hidden from search engines.

## Secrets (set in the Cloudflare dashboard, never in this repository)

ADMIN_EMAIL, ADMIN_PASSWORD_HASH, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY. Optional: CSP_MODE ("off" or "report-only").

## Check the live site

    node scripts/security-check.mjs https://your-site-address

All lines should say PASS. Run it after every deployment that changes the Worker.

## If you think the admin was compromised

1. Make a new passphrase and hash (`node scripts/hash-password.mjs`) and update ADMIN_PASSWORD_HASH.
2. End every session: run `DELETE FROM admin_sessions;` in the D1 console.
3. Make a new Cloudinary API key, update CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, and delete the old key.
4. Make new Turnstile keys if needed and update the two Turnstile secrets.
5. Review the site's content and the Messages inbox for changes you did not make.

## If a page breaks after a security change

Add a Cloudflare secret named CSP_MODE with the value `off`, redeploy, and tell your developer which page broke.

## Known limits

- No two-factor authentication yet.
- The password uses 50,000 PBKDF2 rounds: the free Workers plan cannot afford more, so use a long passphrase.
- The overall login lockout could be used to block sign-ins for up to 15 minutes. It does not end open sessions.
- Visitors' names and emails are personal data: delete messages you no longer need.