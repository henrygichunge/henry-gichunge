import { Container, SectionHeading } from "../ui";
import { site } from "../../data/site";

export default function WorkAreas() {
  return (
    <section className="border-t border-line bg-surface/40 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Areas of work"
          title="Where ideas meet practice."
          intro="Several disciplines, one purpose: useful solutions that hold up in the real world."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {site.areas.map(({ icon: Icon, title, text }, i) => (
            <article
              key={title}
              className="group border border-line bg-canvas p-7 transition-colors duration-300 hover:border-gold/60"
            >
              <div className="flex items-center justify-between">
                <Icon size={26} className="text-gold" strokeWidth={1.5} />
                <span className="font-serif text-lg text-line transition-colors group-hover:text-gold-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-8 text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{text}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}