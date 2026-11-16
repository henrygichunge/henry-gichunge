import { Container } from "../components/ui";
import PageHeader from "../components/PageHeader";
import { usePageMeta } from "../hooks/usePageMeta";
import { site } from "../data/site";

export default function Insights() {
  usePageMeta(
    "Insights",
    "Articles and reflections by Henry Gichunge on education, technology and innovation.",
  );

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Ideas worth writing down."
        intro="Articles, reflections and discussions on education, technology and innovation."
      />

      <section className="py-16 sm:py-24">
        <Container>
          <p className="mb-10 max-w-2xl border border-dashed border-gold-deep p-4 text-sm text-mist">
            The entries below are samples only. Real articles will be published here from the admin dashboard.
          </p>

          {site.insights.length === 0 ? (
            <p className="text-mist">No articles have been published yet.</p>
          ) : (
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
          )}
        </Container>
      </section>
    </>
  );
}