import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Container } from "../../components/ui";
import { login, useAdminSession } from "../../lib/admin";

const fieldClass =
  "mt-2 w-full border border-line bg-surface/40 px-4 py-3 text-ivory focus:border-gold";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { session } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (session.status === "signedIn") return <Navigate to="/admin" replace />;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    const result = await login(email, password);
    setPassword("");

    if (result.ok) {
      navigate("/admin", { replace: true });
      return;
    }
    setError(result.message);
    setBusy(false);
  }

  return (
    <Container className="max-w-md py-16 sm:py-24">
      <h1 className="text-4xl sm:text-5xl">Sign in</h1>
      <p className="mt-3 text-sm text-mist">Private area. Authorised access only.</p>

      {session.status === "unavailable" && (
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">
          The admin service is not available here. Sign-in works only on the live site.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-5" aria-label="Admin sign in">
        <div>
          <label htmlFor="admin-email" className="text-sm text-ivory/80">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            maxLength={320}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="text-sm text-ivory/80">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-gold">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-gold px-6 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </Container>
  );
}