import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, SectionHeading } from "../components/ui";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { CardGridSkeleton } from "../components/Skeleton";
import { usePageMeta } from "../hooks/usePageMeta";
import { useProjects } from "../hooks/useProjects";
import { educationContent } from "../data/content";

export default function Education() {
  usePageMeta(
    "Education",
    "Henry Gichunge's teaching background, educational interests and education technology work.",
  );

  const { projects, loading } = useProjects();
  const related = projects.filter((p) => educationContent.relatedProjectSlugs.includes(p.slug));

  return (
    <>
      <PageHeader
        eyebrow="Education"
        title="Teaching, learning and the tools between them."
        intro={educationContent.intro}
      />

      <section className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Teaching background" title="Rooted in the classroom." />
          </div>
          <div className="space-y-5 leading-relaxed text-mist lg:col-span-7">
            {educationContent.teachingBackground.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <div className="border border-dashed border-gold-deep p-5">
              <p className="text-xs uppercase tracking-widest text-gold-deep">Placeholder</p>
              {educationContent.subjects.map((s) => (
                <p key={s} className="mt-2 text-sm">
                  {s}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-surface/40 py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Educational interests" title="Questions worth working on." />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {educationContent.interests.map((interest, i) => (
              <li key={interest} className="border border-line bg-canvas p-6">
                <span className="font-serif text-lg text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-4 font-serif text-2xl">{interest}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-line py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Education technology"
            title="Where teaching meets software."
            intro={educationContent.edtechIntro}
          />
          <div className="mt-12">
            {loading ? (
              <CardGridSkeleton count={2} label="Loading projects" />
            ) : related.length === 0 ? (
              <p className="text-mist">Related projects will appear here.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {related.map((project) => (
                  <Link
                    key={project.slug}
                    to={`/projects/${project.slug}`}
                    className="group border border-line bg-surface/40 p-7 transition-colors duration-300 hover:border-gold/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-widest text-mist">{project.category}</span>
                      <StatusBadge status={project.status} />
                    </div>
                    <h3 className="mt-5 text-3xl">{project.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-mist">{project.summary}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm text-gold">
                      Learn more{" "}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}