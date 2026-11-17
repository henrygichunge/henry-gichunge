/** Allows only http(s) addresses, plus site paths such as /images/a.png when allowed. */
export function safeUrl(value: string | null, allowSitePath: boolean): string | null {
  if (!value) return null;
  if (allowSitePath && value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}