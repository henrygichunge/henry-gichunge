import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import type { ProjectItem } from "../../shared/api";

export default function ProjectCard({
  project,
  as: Heading = "h3",
  cta = "View project",
}: {
  project: ProjectItem;
  as?: "h2" | "h3";
  cta?: string;
}) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group flex flex-col border border-line bg-surface/40 transition-colors duration-300 hover:border-gold/60"
    >
      <div className="aspect-video overflow-hidden border-b border-line bg-canvas">
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
        <Heading className="mt-5 text-3xl">{project.name}</Heading>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{project.summary}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm text-gold">
          {cta} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}