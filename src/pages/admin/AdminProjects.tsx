import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import StateSelect from "../../components/admin/StateSelect";
import {
  STATUS_LABELS,
  deleteProject,
  describeFailure,
  listProjects,
  reorderProjects,
  setProjectState,
  type AdminProjectRow,
  type ContentState,
} from "../../lib/adminProjects";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signedOut" }
  | { kind: "error"; message: string };

const iconButton =
  "border border-line p-2 text-mist transition-colors hover:border-gold/60 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40";

export default function AdminProjects() {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [projects, setProjects] = useState<AdminProjectRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void listProjects().then((result) => {
      if (!active) return;
      if (result.ok) {
        setProjects(result.data.projects);
        setLoad({ kind: "ready" });
      } else if (result.status === 401) {
        setLoad({ kind: "signedOut" });
      } else {
        setLoad({ kind: "error", message: describeFailure(result.status, result.message) });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function changeState(project: AdminProjectRow, state: ContentState) {
    setBusy(true);
    setMessage("");
    const result = await setProjectState(project.id, state);
    if (result.ok) {
      setProjects((list) => list.map((p) => (p.id === project.id ? { ...p, state } : p)));
    } else {
      setMessage(describeFailure(result.status, result.message));
    }
    setBusy(false);
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;

    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];

    setBusy(true);
    setMessage("");
    const result = await reorderProjects(next.map((p) => p.id));
    if (result.ok) {
      setProjects(next);
    } else {
      setMessage(describeFailure(result.status, result.message));
    }
    setBusy(false);
  }

  async function remove(project: AdminProjectRow) {
    if (!window.confirm(`Permanently delete "${project.name}"? This cannot be undone.`)) return;

    setBusy(true);
    setMessage("");
    const result = await deleteProject(project.id);
    if (result.ok) {
      setProjects((list) => list.filter((p) => p.id !== project.id));
    } else {
      setMessage(describeFailure(result.status, result.message));
    }
    setBusy(false);
  }

  if (load.kind === "loading") return <PageLoader />;
  if (load.kind === "signedOut") return <Navigate to="/admin/login" replace />;
  if (load.kind === "error") {
    return (
      <Container className="max-w-3xl py-16 sm:py-24">
        <h1 className="text-4xl">Projects</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">{load.message}</p>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Admin</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl">Projects</h1>
        <Link
          to="/admin/projects/new"
          className="bg-gold px-5 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory"
        >
          New project
        </Link>
      </div>
      <p className="mt-4 text-sm text-mist">
        Only published projects appear on the website, in the order shown here. Changes appear within a
        minute or two.
      </p>

      <p role="status" className="mt-4 min-h-5 text-sm text-gold">
        {message}
      </p>

      {projects.length === 0 ? (
        <p className="mt-8 text-mist">No projects yet. Tap "New project" to add one.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {projects.map((project, index) => (
            <li key={project.id} className="border border-line bg-surface/40 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl">{project.name}</h2>
                  <p className="mt-1 text-xs uppercase tracking-widest text-mist">
                    {project.category} · {STATUS_LABELS[project.status]}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label={`Move ${project.name} up`}
                    disabled={busy || index === 0}
                    onClick={() => void move(index, -1)}
                    className={iconButton}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${project.name} down`}
                    disabled={busy || index === projects.length - 1}
                    onClick={() => void move(index, 1)}
                    className={iconButton}
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <StateSelect
                  id={`state-${project.id}`}
                  label={`Visibility of ${project.name}`}
                  value={project.state}
                  disabled={busy}
                  onChange={(state) => void changeState(project, state)}
                />
                <Link
                  to={`/admin/projects/${project.id}`}
                  className="border border-gold/60 px-4 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold"
                >
                  Edit
                </Link>
                {project.state === "published" && (
                  <Link
                    to={`/projects/${project.slug}`}
                    className="text-sm text-mist underline transition-colors hover:text-gold"
                  >
                    View on site
                  </Link>
                )}
                {project.state === "archived" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void remove(project)}
                    className="text-sm text-mist underline transition-colors hover:text-gold disabled:opacity-50"
                  >
                    Delete permanently
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}