export interface AdminProfile {
  fullName: string;
  intro: string;
  biography: string;
  mission: string;
  portraitUrl: string;
}

export interface AdminContact {
  email: string;
  phone: string;
  location: string;
}

export interface AdminSocial {
  label: string;
  url: string;
}

export interface AdminProfileData {
  profile: AdminProfile;
  contact: AdminContact;
  socials: AdminSocial[];
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

async function readError(response: Response): Promise<string> {
  const fallback = `Request failed (${response.status}).`;
  try {
    const data = (await response.json()) as { error?: { message?: string } };
    return data.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

async function request<T>(
  path: string,
  init?: { method: string; body?: string },
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: init?.method ?? "GET",
      body: init?.body,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!response.ok) {
      return { ok: false, status: response.status, message: await readError(response) };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, status: 0, message: "Could not reach the server." };
  }
}

export function getProfile() {
  return request<AdminProfileData>("/api/admin/profile");
}

export function saveProfile(profile: AdminProfile) {
  return request<{ saved: boolean }>("/api/admin/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function saveContact(contact: AdminContact) {
  return request<{ saved: boolean }>("/api/admin/contact", {
    method: "PUT",
    body: JSON.stringify(contact),
  });
}

export function saveSocials(socials: AdminSocial[]) {
  return request<{ saved: boolean }>("/api/admin/socials", {
    method: "PUT",
    body: JSON.stringify({ socials }),
  });
}