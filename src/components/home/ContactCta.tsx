import { ButtonLink, Container } from "../ui";
import { site } from "../../data/site";

export default function ContactCta() {
  return (
    <section className="border-t border-line bg-[radial-gradient(ellipse_at_center,rgba(200,169,107,0.08),transparent_65%)] py-24 sm:py-32">
      <Container className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">Contact</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl leading-tight sm:text-6xl">
          Let&rsquo;s build something <span className="italic text-gold">worthwhile</span>.
        </h2>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-mist">
          Whether it is a project, a collaboration or a conversation about education and technology, you are welcome to reach out.
        </p>
        <div className="mt-10 flex justify-center">
          <ButtonLink to="/contact">Start a conversation</ButtonLink>
        </div>
        {site.email && <p className="mt-6 text-sm text-mist">{site.email}</p>}
      </Container>
    </section>
  );
}