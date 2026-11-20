import { Suspense, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Monogram } from "../../components/Logo";
import PageLoader from "../../components/PageLoader";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/profile", label: "Profile", end: false },
  { to: "/admin/projects", label: "Projects", end: false },
  { to: "/admin/articles", label: "Articles", end: false },
  { to: "/admin/background", label: "Background", end: false },
  { to: "/admin/skills", label: "Skills", end: false },
  { to: "/admin/cv", label: "CV", end: false },
  { to: "/admin/messages", label: "Messages", end: false },
];

export default function AdminShell() {
  const { pathname } = useLocation();
  const showNav = pathname !== "/admin/login";

  // Keep admin pages out of search engines.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    const previousTitle = document.title;
    document.title = "Admin — Henry Gichunge";

    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link to="/admin" aria-label="Admin home" className="flex items-center gap-3">
            <Monogram size={36} />
            <span className="text-xs uppercase tracking-[0.25em] text-gold">Admin</span>
          </Link>
          <Link to="/" className="text-sm text-mist transition-colors hover:text-gold">
            View site
          </Link>
        </div>

        {showNav && (
          <nav aria-label="Admin sections" className="mx-auto max-w-3xl px-5 sm:px-8">
            <ul className="flex gap-6 overflow-x-auto pb-3 text-sm">
              {links.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `whitespace-nowrap transition-colors hover:text-gold ${
                        isActive ? "text-gold" : "text-ivory/80"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <main id="main">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}