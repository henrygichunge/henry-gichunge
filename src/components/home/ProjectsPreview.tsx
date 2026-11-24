import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, SectionHeading } from "../ui";
import ProjectCard from "../ProjectCard";
import { CardGridSkeleton } from "../Skeleton";
import { useProjects } from "../../hooks/useProjects";

export default function ProjectsPreview() {
  const { projects, loading } = useProjects();

  return (
    <section className="border-t border-line py-14 sm:py-24">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow="Selected projects" title="Products in progress." />
          <Link
            to="/projects"
            className="hidden shrink-0 items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-ivory sm:inline-flex"
          >
            All projects <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 sm:mt-12">
          {loading ? (
            <CardGridSkeleton label="Loading projects" />
          ) : projects.length === 0 ? (
            <p className="text-mist">Projects will appear here soon.</p>
          ) : (
            <>
              {/* A swipeable row on a phone, a grid on larger screens */}
              <div
                role="region"
                aria-label="Selected projects"
                tabIndex={0}
                className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3"
              >
                {projects.slice(0, 3).map((project) => (
                  <div
                    key={project.slug}
                    className="flex w-[82%] shrink-0 snap-start sm:w-auto [&>a]:w-full"
                  >
                    <ProjectCard project={project} cta="Learn more" />
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between sm:hidden">
                <p className="text-xs text-mist">Swipe to see more</p>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-ivory"
                >
                  All projects <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}