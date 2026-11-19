import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import Field from "../../components/admin/Field";
import StateSelect from "../../components/admin/StateSelect";
import {
  createTimelineItem,
  getTimelineItem,
  setTimelineState,
  updateTimelineItem,
  type TimelineInput,
  type TimelineKind,
} from "../../lib/adminBackground";
import { describeFailure, type ContentState } from "../../lib/adminProjects";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signedOut" }
  | { kind: "missing" }
  | { kind: "error"; message: string };

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

const EMPTY: TimelineInput = { title: "", organisation: "", period: "", description: "" };

const LABELS: Record<TimelineKind, { title: string; organisation: string; page: string }> = {
  experience: { title: "Role or position", organisation: "Organisation", page: "Experience" },
  education: { title: "Qualification or course", organisation: "Institution", page: "Education" },
};

const sectionClass = "space-y-5 border border-line bg-surface/40 p-6";

function TimelineEditor({ id }: { id: string | undefined }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const creating = id === undefined;
  const justCreated = (location.state as { created?: boolean } | null)?.created === true;

  const [load, setLoad] = useState<LoadState>(creating ? { kind: "ready" } : { kind: "loading" });
  const [kind, setKind] = useState<TimelineKind>(
    searchParams.get("kind") === "education" ? "education" : "experience",
  );
  const [state, setState] = useState<ContentState>("draft");
  const [values, setValues] = useState<TimelineInput>(EMPTY);
  const [saveStatus, setSaveStatus] = useState<Status>({ kind: "idle" });
  const [stateStatus, setStateStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    if (id === undefined) return;
    if (!/^\d{1,9}$/.test(id)) {
      setLoad({ kind: "missing" });
      return;
    }

    let active = true;
    void getTimelineItem(Number(id)).then((result) => {
      if (!active) return;
      if (result.ok) {
        const item = result.data;
        setKind(item.kind);
        setState(item.state);
        setValues({
          title: item.title,
          organisation: item.organisation,
          period: item.period,
          description: item.description,
        });
        setLoad({ kind: "ready" });
      } else if (result.status === 401) {
        setLoad({ kind: "signedOut" });
      } else if (result.status === 404) {
        setLoad({ kind: "missing" });
      } else {
        setLoad({ kind: "error", message: describeFailure(result.status, result.message) });
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  function update<K extends keyof TimelineInput>(key: K, value: TimelineInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaveStatus({ kind: "saving" });

    if (creating) {
      const result = await createTimelineItem(kind, values);
      if (result.ok) {
        navigate(`/admin/background/${result.data.id}`, { replace: true, state: { created: true } });
        return;
      }
      setSaveStatus({ kind: "error", message: describeFailure(result.status, result.message) });
      return;
    }

    const result = await updateTimelineItem(Number(id), values);
    if (result.ok) {
      setSaveStatus({ kind: "saved" });
    } else {
      setSaveStatus({ kind: "error", message: describeFailure(result.status, result.message) });
    }
  }

  async function onStateChange(next: ContentState) {
    setStateStatus({ kind: "saving" });
    const result = await setTimelineState(Number(id), next);
    if (result.ok) {
      setState(next);
      setStateStatus({ kind: "saved" });
    } else {
      setStateStatus({ kind: "error", message: describeFailure(result.status, result.message) });
    }
  }

  if (load.kind === "loading") return <PageLoader />;
  if (load.kind === "signedOut") return <Navigate to="/admin/login" replace />;

  if (load.kind === "missing" || load.kind === "error") {
    return (
      <Container className="max-w-3xl py-16 sm:py-24">
        <h1 className="text-4xl">Entry</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">
          {load.kind === "missing" ? "That entry does not exist." : load.message}
        </p>
        <Link to="/admin/background" className="mt-6 inline-block text-sm text-gold hover:text-ivory">
          Back to experience and education
        </Link>
      </Container>
    );
  }

  const labels = LABELS[kind];

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <Link to="/admin/background" className="text-sm text-mist transition-colors hover:text-gold">
        ← Experience and education
      </Link>
      <h1 className="mt-4 text-4xl sm:text-5xl">
        {creating ? `New ${labels.page.toLowerCase()} entry` : values.title || "Entry"}
      </h1>

      {justCreated && (
        <p role="status" className="mt-4 border border-gold/40 p-4 text-sm text-gold">
          Entry created as a draft. It is not public until you set its visibility to Published.
        </p>
      )}

      {!creating && (
        <section className={`${sectionClass} mt-8`}>
          <h2 className="text-2xl">Visibility</h2>
          <p className="text-sm text-mist">
            Only published entries appear on the website. Archived entries are hidden but kept.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <StateSelect
              id="timeline-state"
              value={state}
              disabled={stateStatus.kind === "saving"}
              onChange={(next) => void onStateChange(next)}
            />
            <p role="status" className="text-sm text-gold">
              {stateStatus.kind === "saved" && "Updated."}
              {stateStatus.kind === "error" && stateStatus.message}
            </p>
          </div>
        </section>
      )}

      <form onSubmit={(e) => void onSave(e)} aria-label="Entry details" className="mt-8 space-y-8">
        <section className={sectionClass}>
          <h2 className="text-2xl">Details</h2>

          {creating ? (
            <div>
              <label htmlFor="timeline-kind" className="text-sm text-ivory/80">
                Section
              </label>
              <select
                id="timeline-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value === "education" ? "education" : "experience")}
                className="mt-2 w-full border border-line bg-canvas px-4 py-3 text-ivory focus:border-gold"
              >
                <option value="experience">Experience</option>
                <option value="education">Education and training</option>
              </select>
              <p className="mt-2 text-xs leading-relaxed text-mist">Cannot be changed after creating.</p>
            </div>
          ) : (
            <p className="text-sm text-mist">
              Section: <span className="text-ivory">{labels.page}</span>
            </p>
          )}

          <Field
            id="timeline-title"
            label={labels.title}
            value={values.title}
            maxLength={100}
            onChange={(v) => update("title", v)}
          />
          <Field
            id="timeline-organisation"
            label={labels.organisation}
            value={values.organisation}
            maxLength={100}
            onChange={(v) => update("organisation", v)}
          />
          <Field
            id="timeline-period"
            label="Period"
            hint="Plain text, for example 2019 – 2023 or Since 2021. Only write what is true."
            value={values.period}
            maxLength={60}
            onChange={(v) => update("period", v)}
          />
          <Field
            id="timeline-description"
            label="Description"
            hint="A few sentences. Up to 1000 characters."
            multiline
            rows={6}
            value={values.description}
            maxLength={1000}
            onChange={(v) => update("description", v)}
          />
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saveStatus.kind === "saving"}
            className="bg-gold px-6 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveStatus.kind === "saving" ? "Saving…" : creating ? "Create entry" : "Save changes"}
          </button>
          <p role="status" className="text-sm text-gold">
            {saveStatus.kind === "saved" && "Saved. The public site updates within a minute or two."}
            {saveStatus.kind === "error" && saveStatus.message}
          </p>
        </div>
      </form>
    </Container>
  );
}

export default function AdminTimelineEdit() {
  const { id } = useParams();
  // The key restarts the editor when the address changes, for example after creating an entry.
  return <TimelineEditor key={id ?? "new"} id={id} />;
}