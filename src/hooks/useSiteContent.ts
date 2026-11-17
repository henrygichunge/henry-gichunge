import { useApiResource } from "../lib/useApiResource";
import {
  aboutContent,
  contactContent,
  educationHistory,
  experience,
  skillGroups,
} from "../data/content";
import { site } from "../data/site";
import type { BackgroundResponse, SiteResponse } from "../../shared/api";

/** Built-in content, used only when the API cannot be reached (for example on a phone). */
function builtInSite(): SiteResponse {
  return {
    profile: {
      displayName: site.name,
      fullName: site.fullName,
      tagline: `${site.taglineWords.join(". ")}.`,
      intro: site.intro,
      biography: site.about,
      mission: aboutContent.mission,
      portraitUrl: site.portraitSrc || null,
    },
    contact: {
      email: contactContent.email,
      phone: contactContent.phone,
      location: contactContent.location,
    },
    socials: contactContent.socials,
  };
}

export function useSite() {
  return useApiResource<SiteResponse>("/api/site", builtInSite);
}

/**
 * Experience, education and skills. Any section with no published entries
 * shows the built-in placeholders until real entries are added.
 */
export function useBackground() {
  const { data, loading } = useApiResource<BackgroundResponse>("/api/background", () => ({
    experience: [],
    education: [],
    skillGroups: [],
  }));

  const background: BackgroundResponse | null = data && {
    experience: data.experience.length > 0 ? data.experience : experience,
    education: data.education.length > 0 ? data.education : educationHistory,
    skillGroups: data.skillGroups.length > 0 ? data.skillGroups : skillGroups,
  };

  return { background, loading };
}