import { useApiResource } from "../lib/useApiResource";

/** `url` is null when no CV has been uploaded, or when the API cannot be reached. */
export function useCv() {
  return useApiResource<{ url: string | null }>("/api/cv", () => ({ url: null }));
}