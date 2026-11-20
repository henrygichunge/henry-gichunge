import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import Field from "../../components/admin/Field";
import ImageUpload from "../../components/admin/ImageUpload";
import { SEO_PAGES, getSeo, saveSeo, type SeoPageKey, type SeoSettings } from "../../lib/adminSeo";
import { describeFailure } from "../../lib/adminProjects";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signedOut" }
  | { kind: "error"; message: string };

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

const LABELS: Record<SeoPageKey, string> = {
  home: "Home page",
  about: "About page",
  education: "Education page",
  projects: "Projects page",
  insights: "Insights page",
  cv: "CV page",
  contact: "Contact page",
};

const EMPTY: SeoSettings = {
  pages: {
    home: { title: "", description: "" },
    about: { title: "", description: "" },
    education: { title: "", description: "" },
    projects: { title: "", description: "" },
    insights: { title: "", description: "" },
    cv: { title: "", description: "" },
    contact: { title: "", description: "" },
  },
  shareImageUrl: "",
};

const sectionClass = "space-y-5 border border-line bg-surface/40 p-6";

export default function AdminSeo() {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [settings, setSettings] = useState<SeoSettings>(EMPTY);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    let active = true;
    void getSeo().then((result) => {
      if (!active) return;
      if (result.ok) {
        setSettings(result.data);
        setLoad({ kind: "ready" });
      } else if (result.status === 401) {
        setLoad({ kind: "signedOut" });
      } else {
        setLoad({ kind: "error", message: describeFailure(result.status, result.message) });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  function setPage(key: SeoPageKey, field: "title" | "description", value: string) {
    setSettings((current) => ({
      ...current,
      pages: { ...current.pages, [key]: { ...current.pages[key], [field]: value } },
    }));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setStatus({ kind: "saving" });
    const result = await saveSeo(settings);
    if (result.ok) {
      setStatus({ kind: "saved" });
    } else {
      setStatus({ kind: "error", message: describeFailure(result.status, result.message) });
    }
  }

  if (load.kind === "loading") return <PageLoader />;
  if (load.kind === "signedOut") return <Navigate to="/admin/login" replace />;
  if (load.kind === "error") {
    return (
      <Container className="max-w-3xl py-16 sm:py-24">
        <h1 className="text-4xl">SEO</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">{load.message}</p>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Admin</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">SEO</h1>
      <p className="mt-4 text-sm leading-relaxed text-mist">
        What search engines and link previews show for your main pages. Leave a field empty to use the
        built-in wording. Project and article pages use their own text, so edit those in Projects and
        Articles.
      </p>

      <form onSubmit={(e) => void onSave(e)} aria-label="SEO settings" className="mt-8 space-y-8">
        <section className={sectionClass}>
          <h2 className="text-2xl">Default share image</h2>
          <p className="text-sm text-mist">
            Shown when someone shares a link to your site on WhatsApp, LinkedIn and similar apps. Use a
            landscape image, ideally 1200 × 630. If you leave this empty, your portrait is used.
          </p>
          <ImageUpload
            id="seo-share-image"
            label="Share image"
            value={settings.shareImageUrl}
            maxLength={500}
            onChange={(v) => setSettings((current) => ({ ...current, shareImageUrl: v }))}
          />
        </section>

        {SEO_PAGES.map((key) => (
          <section key={key} className={sectionClass}>
            <h2 className="text-2xl">{LABELS[key]}</h2>
            <Field
              id={`seo-${key}-title`}
              label="Title"
              hint={`${settings.pages[key].title.length} of 70 characters.`}
              value={settings.pages[key].title}
              maxLength={70}
              onChange={(v) => setPage(key, "title", v)}
            />
            <Field
              id={`seo-${key}-description`}
              label="Description"
              hint={`${settings.pages[key].description.length} of 160 characters, on one line.`}
              multiline
              rows={3}
              value={settings.pages[key].description}
              maxLength={160}
              onChange={(v) => setPage(key, "description", v)}
            />
          </section>
        ))}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={status.kind === "saving"}
            className="bg-gold px-6 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.kind === "saving" ? "Saving…" : "Save SEO settings"}
          </button>
          <p role="status" className="text-sm text-gold">
            {status.kind === "saved" && "Saved. Your pages use the new text straight away."}
            {status.kind === "error" && status.message}
          </p>
        </div>
      </form>
    </Container>
  );
}