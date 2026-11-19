import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import Field from "../../components/admin/Field";
import StateSelect from "../../components/admin/StateSelect";
import {
  createArticle,
  getArticle,
  setArticleState,
  updateArticle,
  type AdminArticleInput,
} from "../../lib/adminArticles";
import { describeFailure, type ContentState } from "../../lib/adminProjects";
import { formatDate } from "../../lib/format";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signedOut" }
  | { kind: "missing" }
  | { kind: "error"; message: string };

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

const EMPTY: AdminArticleInput = {
  title: "",
  excerpt: "",
  body: "",
  category: "",
  coverImageUrl: "",
  seoTitle: "",
  seoDescription: "",
};

const SLUG_HINT =
  "Lowercase letters, numbers and dashes, for example my-first-article. It becomes the page address (/insights/my-first-article) and cannot be changed later.";

const sectionClass = "space-y-5 border border-line bg-surface/40 p-6";

function ArticleEditor({ id }: { id: string | undefined }) {
  const navigate = useNavigate();
  const location = useLocation();
  const creating = id === undefined;
  const justCreated = (location.state as { created?: boolean } | null)?.created === true;

  const [load, setLoad] = useState<LoadState>(creating ? { kind: "ready" } : { kind: "loading" });
  const [slug, setSlug] = useState("");
  const [state, setState] = useState<ContentState>("draft");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [values, setValues] = useState<AdminArticleInput>(EMPTY);
  const [saveStatus, setSaveStatus] = useState<Status>({ kind: "idle" });
  const [stateStatus, setStateStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    if (id === undefined) return;
    if (!/^\d{1,9}$/.test(id)) {
      setLoad({ kind: "missing" });
      return;
    }

    let active = true;
    void getArticle(Number(id)).then((result) => {
      if (!active) return;
      if (result.ok) {
        const article = result.data;
        setSlug(article.slug);
        setState(article.state);
        setPublishedAt(article.publishedAt);
        setValues({
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          category: article.category,
          coverImageUrl: article.coverImageUrl,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
        });
        setLoad({ kind: "ready" });
      } else if (result.status === 401) {
        setLoad({ kind: "signedOut" });
      } else if (result.status === 404) {
        setLoad({ kind: "missing" });
      } else {
        setLoad({ kind: "error", message: describeFailure(result.status, result.message) });
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  function update<K extends keyof AdminArticleInput>(key: K, value: AdminArticleInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaveStatus({ kind: "saving" });

    if (creating) {
      const result = await createArticle(slug.trim(), values);
      if (result.ok) {
        navigate(`/admin/articles/${result.data.id}`, { replace: true, state: { created: true } });
        return;
      }
      setSaveStatus({ kind: "error", message: describeFailure(result.status, result.message) });
      return;
    }

    const result = await updateArticle(Number(id), values);
    if (result.ok) {
      setSaveStatus({ kind: "saved" });
    } else {
      setSaveStatus({ kind: "error", message: describeFailure(result.status, result.message) });
    }
  }

  async function onStateChange(next: ContentState) {
    setStateStatus({ kind: "saving" });
    const result = await setArticleState(Number(id), next);
    if (result.ok) {
      setState(next);
      const fresh = await getArticle(Number(id));
      if (fresh.ok) setPublishedAt(fresh.data.publishedAt);
      setStateStatus({ kind: "saved" });
    } else {
      setStateStatus({ kind: "error", message: describeFailure(result.status, result.message) });
    }
  }

  if (load.kind === "loading") return <PageLoader />;
  if (load.kind === "signedOut") return <Navigate to="/admin/login" replace />;

  if (load.kind === "missing" || load.kind === "error") {
    return (
      <Container className="max-w-3xl py-16 sm:py-24">
        <h1 className="text-4xl">Article</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">
          {load.kind === "missing" ? "That article does not exist." : load.message}
        </p>
        <Link to="/admin/articles" className="mt-6 inline-block text-sm text-gold hover:text-ivory">
          Back to articles
        </Link>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <Link to="/admin/articles" className="text-sm text-mist transition-colors hover:text-gold">
        ← All articles
      </Link>
      <h1 className="mt-4 text-4xl sm:text-5xl">{creating ? "New article" : values.title || "Article"}</h1>

      {justCreated && (
        <p role="status" className="mt-4 border border-gold/40 p-4 text-sm text-gold">
          Article created as a draft. It is not public until you set its visibility to Published.
        </p>
      )}

      {!creating && (
        <section className={`${sectionClass} mt-8`}>
          <h2 className="text-2xl">Visibility</h2>
          <p className="text-sm text-mist">
            Only published articles appear on the website. Archived articles are hidden but kept. The
            publish date is set the first time you publish.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <StateSelect
              id="article-state"
              value={state}
              disabled={stateStatus.kind === "saving"}
              onChange={(next) => void onStateChange(next)}
            />
            <p role="status" className="text-sm text-gold">
              {stateStatus.kind === "saved" && "Updated."}
              {stateStatus.kind === "error" && stateStatus.message}
            </p>
          </div>
          {publishedAt && (
            <p className="text-sm text-mist">First published on {formatDate(publishedAt)}.</p>
          )}
          {state === "published" && (
            <Link to={`/insights/${slug}`} className="text-sm text-mist underline hover:text-gold">
              View on site
            </Link>
          )}
        </section>
      )}

      <form onSubmit={(e) => void onSave(e)} aria-label="Article details" className="mt-8 space-y-8">
        <section className={sectionClass}>
          <h2 className="text-2xl">Article</h2>

          {creating ? (
            <Field
              id="article-slug"
              label="Slug"
              hint={SLUG_HINT}
              value={slug}
              maxLength={100}
              onChange={setSlug}
            />
          ) : (
            <p className="text-sm text-mist">
              Page address: <span className="text-ivory">/insights/{slug}</span> (fixed)
            </p>
          )}

          <Field
            id="article-title"
            label="Title"
            value={values.title}
            maxLength={150}
            onChange={(v) => update("title", v)}
          />
          <Field
            id="article-category"
            label="Category"
            hint="For example Education, Technology or Innovation."
            value={values.category}
            maxLength={40}
            onChange={(v) => update("category", v)}
          />
          <Field
            id="article-excerpt"
            label="Excerpt"
            hint="A short summary shown in lists. Up to 300 characters."
            multiline
            rows={3}
            value={values.excerpt}
            maxLength={300}
            onChange={(v) => update("excerpt", v)}
          />
          <Field
            id="article-body"
            label="Article text"
            hint={`Plain text. Separate paragraphs with a blank line. ${values.body.length} of 30000 characters.`}
            multiline
            rows={16}
            value={values.body}
            maxLength={30000}
            onChange={(v) => update("body", v)}
          />
          <Field
            id="article-cover"
            label="Cover image address"
            type="url"
            hint="A web address starting with https://, or leave empty. Image uploads come in a later batch."
            value={values.coverImageUrl}
            maxLength={500}
            onChange={(v) => update("coverImageUrl", v)}
          />
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl">Search engines (optional)</h2>
          <p className="text-sm text-mist">
            Leave these empty to use the title and excerpt. They are used for the browser tab title and
            search results.
          </p>
          <Field
            id="article-seo-title"
            label="SEO title"
            hint="Up to 70 characters."
            value={values.seoTitle}
            maxLength={70}
            onChange={(v) => update("seoTitle", v)}
          />
          <Field
            id="article-seo-description"
            label="SEO description"
            hint="Up to 160 characters, on one line."
            value={values.seoDescription}
            maxLength={160}
            onChange={(v) => update("seoDescription", v)}
          />
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saveStatus.kind === "saving"}
            className="bg-gold px-6 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveStatus.kind === "saving" ? "Saving…" : creating ? "Create article" : "Save changes"}
          </button>
          <p role="status" className="text-sm text-gold">
            {saveStatus.kind === "saved" && "Saved. The public site updates within a minute or two."}
            {saveStatus.kind === "error" && saveStatus.message}
          </p>
        </div>
      </form>
    </Container>
  );
}

export default function AdminArticleEdit() {
  const { id } = useParams();
  // The key restarts the editor when the address changes, for example after creating an article.
  return <ArticleEditor key={id ?? "new"} id={id} />;
}