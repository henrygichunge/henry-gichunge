import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, SectionHeading } from "../ui";
import Reveal from "../Reveal";
import { TextSkeleton } from "../Skeleton";
import { useSite } from "../../hooks/useSiteContent";

export default function AboutPreview() {
  const { data } = useSite();

  return (
    <section className="border-t border-line py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionHeading eyebrow="About" title="A practitioner who builds." />
        </Reveal>
        <Reveal delay={150}>
          <div className="space-y-5 leading-relaxed text-mist">
            {data ? (
              data.profile.biography.map((p) => <p key={p}>{p}</p>)
            ) : (
              <TextSkeleton lines={5} label="Loading biography" />
            )}
            <Link
              to="/about"
              className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-gold transition-colors hover:text-ivory"
            >
              Read the full story <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}