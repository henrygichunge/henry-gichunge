import { Suspense, lazy, useEffect, useRef } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageLoader from "./components/PageLoader";
import Home from "./pages/Home";

const About = lazy(() => import("./pages/About"));
const Education = lazy(() => import("./pages/Education"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Insights = lazy(() => import("./pages/Insights"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const CV = lazy(() => import("./pages/CV"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminShell = lazy(() => import("./pages/admin/AdminShell"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminProjectEdit = lazy(() => import("./pages/admin/AdminProjectEdit"));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles"));
const AdminArticleEdit = lazy(() => import("./pages/admin/AdminArticleEdit"));

function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    // After navigating, move focus to the page so keyboard and screen reader users start at the top.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-on-gold"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <Suspense fallback={<PageLoader />}>
            <AdminShell />
          </Suspense>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/new" element={<AdminProjectEdit />} />
        <Route path="projects/:id" element={<AdminProjectEdit />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="articles/new" element={<AdminArticleEdit />} />
        <Route path="articles/:id" element={<AdminArticleEdit />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/education" element={<Education />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/insights/:slug" element={<ArticleDetail />} />
        <Route path="/cv" element={<CV />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}