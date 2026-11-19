import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import StateSelect from "../../components/admin/StateSelect";
import {
  deleteTimelineItem,
  listTimeline,
  reorderTimeline,
  setTimelineState,
  type TimelineKind,
  type TimelineRow,
} from "../../lib/adminBackground";
import { describeFailure, type ContentState } from "../../lib/adminProjects";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signedOut" }
  | { kind: "error"; message: string };

const SECTIONS: { kind: TimelineKind; title: string; add: string }[] = [
  { kind: "experience", title: "Experience", add: "Add experience" },
  { kind: "education", title: "Education and training", add: "Add education" },
];

const iconButton =
  "border border-line p-2 text-mist transition-colors hover:border-gold/60 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40";

export default function AdminBackground() {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [items, setItems] = useState<TimelineRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void listTimeline().then((result) => {
      if (!active) return;
      if (result.ok) {
        setItems(result.data.items);
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

  async function changeState(item: TimelineRow, state: ContentState) {
    setBusy(true);
    setMessage("");
    const result = await setTimelineState(item.id, state);
    if (result.ok) {
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, state } : i)));
    } else {
      setMessage(describeFailure(result.status, result.message));
    }
    setBusy(false);
  }

  async function move(kind: TimelineKind, index: number, direction: -1 | 1) {
    const group = items.filter((i) => i.kind === kind);
    const target = index + direction;
    if (target < 0 || target >= group.length) return;

    const next = [...group];
    [next[index], next[target]] = [next[target], next[index]];

    setBusy(true);
    setMessage("");
    const result = await reorderTimeline(
      kind,
      next.map((i) => i.id),
    );
    if (result.ok) {
      setItems((list) => [...list.filter((i) => i.kind !== kind), ...next]);
    } else {
      setMessage(describeFailure(result.status, result.message));
    }
    setBusy(false);
  }

  async function remove(item: TimelineRow) {
    if (!window.confirm(`Permanently delete "${item.title}"? This cannot be undone.`)) return;

    setBusy(true);
    setMessage("");
    const result = await deleteTimelineItem(item.id);
    if (result.ok) {
      setItems((list) => list.filter((i) => i.id !== item.id));
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
        <h1 className="text-4xl">Background</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">{load.message}</p>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Admin</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Experience and education</h1>
      <p className="mt-4 text-sm leading-relaxed text-mist">
        Shown on the About and CV pages, in the order below. A section with no published entries shows a
        &ldquo;to be confirmed&rdquo; placeholder on the website. Skills are managed on their{" "}
        <Link to="/admin/skills" className="text-gold underline hover:text-ivory">
          own page
        </Link>
        .
      </p>

      <p role="status" className="mt-4 min-h-5 text-sm text-gold">
        {message}
      </p>

      {SECTIONS.map((section) => {
        const group = items.filter((i) => i.kind === section.kind);
        return (
          <section key={section.kind} className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl">{section.title}</h2>
              <Link
                to={`/admin/background/new?kind=${section.kind}`}
                className="bg-gold px-5 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory"
              >
                {section.add}
              </Link>
            </div>

            {group.length === 0 ? (
              <p className="mt-4 text-sm text-mist">No entries yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {group.map((item, index) => (
                  <li key={item.id} className="border border-line bg-surface/40 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-2xl">{item.title}</h3>
                        <p className="mt-1 text-xs uppercase tracking-widest text-mist">
                          {[item.organisation, item.period].filter(Boolean).join(" · ") || "No details"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label={`Move ${item.title} up`}
                          disabled={busy || index === 0}
                          onClick={() => void move(section.kind, index, -1)}
                          className={iconButton}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${item.title} down`}
                          disabled={busy || index === group.length - 1}
                          onClick={() => void move(section.kind, index, 1)}
                          className={iconButton}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <StateSelect
                        id={`state-${item.id}`}
                        label={`Visibility of ${item.title}`}
                        value={item.state}
                        disabled={busy}
                        onChange={(state) => void changeState(item, state)}
                      />
                      <Link
                        to={`/admin/background/${item.id}`}
                        className="border border-gold/60 px-4 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold"
                      >
                        Edit
                      </Link>
                      {item.state === "archived" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void remove(item)}
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
          </section>
        );
      })}
    </Container>
  );
}