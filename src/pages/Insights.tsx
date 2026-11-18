import { Link } from "react-router-dom";
import { Container } from "../components/ui";
import PageHeader from "../components/PageHeader";
import { TextSkeleton } from "../components/Skeleton";
import { usePageMeta } from "../hooks/usePageMeta";
import { useArticles } from "../hooks/useArticles";
import { formatDate } from "../lib/format";
import { site } from "../data/site";

export default function Insights() {
  usePageMeta(
    "Insights",
    "Articles and reflections by Henry Gichunge on education, technology and innovation.",
  );

  const { data, loading } = useArticles();

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Ideas worth writing down."
        intro="Articles, reflections and discussions on education, technology and innovation."
      />

      <section className="py-16 sm:py-24">
        <Container>
          {loading || !data ? (
            <TextSkeleton lines={6} label="Loading articles" />
          ) : data.unavailable ? (
            <>
              <p className="mb-10 max-w-2xl border border-dashed border-gold-deep p-4 text-sm text-mist">
                Articles could not be loaded right now. The entries below are samples only.
              </p>
              <ul className="divide-y divide-line border-y border-line">
                {site.insights.map((item) => (
                  <li key={item.title} className="grid gap-2 py-8 sm:grid-cols-[10rem_1fr] sm:gap-8">
                    <span className="text-xs uppercase tracking-widest text-gold">{item.category}</span>
                    <article>
                      <h2 className="text-3xl">{item.title}</h2>
                      <p className="mt-2 text-sm text-mist">{item.excerpt}</p>
                      <span className="mt-4 inline-block border border-dashed border-gold-deep px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold-deep">
                        Sample
                      </span>
                    </article>
                  </li>
                ))}
              </ul>
            </>
          ) : data.articles.length === 0 ? (
            <p className="text-mist">No articles have been published yet. Please check back soon.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {data.articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    to={`/insights/${article.slug}`}
                    className="group grid gap-2 py-8 sm:grid-cols-[10rem_1fr] sm:gap-8"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gold">{article.category}</p>
                      <p className="mt-1 text-xs text-mist">{formatDate(article.publishedAt)}</p>
                    </div>
                    <article>
                      <h2 className="text-3xl transition-colors group-hover:text-gold">{article.title}</h2>
                      {article.excerpt && <p className="mt-2 text-sm text-mist">{article.excerpt}</p>}
                    </article>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}