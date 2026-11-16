import { useEffect } from "react";

/** Sets the browser tab title and meta description for a page, and restores them on leave. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
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