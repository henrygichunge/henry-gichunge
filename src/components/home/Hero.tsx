import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ButtonLink, Container } from "../ui";
import Portrait from "../Portrait";
import ConnectLinks from "../ConnectLinks";
import { TextSkeleton } from "../Skeleton";
import { useProjects } from "../../hooks/useProjects";
import { useSite } from "../../hooks/useSiteContent";
import { site } from "../../data/site";

const chip =
  "inline-flex items-center border border-line px-3 py-1.5 text-xs tracking-wide text-ivory/80 transition-colors duration-300 hover:border-gold/60 hover:text-gold";

export default function Hero() {
  const words = site.taglineWords;
  const { data } = useSite();
  const { projects } = useProjects();

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(200,169,107,0.10),transparent_60%)]">
      <Container className="py-10 sm:py-16 lg:py-24">
        <div className="grid grid-cols-[1fr_auto] gap-x-5 gap-y-7 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-8">
          {/* Name and tagline: beside the photo on a phone */}
          <div className="min-w-0 animate-fade-up lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:self-end">
            <h1 className="text-5xl leading-[0.95] sm:text-7xl lg:text-8xl">
              Henry <span className="italic text-gold">Gichunge</span>
            </h1>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2 font-serif text-xl text-ivory/90 sm:mt-6 sm:text-3xl">
              {words.map((word, i) => (
                <span key={word} className="whitespace-nowrap">
                  {word}
                  {i < words.length - 1 ? (
                    <span className="ml-2 text-gold" aria-hidden="true">
                      ·
                    </span>
                  ) : (
                    <span className="text-gold">.</span>
                  )}
                </span>
              ))}
            </p>
          </div>

          {/* The photo: small on a phone, large on a desktop */}
          <div
            className="w-28 animate-fade-up sm:w-44 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:w-full lg:max-w-sm lg:self-center lg:justify-self-end"
            style={{ animationDelay: "0.15s" }}
          >
            <Portrait src={data?.profile.portraitUrl ?? undefined} alt={`Portrait of ${site.name}`} />
          </div>

          {/* Everything else, full width */}
          <div
            className="col-span-2 animate-fade-up lg:col-span-7 lg:col-start-1 lg:row-start-2"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="max-w-xl">
              {data ? (
                <p className="text-base leading-relaxed text-mist sm:text-lg">{data.profile.intro}</p>
              ) : (
                <TextSkeleton lines={3} label="Loading introduction" />
              )}
            </div>

            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Roles">
              {site.roles.map((role) => (
                <li
                  key={role}
                  className="border border-gold/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold"
                >
                  {role}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:gap-4">
              <ButtonLink to="/projects">
                View projects <ArrowRight size={16} />
              </ButtonLink>
              <ButtonLink to="/contact" variant="ghost">
                Get in touch
              </ButtonLink>
            </div>

            {projects.length > 0 && (
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] uppercase tracking-[0.2em] text-mist">Work</span>
                {projects.slice(0, 4).map((project) => (
                  <Link key={project.slug} to={`/projects/${project.slug}`} className={chip}>
                    {project.name}
                  </Link>
                ))}
              </div>
            )}

            <ConnectLinks className="mt-4" />
          </div>
        </div>
      </Container>
    </section>
  );
}