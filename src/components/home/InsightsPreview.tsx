import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, SectionHeading } from "../ui";
import { useArticles } from "../../hooks/useArticles";
import { formatDate } from "../../lib/format";
import { site } from "../../data/site";

function Row({
  to,
  category,
  title,
  excerpt,
  date,
}: {
  to: string;
  category: string;
  title: string;
  excerpt: string;
  date?: string;
}) {
  return (
    <li>
      <Link to={to} className="group grid gap-2 py-6 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold">{category}</span>
          {date && <p className="mt-1 text-xs text-mist">{date}</p>}
        </div>
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
  const { data } = useArticles();

  // Nothing to show yet: leave the section out instead of showing an empty one.
  if (!data) return null;
  if (!data.unavailable && data.articles.length === 0) return null;

  return (
    <section className="border-t border-line py-14 sm:py-24">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow="Insights" title="Latest thinking." />
          <Link
            to="/insights"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-ivory"
          >
            All insights <ArrowRight size={16} />
          </Link>
        </div>

        <ul className="mt-8 divide-y divide-line border-y border-line sm:mt-12">
          {data.unavailable
            ? site.insights.map((item) => (
                <Row
                  key={item.title}
                  to="/insights"
                  category={item.category}
                  title={item.title}
                  excerpt={item.excerpt}
                />
              ))
            : data.articles
                .slice(0, 3)
                .map((article) => (
                  <Row
                    key={article.slug}
                    to={`/insights/${article.slug}`}
                    category={article.category}
                    title={article.title}
                    excerpt={article.excerpt}
                    date={formatDate(article.publishedAt)}
                  />
                ))}
        </ul>
      </Container>
    </section>
  );
}