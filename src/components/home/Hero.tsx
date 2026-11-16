import { ArrowRight } from "lucide-react";
import { ButtonLink, Container } from "../ui";
import Portrait from "../Portrait";
import { site } from "../../data/site";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(200,169,107,0.10),transparent_60%)]">
      <Container className="grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-12 lg:py-32">
        <div className="animate-fade-up lg:col-span-7">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            {site.roles.join("  ·  ")}
          </p>

          <h1 className="mt-6 text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
            Henry <span className="italic text-gold">Gichunge</span>
          </h1>

          <p className="mt-8 flex flex-wrap items-center gap-x-3 font-serif text-2xl text-ivory/90 sm:text-3xl">
            {site.taglineWords.map((word, i) => (
              <span key={word} className="flex items-center gap-3">
                {word}
                <span className="text-gold" aria-hidden="true">
                  {i < site.taglineWords.length - 1 ? "·" : "."}
                </span>
              </span>
            ))}
          </p>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-mist">{site.intro}</p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <ButtonLink to="/projects">
              View projects <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink to="/contact" variant="ghost">
              Get in touch
            </ButtonLink>
          </div>
        </div>

        <div className="animate-fade-up px-2 lg:col-span-5" style={{ animationDelay: "0.2s" }}>
          <Portrait src={site.portraitSrc} alt={`Portrait of ${site.name}`} />
        </div>
      </Container>
    </section>
  );
}