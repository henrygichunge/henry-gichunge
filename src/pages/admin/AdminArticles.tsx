import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import StateSelect from "../../components/admin/StateSelect";
import {
  deleteArticle,
  listArticles,
  setArticleState,
  type AdminArticleRow,
} from "../../lib/adminArticles";
import { describeFailure, type ContentState } from "../../lib/adminProjects";
import { formatDate } from "../../lib/format";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signedOut" }
  | { kind: "error"; message: string };

export default function AdminArticles() {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [articles, setArticles] = useState<AdminArticleRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void listArticles().then((result) => {
      if (!active) return;
      if (result.ok) {
        setArticles(result.data.articles);
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

  async function changeState(article: AdminArticleRow, state: ContentState) {
    setBusy(true);
    setMessage("");
    const result = await setArticleState(article.id, state);
    if (result.ok) {
      // Reload the list so a first-time publish date shows up.
      const fresh = await listArticles();
      if (fresh.ok) {
        setArticles(fresh.data.articles);
      } else {
        setArticles((list) => list.map((a) => (a.id === article.id ? { ...a, state } : a)));
      }
    } else {
      setMessage(describeFailure(result.status, result.message));
    }
    setBusy(false);
  }

  async function remove(article: AdminArticleRow) {
    if (!window.confirm(`Permanently delete "${article.title}"? This cannot be undone.`)) return;

    setBusy(true);
    setMessage("");
    const result = await deleteArticle(article.id);
    if (result.ok) {
      setArticles((list) => list.filter((a) => a.id !== article.id));
    } else {
      setMessage(describeFailure(result.status, result.message));
    }
    setBusy(false);
  }

  if (load.kind === "loading") return <PageLoader />;
  if (load.kind === "signedOut") return <Navigate to="/admin/login" replace />;
  if (load.kind === "error") {
    return (
      <Container className="max-w-3xl py-16 sm:py-24">
        <h1 className="text-4xl">Articles</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">{load.message}</p>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Admin</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl">Articles</h1>
        <Link
          to="/admin/articles/new"
          className="bg-gold px-5 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory"
        >
          New article
        </Link>
      </div>
      <p className="mt-4 text-sm text-mist">
        Only published articles appear on the website, newest first. This list shows the most recently
        edited first. Changes appear within a minute or two.
      </p>

      <p role="status" className="mt-4 min-h-5 text-sm text-gold">
        {message}
      </p>

      {articles.length === 0 ? (
        <p className="mt-8 text-mist">No articles yet. Tap "New article" to write one.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {articles.map((article) => (
            <li key={article.id} className="border border-line bg-surface/40 p-5">
              <h2 className="font-serif text-2xl">{article.title}</h2>
              <p className="mt-1 text-xs uppercase tracking-widest text-mist">
                {[
                  article.category,
                  article.publishedAt ? `Published ${formatDate(article.publishedAt)}` : "Not published",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <StateSelect
                  id={`state-${article.id}`}
                  label={`Visibility of ${article.title}`}
                  value={article.state}
                  disabled={busy}
                  onChange={(state) => void changeState(article, state)}
                />
                <Link
                  to={`/admin/articles/${article.id}`}
                  className="border border-gold/60 px-4 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold"
                >
                  Edit
                </Link>
                {article.state === "published" && (
                  <Link
                    to={`/insights/${article.slug}`}
                    className="text-sm text-mist underline transition-colors hover:text-gold"
                  >
                    View on site
                  </Link>
                )}
                {article.state === "archived" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void remove(article)}
                    className="text-sm text-mist underline transition-colors hover:text-gold disabled:opacity-50"
                  >
                    Delete permanently
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}