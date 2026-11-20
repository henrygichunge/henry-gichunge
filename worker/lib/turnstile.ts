const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Asks Cloudflare whether a Turnstile token is genuine. Any problem counts as a failure.
 * The token must have been issued for `expectedHostname`, the address visitors used.
 */
export async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string | undefined,
  expectedHostname: string,
): Promise<boolean> {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;

    const result = (await response.json()) as { success?: boolean; hostname?: string };
    return result.success === true && result.hostname === expectedHostname;
  } catch {
    return false;
  }
}