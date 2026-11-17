import { useEffect, useState } from "react";
import { fetchJson } from "./api";

const CACHE_MS = 60_000;

interface CacheEntry {
  at: number;
  promise: Promise<unknown>;
  value?: unknown;
}

const cache = new Map<string, CacheEntry>();

function load<T>(path: string, fallback: () => T): Promise<T> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.promise as Promise<T>;

  const entry: CacheEntry = { at: Date.now(), promise: Promise.resolve() };
  entry.promise = fetchJson<T>(path)
    .then((data) => {
      entry.value = data;
      return data;
    })
    .catch((error: unknown) => {
      console.warn(`${path} unavailable, using built-in content.`, error);
      // Do not remember a failure, so the next visit tries the API again.
      if (cache.get(path) === entry) cache.delete(path);
      return fallback();
    });

  cache.set(path, entry);
  return entry.promise as Promise<T>;
}

/** Loads JSON from the site's API once per minute. `data` stays null while loading. */
export function useApiResource<T>(path: string, fallback: () => T) {
  const [state, setState] = useState<{ data: T | null; loading: boolean }>(() => {
    const hit = cache.get(path);
    if (hit && hit.value !== undefined && Date.now() - hit.at < CACHE_MS) {
      return { data: hit.value as T, loading: false };
    }
    return { data: null, loading: true };
  });

  useEffect(() => {
    let active = true;
    void load<T>(path, fallback).then((data) => {
      if (active) setState({ data, loading: false });
    });
    return () => {
      active = false;
    };
  }, [path]);

  return state;
}