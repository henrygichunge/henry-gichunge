/** Fetches JSON from the site's own API. Throws on any failure so callers can fall back. */
export async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    throw new Error(`Request to ${path} did not return JSON`);
  }
  return (await response.json()) as T;
}