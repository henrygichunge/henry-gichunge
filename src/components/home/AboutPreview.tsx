import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, SectionHeading } from "../ui";
import Reveal from "../Reveal";
import { TextSkeleton } from "../Skeleton";
import { useSite } from "../../hooks/useSiteContent";
import { site } from "../../data/site";

export default function AboutPreview() {
  const { data } = useSite();
  const mission = data?.profile.mission ?? "";
  const firstParagraph = data?.profile.biography[0];

  return (
    <section className="border-t border-line bg-surface/40 py-14 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <SectionHeading eyebrow="About" title="A practitioner who builds." />

          {mission && (
            <blockquote className="mt-8 border-l-2 border-gold pl-5 font-serif text-2xl leading-snug sm:text-3xl">
              {mission}
            </blockquote>
          )}

          <div className="mt-8 space-y-4 leading-relaxed text-mist">
            {data ? (
              firstParagraph && <p>{firstParagraph}</p>
            ) : (
              <TextSkeleton lines={4} label="Loading biography" />
            )}
            <Link
              to="/about"
              className="inline-flex items-center gap-2 pt-1 text-sm font-medium text-gold transition-colors hover:text-ivory"
            >
              Read the full story <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={150} className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">What I do</p>
          <ul className="mt-5 divide-y divide-line border-y border-line" aria-label="What I do">
            {site.areas.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4 py-4">
                <Icon size={20} strokeWidth={1.5} className="mt-1 shrink-0 text-gold" aria-hidden="true" />
                <div>
                  <p className="font-serif text-xl">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-mist">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}