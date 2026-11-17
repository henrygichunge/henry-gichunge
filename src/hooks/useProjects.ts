import { useEffect, useState } from "react";
import { fetchJson } from "../lib/api";
import type { ProjectItem, ProjectsResponse } from "../../shared/api";
import { projectDetails } from "../data/content";
import { site } from "../data/site";

const CACHE_MS = 60_000;

/** Built-in content, used only when the API cannot be reached (for example on a phone). */
function builtInProjects(): ProjectItem[] {
  return site.projects.map((p) => {
    const details = projectDetails[p.slug];
    return {
      slug: p.slug,
      name: p.name,
      category: p.category,
      status: p.status,
      summary: p.summary,
      image: p.image ?? null,
      overview: details?.overview ?? "",
      statusNote: details?.statusNote ?? "",
      focusAreas: details?.focusAreas ?? [],
      links: details?.links ?? [],
    };
  });
}

let cache: { at: number; promise: Promise<ProjectItem[]> } | null = null;

function loadProjects(): Promise<ProjectItem[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.promise;

  const promise: Promise<ProjectItem[]> = fetchJson<ProjectsResponse>("/api/projects")
    .then((response) => response.projects)
    .catch((error: unknown) => {
      console.warn("Projects API unavailable, using built-in content.", error);
      // Do not remember a failure, so the next visit tries the API again.
      if (cache?.promise === promise) cache = null;
      return builtInProjects();
    });

  cache = { at: Date.now(), promise };
  return promise;
}

export function useProjects() {
  const [state, setState] = useState<{ projects: ProjectItem[]; loading: boolean }>({
    projects: [],
    loading: true,
  });

  useEffect(() => {
    let active = true;
    void loadProjects().then((projects) => {
      if (active) setState({ projects, loading: false });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}