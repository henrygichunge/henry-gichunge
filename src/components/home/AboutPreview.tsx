import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, SectionHeading } from "../ui";
import { site } from "../../data/site";

export default function AboutPreview() {
  return (
    <section className="border-t border-line py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-2">
        <SectionHeading eyebrow="About" title="A practitioner who builds." />
        <div className="space-y-5 leading-relaxed text-mist">
          {site.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <Link
            to="/about"
            className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-gold transition-colors hover:text-ivory"
          >
            Read the full story <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}