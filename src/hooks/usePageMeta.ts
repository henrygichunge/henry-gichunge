import { useEffect } from "react";

/**
 * When the server has already written this page's tags, the page that was first loaded keeps them.
 * Pages reached afterwards by tapping links set their own title here.
 */
const serverWroteTags =
  typeof document !== "undefined" && document.querySelector('meta[name="x-seo"]') !== null;
const firstPath = typeof window !== "undefined" ? window.location.pathname : "";

/** Sets the browser tab title and meta description for a page, and restores them on leave. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    if (serverWroteTags && window.location.pathname === firstPath) return;

    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content ?? "";

    document.title = `${title} — Henry Gichunge`;
    if (meta && description) meta.content = description;

    return () => {
      document.title = previousTitle;
      if (meta) meta.content = previousDescription;
    };
  }, [title, description]);
}