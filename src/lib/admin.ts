import { useCallback, useEffect, useState } from "react";

export type SessionState =
  | { status: "loading" }
  | { status: "signedIn"; email: string }
  | { status: "signedOut" }
  | { status: "unavailable" };

export type LoginResult = { ok: true; email: string } | { ok: false; message: string };

async function readMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: { message?: string } };
    return data.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

/** Asks the server whether the visitor is signed in. The server, not this page, decides access. */
export async function fetchSession(): Promise<SessionState> {
  try {
    const response = await fetch("/api/admin/me", { headers: { Accept: "application/json" } });
    if (response.ok) {
      const data = (await response.json()) as { email?: string };
      return data.email ? { status: "signedIn", email: data.email } : { status: "unavailable" };
    }
    if (response.status === 401) return { status: "signedOut" };
    return { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const data = (await response.json()) as { email: string };
      return { ok: true, email: data.email };
    }
    return { ok: false, message: await readMessage(response, "Sign in failed.") };
  } catch {
    return { ok: false, message: "Could not reach the server." };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/admin/logout", { method: "POST" });
  } catch {
    /* the session also expires on its own */
  }
}

export function useAdminSession() {
  const [session, setSession] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    void fetchSession().then((state) => {
      if (active) setSession(state);
    });
    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setSession({ status: "signedOut" });
  }, []);

  return { session, signOut };
}