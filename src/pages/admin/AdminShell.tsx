import { Suspense, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { Monogram } from "../../components/Logo";
import PageLoader from "../../components/PageLoader";

export default function AdminShell() {
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
      </header>
      <main id="main">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}