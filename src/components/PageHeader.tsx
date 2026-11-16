import { Container } from "./ui";

export default function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-line bg-[radial-gradient(ellipse_at_top_right,rgba(200,169,107,0.10),transparent_60%)]">
      <Container className="animate-fade-up py-16 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist">{intro}</p>}
      </Container>
    </section>
  );
}