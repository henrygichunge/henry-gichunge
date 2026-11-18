import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, SectionHeading } from "../ui";
import { TextSkeleton } from "../Skeleton";
import { useArticles } from "../../hooks/useArticles";
import { site } from "../../data/site";

function Row({
  to,
  category,
  title,
  excerpt,
}: {
  to: string;
  category: string;
  title: string;
  excerpt: string;
}) {
  return (
    <li>
      <Link to={to} className="group grid gap-2 py-7 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-8">
        <span className="text-xs uppercase tracking-widest text-gold">{category}</span>
        <div>
          <h3 className="text-2xl transition-colors group-hover:text-gold">{title}</h3>
          {excerpt && <p className="mt-1 text-sm text-mist">{excerpt}</p>}
        </div>
        <ArrowRight
          size={18}
          className="hidden text-mist transition-all group-hover:translate-x-1 group-hover:text-gold sm:block"
        />
      </Link>
    </li>
  );
}

export default function InsightsPreview() {
  const { data, loading } = useArticles();

  return (
    <section className="border-t border-line py-20 sm:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Insights" title="Latest thinking." />
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-ivory"
          >
            All insights <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-12">
          {loading || !data ? (
            <TextSkeleton lines={4} label="Loading articles" />
          ) : data.unavailable ? (
            <ul className="divide-y divide-line border-y border-line">
              {site.insights.map((item) => (
                <Row key={item.title} to="/insights" category={item.category} title={item.title} excerpt={item.excerpt} />
              ))}
            </ul>
          ) : data.articles.length === 0 ? (
            <p className="text-mist">Articles will be published here soon.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {data.articles.slice(0, 3).map((article) => (
                <Row
                  key={article.slug}
                  to={`/insights/${article.slug}`}
                  category={article.category}
                  title={article.title}
                  excerpt={article.excerpt}
                />
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}