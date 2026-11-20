import { Download } from "lucide-react";
import { Container, SectionHeading } from "../components/ui";
import PageHeader from "../components/PageHeader";
import Timeline from "../components/Timeline";
import SkillGroups from "../components/SkillGroups";
import { TextSkeleton } from "../components/Skeleton";
import { usePageMeta } from "../hooks/usePageMeta";
import { useBackground, useSite } from "../hooks/useSiteContent";
import { useCv } from "../hooks/useCv";
import { cvContent } from "../data/content";
import { site } from "../data/site";

export default function CV() {
  usePageMeta("CV", "Curriculum vitae of Henry Mutuma Gichunge.");

  const { data: siteData } = useSite();
  const { background } = useBackground();
  const { data: cvData, loading: cvLoading } = useCv();

  const pdfUrl = cvData?.url ?? cvContent.pdfUrl;

  return (
    <>
      <PageHeader
        eyebrow="Curriculum vitae"
        title={siteData?.profile.fullName ?? site.fullName}
        intro={cvContent.summary}
      />

      <section className="border-b border-line py-8">
        <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gold px-6 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory"
            >
              <Download size={16} /> View or download CV (PDF)
            </a>
          ) : (
            <>
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 border border-line px-6 py-3 text-sm tracking-wide text-mist opacity-60"
              >
                <Download size={16} /> View or download CV (PDF)
              </button>
              {!cvLoading && <p className="text-sm text-mist">The PDF has not been uploaded yet.</p>}
            </>
          )}
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Experience" title="Professional experience." />
          </div>
          <div className="lg:col-span-8">
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
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Education" title="Education and training." />
          </div>
          <div className="lg:col-span-8">
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
          <SectionHeading eyebrow="Skills" title="Skills." />
          <div className="mt-12">
            {background ? (
              <SkillGroups groups={background.skillGroups} />
            ) : (
              <TextSkeleton lines={4} label="Loading skills" />
            )}
          </div>
        </Container>
      </section>
    </>
  );
}