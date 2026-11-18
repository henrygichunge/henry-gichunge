import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Container } from "../components/ui";
import PageHeader from "../components/PageHeader";
import PageLoader from "../components/PageLoader";
import Placeholder from "./Placeholder";
import { usePageMeta } from "../hooks/usePageMeta";
import { useArticle } from "../hooks/useArticles";
import { formatDate } from "../lib/format";

function ArticleView({ slug }: { slug: string }) {
  const { data, loading } = useArticle(slug);
  const article = data?.article;

  usePageMeta(
    article ? article.seoTitle || article.title : loading ? "Article" : "Article not found",
    article ? article.seoDescription || article.excerpt || undefined : undefined,
  );

  if (loading) return <PageLoader />;
  if (!article) {
    return (
      <Placeholder
        title="Article not found"
        message="That article does not exist or is not published."
      />
    );
  }

  const date = formatDate(article.publishedAt);

  return (
    <>
      <PageHeader
        eyebrow={article.category || "Insights"}
        title={article.title}
        intro={article.excerpt || undefined}
      />

      <article className="py-16 sm:py-24">
        <Container>
          <div className="max-w-3xl">
            {date && <p className="text-xs uppercase tracking-widest text-gold">{date}</p>}

            {article.coverImage && (
              <img
                src={article.coverImage}
                alt={`Cover image for ${article.title}`}
                className="mt-8 w-full border border-line object-cover"
              />
            )}

            <div className="mt-8 space-y-6 text-lg leading-relaxed text-mist">
              {article.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <Link
              to="/insights"
              className="mt-14 inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-ivory"
            >
              <ArrowLeft size={16} /> All insights
            </Link>
          </div>
        </Container>
      </article>
    </>
  );
}

export default function ArticleDetail() {
  const { slug } = useParams();
  // The key restarts the view when the address changes to a different article.
  return <ArticleView key={slug} slug={slug ?? ""} />;
}