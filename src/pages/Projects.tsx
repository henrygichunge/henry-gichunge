import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { usePageMeta } from "../hooks/usePageMeta";
import { site } from "../data/site";

export default function Projects() {
  usePageMeta(
    "Projects",
    "Projects by Henry Gichunge: MathOS, BrightMe and ManageMe OS, with their current status.",
  );

  const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(site.projects.map((p) => p.category)))];
  const visible =
    category === "All" ? site.projects : site.projects.filter((p) => p.category === category);

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Products, built with purpose."
        intro="Each project is labelled honestly: operational, in development or planned."
      />

      <section className="py-16 sm:py-24">
        <Container>
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
                <Link
                  key={project.slug}
                  to={`/projects/${project.slug}`}
                  className="group flex flex-col border border-line bg-surface/40 transition-colors duration-300 hover:border-gold/60"
                >
                  <div className="aspect-video overflow-hidden border-b border-line bg-canvas">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={`${project.name} screenshot`}
                        className="h-full w-full object-cover"
                      />
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
                    <h2 className="mt-5 text-3xl">{project.name}</h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{project.summary}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm text-gold">
                      View project{" "}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}