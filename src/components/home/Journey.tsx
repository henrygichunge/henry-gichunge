import { Container, SectionHeading } from "../ui";
import { site } from "../../data/site";

export default function Journey() {
  return (
    <section className="border-t border-line bg-surface/40 py-20 sm:py-28">
      <Container className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Professional journey"
            title="From the classroom to the code editor."
            intro="A summary of the path so far. Specific dates and roles will be added from the admin dashboard."
          />
        </div>
        <ol className="space-y-10 border-l border-gold-deep/50 pl-8 lg:col-span-7">
          {site.journey.map((item) => (
            <li key={item.title} className="relative">
              <span
                className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full border border-gold bg-canvas"
                aria-hidden="true"
              />
              <p className="text-xs uppercase tracking-[0.25em] text-gold">{item.stage}</p>
              <h3 className="mt-2 text-2xl">{item.title}</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-mist">{item.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}