import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import {
  deleteEnquiry,
  listEnquiries,
  setEnquiryStatus,
  type Enquiry,
  type EnquiryStatus,
} from "../../lib/adminEnquiries";
import { describeFailure } from "../../lib/adminProjects";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signedOut" }
  | { kind: "error"; message: string };

type Filter = "all" | EnquiryStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  read: "Read",
  archived: "Archived",
};

const actionButton =
  "border border-line px-4 py-2 text-sm text-mist transition-colors hover:border-gold/60 hover:text-gold disabled:cursor-not-allowed disabled:opacity-50";

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminMessages() {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [items, setItems] = useState<Enquiry[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void listEnquiries().then((result) => {
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

  async function changeStatus(item: Enquiry, status: EnquiryStatus) {
    setBusy(true);
    setMessage("");
    const result = await setEnquiryStatus(item.id, status);
    if (result.ok) {
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, status } : i)));
    } else {
      setMessage(describeFailure(result.status, result.message));
    }
    setBusy(false);
  }

  async function remove(item: Enquiry) {
    if (!window.confirm(`Permanently delete the message from ${item.name}? This cannot be undone.`)) return;

    setBusy(true);
    setMessage("");
    const result = await deleteEnquiry(item.id);
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
        <h1 className="text-4xl">Messages</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">{load.message}</p>
      </Container>
    );
  }

  const newCount = items.filter((i) => i.status === "new").length;
  const visible = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Admin</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Messages</h1>
      <p className="mt-4 text-sm leading-relaxed text-mist">
        Messages sent from the contact form, newest first. {newCount === 0 ? "No new messages." : `${newCount} new.`}{" "}
        The most recent 200 are shown. Archive what you have dealt with, then delete it when you no longer
        need it.
      </p>

      <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Filter messages">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-300 ${
              filter === f.value
                ? "bg-gold text-canvas"
                : "border border-line text-mist hover:border-gold/60 hover:text-gold"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p role="status" className="mt-4 min-h-5 text-sm text-gold">
        {message}
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 text-mist">No messages here.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {visible.map((item) => (
            <li key={item.id} className="border border-line bg-surface/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl">{item.name}</h2>
                  <p className="mt-1 break-all text-sm text-gold">{item.email}</p>
                </div>
                <span
                  className={`inline-block px-3 py-1 text-[11px] font-medium uppercase tracking-widest ${
                    item.status === "new" ? "bg-gold text-canvas" : "border border-gold/50 text-gold"
                  }`}
                >
                  {STATUS_LABELS[item.status]}
                </span>
              </div>

              <p className="mt-1 text-xs text-mist">{formatWhen(item.createdAt)}</p>

              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-ivory/90">
                {item.message}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${item.email}?subject=${encodeURIComponent("Re: your message to Henry Gichunge")}`}
                  className="border border-gold/60 px-4 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold"
                >
                  Reply by email
                </a>

                {item.status === "new" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void changeStatus(item, "read")}
                    className={actionButton}
                  >
                    Mark as read
                  </button>
                )}
                {item.status === "read" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void changeStatus(item, "new")}
                    className={actionButton}
                  >
                    Mark as new
                  </button>
                )}
                {item.status !== "archived" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void changeStatus(item, "archived")}
                    className={actionButton}
                  >
                    Archive
                  </button>
                )}
                {item.status === "archived" && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void changeStatus(item, "read")}
                      className={actionButton}
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void remove(item)}
                      className="text-sm text-mist underline transition-colors hover:text-gold disabled:opacity-50"
                    >
                      Delete permanently
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}