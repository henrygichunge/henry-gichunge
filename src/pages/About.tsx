import { ButtonLink, Container, SectionHeading } from "../components/ui";
import PageHeader from "../components/PageHeader";
import Timeline from "../components/Timeline";
import SkillGroups from "../components/SkillGroups";
import { TextSkeleton } from "../components/Skeleton";
import { usePageMeta } from "../hooks/usePageMeta";
import { useBackground, useSite } from "../hooks/useSiteContent";
import { aboutContent } from "../data/content";

export default function About() {
  usePageMeta(
    "About",
    "About Henry Gichunge: educator, technology creator and entrepreneur building practical digital solutions.",
  );

  const { data: siteData } = useSite();
  const { background } = useBackground();

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Educator. Builder. Innovator."
        intro={aboutContent.lead}
      />

      <section className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Biography" title="The short version." />
          </div>
          <div className="space-y-5 leading-relaxed text-mist lg:col-span-7">
            {siteData ? (
              siteData.profile.biography.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <TextSkeleton lines={6} label="Loading biography" />
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-surface/40 py-20 sm:py-28">
        <Container>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">Personal mission</p>
          {siteData ? (
            siteData.profile.mission && (
              <blockquote className="mt-6 max-w-4xl font-serif text-3xl leading-snug sm:text-5xl">
                {siteData.profile.mission}
              </blockquote>
            )
          ) : (
            <TextSkeleton lines={2} label="Loading mission" className="mt-6 max-w-4xl" />
          )}

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {aboutContent.principles.map((item) => (
              <article key={item.title} className="border border-line bg-canvas p-7">
                <h3 className="text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{item.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Experience" title="Professional background." />
          </div>
          <div className="lg:col-span-7">
            {background ? (
              <Timeline items={background.experience} />
            ) : (
              <TextSkeleton lines={5} label="Loading experience" />
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-surface/40 py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Education" title="Qualifications and training." />
          </div>
          <div className="lg:col-span-7">
            {background ? (
              <Timeline items={background.education} />
            ) : (
              <TextSkeleton lines={5} label="Loading education" />
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Skills" title="What I bring." />
          <div className="mt-12">
            {background ? (
              <SkillGroups groups={background.skillGroups} />
            ) : (
              <TextSkeleton lines={4} label="Loading skills" />
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-20 text-center sm:py-24">
        <Container>
          <h2 className="text-4xl sm:text-5xl">Want to work together?</h2>
          <div className="mt-8 flex justify-center">
            <ButtonLink to="/contact">Get in touch</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}