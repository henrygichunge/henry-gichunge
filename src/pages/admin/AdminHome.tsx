import { Navigate } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import { useAdminSession } from "../../lib/admin";

export default function AdminHome() {
  const { session, signOut } = useAdminSession();

  if (session.status === "loading") return <PageLoader />;
  if (session.status === "signedOut") return <Navigate to="/admin/login" replace />;

  if (session.status === "unavailable") {
    return (
      <Container className="max-w-md py-16 sm:py-24">
        <h1 className="text-4xl">Admin</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">
          The admin service is not available here. It works only on the live site.
        </p>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-16 sm:py-24">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Signed in</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Dashboard</h1>
      <p className="mt-4 text-mist">
        Signed in as <span className="text-ivory">{session.email}</span>
      </p>

      <div className="mt-10 border border-line bg-surface/40 p-6">
        <h2 className="text-2xl">Coming next</h2>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          Editing for projects, articles, your profile and contact details arrives in the next batch.
          This page confirms that sign-in and server-side protection are working.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void signOut()}
        className="mt-10 border border-gold/60 px-6 py-3 text-sm tracking-wide text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold"
      >
        Sign out
      </button>
    </Container>
  );
}