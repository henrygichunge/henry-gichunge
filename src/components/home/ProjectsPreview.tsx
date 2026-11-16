import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, SectionHeading } from "../ui";
import { site, type ProjectStatus } from "../../data/site";

function StatusBadge({ status }: { status: ProjectStatus }) {
  const live = status === "Operational";
  return (
    <span
      className={`inline-block px-3 py-1 text-[11px] font-medium uppercase tracking-widest ${
        live ? "bg-gold text-canvas" : "border border-gold/50 text-gold"
      }`}
    >
      {status}
    </span>
  );
}

export default function ProjectsPreview() {
  return (
    <section className="border-t border-line py-20 sm:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Selected projects" title="Products in progress." />
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-ivory"
          >
            All projects <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {site.projects.map((project) => (
            <Link
              key={project.slug}
              to={`/projects/${project.slug}`}
              className="group flex flex-col border border-line bg-surface/40 transition-colors duration-300 hover:border-gold/60"
            >
              <div className="relative aspect-video overflow-hidden border-b border-line bg-canvas">
                {project.image ? (
                  <img src={project.image} alt={`${project.name} screenshot`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-serif text-5xl text-line transition-colors group-hover:text-gold-deep">
                      {project.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-widest text-mist">{project.category}</span>
                  <StatusBadge status={project.status} />
                </div>
                <h3 className="mt-5 text-3xl">{project.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{project.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm text-gold">
                  Learn more <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}