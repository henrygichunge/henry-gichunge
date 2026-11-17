import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, SectionHeading } from "../ui";
import ProjectCard from "../ProjectCard";
import { CardGridSkeleton } from "../Skeleton";
import { useProjects } from "../../hooks/useProjects";

export default function ProjectsPreview() {
  const { projects, loading } = useProjects();

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

        <div className="mt-14">
          {loading ? (
            <CardGridSkeleton label="Loading projects" />
          ) : projects.length === 0 ? (
            <p className="text-mist">Projects will appear here soon.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {projects.slice(0, 3).map((project) => (
                <ProjectCard key={project.slug} project={project} cta="Learn more" />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}