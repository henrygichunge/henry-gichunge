import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Placeholder from "./pages/Placeholder";

function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Placeholder title="About" />} />
        <Route path="/education" element={<Placeholder title="Education" />} />
        <Route path="/projects" element={<Placeholder title="Projects" />} />
        <Route path="/projects/:slug" element={<Placeholder title="Project" />} />
        <Route path="/insights" element={<Placeholder title="Insights" />} />
        <Route path="/cv" element={<Placeholder title="CV" />} />
        <Route path="/contact" element={<Placeholder title="Contact" />} />
        <Route
          path="*"
          element={<Placeholder title="Page not found" message="That page does not exist." />}
        />
      </Route>
    </Routes>
  );
}