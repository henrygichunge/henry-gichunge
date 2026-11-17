import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ButtonLink, Container, SectionHeading } from "../components/ui";
import PageHeader from "../components/PageHeader";
import PageLoader from "../components/PageLoader";
import StatusBadge from "../components/StatusBadge";
import Placeholder from "./Placeholder";
import { usePageMeta } from "../hooks/usePageMeta";
import { useProjects } from "../hooks/useProjects";

export default function ProjectDetail() {
  const { slug } = useParams();
  const { projects, loading } = useProjects();

  const index = projects.findIndex((p) => p.slug === slug);
  const project = index >= 0 ? projects[index] : undefined;

  usePageMeta(project ? project.name : loading ? "Project" : "Project not found", project?.summary);

  if (loading) return <PageLoader />;
  if (!project) {
    return <Placeholder title="Project not found" message="That project does not exist." />;
  }

  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <PageHeader eyebrow={project.category} title={project.name} intro={project.summary} />

      <section className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="aspect-video overflow-hidden border border-line bg-surface/40">
              {project.image ? (
                <img
                  src={project.image}
                  alt={`${project.name} screenshot`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-serif text-6xl text-line sm:text-7xl">{project.name}</span>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-mist">Screenshots will be added when available.</p>

            {project.overview && (
              <p className="mt-10 text-lg leading-relaxed text-mist">{project.overview}</p>
            )}
          </div>

          <aside className="space-y-8 lg:col-span-5">
            <div className="border border-line bg-surface/40 p-6">
              <p className="text-xs uppercase tracking-widest text-mist">Status</p>
              <div className="mt-3">
                <StatusBadge status={project.status} />
              </div>
              {project.statusNote && (
                <p className="mt-4 text-sm leading-relaxed text-mist">{project.statusNote}</p>
              )}
            </div>

            <div className="border border-line bg-surface/40 p-6">
              <p className="text-xs uppercase tracking-widest text-mist">Links</p>
              {project.links.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {project.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-ivory"
                      >
                        {link.label} <ExternalLink size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-mist">No public link yet.</p>
              )}
            </div>
          </aside>
        </Container>
      </section>

      {project.focusAreas.length > 0 && (
        <section className="border-t border-line bg-surface/40 py-20 sm:py-28">
          <Container>
            <SectionHeading eyebrow="Focus areas" title="What it is built to do." />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.focusAreas.map((area, i) => (
                <li key={area} className="border border-line bg-canvas p-6">
                  <span className="font-serif text-lg text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-4 font-serif text-2xl">{area}</p>
                </li>
              ))}
            </ul>
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-mist">
              Source code, credentials and internal implementation details are not published on this site.
            </p>
          </Container>
        </section>
      )}

      <section className="border-t border-line py-14">
        <Container className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-ivory"
          >
            <ArrowLeft size={16} /> All projects
          </Link>
          {next.slug !== project.slug && (
            <Link
              to={`/projects/${next.slug}`}
              className="inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-ivory"
            >
              Next: {next.name} <ArrowRight size={16} />
            </Link>
          )}
          <ButtonLink to="/contact" variant="ghost">
            Ask about {project.name}
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}