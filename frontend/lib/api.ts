import type { Application, Profile } from "./types";

// All backend calls live here. Requests go through the Next.js rewrite in next.config.ts.
const BASE = "/api";

export type WriteOptions = { keepalive?: boolean };

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

async function putJson(path: string, body: unknown, { keepalive }: WriteOptions = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive,
  });
  if (!res.ok) throw new Error(`Save failed (${res.status})`);
}

export const fetchApplications = () => getJson<Application[]>("/applications");

export const saveApplications = (applications: Application[], options?: WriteOptions) =>
  putJson("/applications", applications, options);

export const fetchProfile = () => getJson<Profile>("/profile");

export const saveProfile = (profile: Profile, options?: WriteOptions) =>
  putJson("/profile", profile, options);

/** Returns null when no resume has been generated for the application yet. */
export async function fetchResumePdf(applicationId: string): Promise<Blob | null> {
  const res = await fetch(`${BASE}/applications/${encodeURIComponent(applicationId)}/resume.pdf`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Couldn't load resume (${res.status})`);
  return res.blob();
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}
