import { useState } from "react";
import { Container } from "../components/ui";
import PageHeader from "../components/PageHeader";
import ProjectCard from "../components/ProjectCard";
import { CardGridSkeleton } from "../components/Skeleton";
import { usePageMeta } from "../hooks/usePageMeta";
import { useProjects } from "../hooks/useProjects";

export default function Projects() {
  usePageMeta(
    "Projects",
    "Projects by Henry Gichunge: MathOS, BrightMe and ManageMe OS, with their current status.",
  );

  const { projects, loading } = useProjects();
  const [category, setCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const visible = category === "All" ? projects : projects.filter((p) => p.category === category);

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Products, built with purpose."
        intro="Each project is labelled honestly: operational, in development or planned."
      />

      <section className="py-16 sm:py-24">
        <Container>
          {loading ? (
            <CardGridSkeleton label="Loading projects" />
          ) : projects.length === 0 ? (
            <p className="text-mist">No projects have been published yet.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Filter projects by category">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                    className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-300 ${
                      category === c
                        ? "bg-gold text-canvas"
                        : "border border-line text-mist hover:border-gold/60 hover:text-gold"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {visible.length === 0 ? (
                <p className="mt-14 text-mist">No projects in this category yet.</p>
              ) : (
                <div className="mt-12 grid gap-6 lg:grid-cols-3">
                  {visible.map((project) => (
                    <ProjectCard key={project.slug} project={project} as="h2" />
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}