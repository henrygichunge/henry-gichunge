import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, SectionHeading } from "../ui";
import { site } from "../../data/site";

export default function InsightsPreview() {
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

        <ul className="mt-12 divide-y divide-line border-y border-line">
          {site.insights.map((item) => (
            <li key={item.title}>
              <Link
                to="/insights"
                className="group grid gap-2 py-7 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-8"
              >
                <span className="text-xs uppercase tracking-widest text-gold">{item.category}</span>
                <div>
                  <h3 className="text-2xl transition-colors group-hover:text-gold">{item.title}</h3>
                  <p className="mt-1 text-sm text-mist">{item.excerpt}</p>
                </div>
                <ArrowRight
                  size={18}
                  className="hidden text-mist transition-all group-hover:translate-x-1 group-hover:text-gold sm:block"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}