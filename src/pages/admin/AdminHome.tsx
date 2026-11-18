import { ArrowRight } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import { useAdminSession } from "../../lib/admin";

const soon = [
  "Projects",
  "Articles",
  "Experience, education and skills",
  "Images and CV upload",
  "Contact messages",
  "SEO",
];

export default function AdminHome() {
  const { session, signOut } = useAdminSession();

  if (session.status === "loading") return <PageLoader />;
  if (session.status === "signedOut") return <Navigate to="/admin/login" replace />;

  if (session.status === "unavailable") {
    return (
      <Container className="max-w-3xl py-16 sm:py-24">
        <h1 className="text-4xl">Admin</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">
          The admin service is not available here. It works only on the live site.
        </p>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Signed in</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Dashboard</h1>
      <p className="mt-4 text-mist">
        Signed in as <span className="text-ivory">{session.email}</span>
      </p>

      <h2 className="mt-12 text-2xl">Manage</h2>
      <ul className="mt-4 space-y-3">
        <li>
          <Link
            to="/admin/profile"
            className="group flex items-center justify-between border border-line bg-surface/40 p-5 transition-colors duration-300 hover:border-gold/60"
          >
            <span>
              <span className="block font-serif text-2xl">Profile and contact</span>
              <span className="mt-1 block text-sm text-mist">
                Biography, intro, mission, contact details and social links
              </span>
            </span>
            <ArrowRight size={18} className="text-gold transition-transform group-hover:translate-x-1" />
          </Link>
        </li>
        {soon.map((name) => (
          <li
            key={name}
            className="flex items-center justify-between border border-dashed border-line p-5 text-mist"
          >
            <span className="font-serif text-xl">{name}</span>
            <span className="text-[10px] uppercase tracking-widest text-gold-deep">Soon</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => void signOut()}
        className="mt-12 border border-gold/60 px-6 py-3 text-sm tracking-wide text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold"
      >
        Sign out
      </button>
    </Container>
  );
}