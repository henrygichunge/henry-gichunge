const base = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https:\/\/[^/\s]+$/.test(base)) {
  console.error("Usage: node scripts/security-check.mjs https://your-site-address");
  process.exit(1);
}

let failures = 0;

function report(ok, name, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures += 1;
}

async function call(path, init = {}) {
  try {
    return await fetch(base + path, { redirect: "manual", ...init });
  } catch {
    return null;
  }
}

const json = { "Content-Type": "application/json" };

// 1. Anonymous visitors cannot read anything in the admin API.
const readPaths = [
  "/api/admin/me",
  "/api/admin/profile",
  "/api/admin/projects",
  "/api/admin/projects/1",
  "/api/admin/articles",
  "/api/admin/articles/1",
  "/api/admin/timeline",
  "/api/admin/skills",
  "/api/admin/cv",
  "/api/admin/enquiries",
  "/api/admin/seo",
];
for (const path of readPaths) {
  const response = await call(path);
  report(response?.status === 401, `Admin read refused: GET ${path}`, `status ${response?.status ?? "no answer"}`);
}

// 2. Anonymous visitors cannot change anything, even from this site's own address.
const writes = [
  ["POST", "/api/admin/media/sign", undefined],
  ["POST", "/api/admin/cv/sign", undefined],
  ["PUT", "/api/admin/profile", "{}"],
  ["PUT", "/api/admin/seo", "{}"],
  ["PUT", "/api/admin/cv", '{"url":""}'],
  ["DELETE", "/api/admin/projects/1", undefined],
  ["DELETE", "/api/admin/articles/1", undefined],
  ["DELETE", "/api/admin/enquiries/1", undefined],
];
for (const [method, path, body] of writes) {
  const response = await call(path, { method, body, headers: { ...json, Origin: base } });
  report(response?.status === 401, `Admin write refused: ${method} ${path}`, `status ${response?.status ?? "no answer"}`);
}

// 3. Requests that claim to come from another website are refused.
const evil = "https://evil.example";
const crossSite = [
  ["POST", "/api/admin/media/sign", undefined],
  ["PUT", "/api/admin/profile", "{}"],
  ["POST", "/api/contact", '{"name":"x","email":"a@b.co","message":"cross-site test message"}'],
];
for (const [method, path, body] of crossSite) {
  const response = await call(path, { method, body, headers: { ...json, Origin: evil } });
  report(response?.status === 403, `Cross-site request refused: ${method} ${path}`, `status ${response?.status ?? "no answer"}`);
}

// 4. Page security headers.
const home = await call("/");
report(home?.status === 200, "Home page loads", `status ${home?.status ?? "no answer"}`);
if (home) {
  const header = (name) => home.headers.get(name) ?? "";
  report(header("x-frame-options").toUpperCase() === "DENY", "Framing is blocked (X-Frame-Options)");
  report(header("x-content-type-options").toLowerCase() === "nosniff", "Content sniffing is blocked");
  report(header("referrer-policy") !== "", "Referrer policy is set");
  report(header("strict-transport-security") !== "", "Strict transport security is set");
  report(!home.headers.has("set-cookie"), "Public pages set no cookies");

  const policy = header("content-security-policy") || header("content-security-policy-report-only");
  report(policy !== "", "Content-security policy is present", header("content-security-policy") ? "enforced" : "report-only or off");
  report(/object-src 'none'/.test(policy), "Policy blocks plug-ins");
  report(/frame-ancestors 'none'/.test(policy), "Policy blocks framing");
  report(!/script-src[^;]*'unsafe-(inline|eval)'/.test(policy), "Policy allows no unsafe scripts");
}

// 5. Honest errors.
const missingProject = await call("/projects/security-check-nothing");
report(missingProject?.status === 404, "Unknown project page is a real 404", `status ${missingProject?.status ?? "no answer"}`);

const missingApi = await call("/api/security-check-nothing");
report(
  missingApi?.status === 404 && (missingApi.headers.get("content-type") ?? "").includes("json"),
  "Unknown API address is a JSON 404",
  `status ${missingApi?.status ?? "no answer"}`,
);

const dbHealth = await call("/api/health/db");
report(dbHealth?.status === 404, "Database health check is not public", `status ${dbHealth?.status ?? "no answer"}`);

// 6. Search engines are kept out of private areas.
const robots = await call("/robots.txt");
const robotsText = robots ? await robots.text() : "";
report(/Disallow: \/admin/.test(robotsText) || /Disallow: \/\s*$/m.test(robotsText), "robots.txt hides the admin");

// 7. Private project files are not served.
const secrets = ["database_id", "pbkdf2", "CREATE TABLE", "ADMIN_PASSWORD_HASH", "CLOUDINARY_API_SECRET"];
const privateFiles = [
  "/wrangler.toml",
  "/package.json",
  "/.env",
  "/.git/config",
  "/migrations/0001_profile_and_settings.sql",
  "/scripts/hash-password.mjs",
];
for (const path of privateFiles) {
  const response = await call(path);
  const text = response ? await response.text() : "";
  const leaked = secrets.find((word) => text.includes(word));
  report(!leaked, `Private file not exposed: ${path}`, leaked ? `contains "${leaked}"` : `status ${response?.status ?? "no answer"}`);
}

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);