import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import Field from "../../components/admin/Field";
import ImageUpload from "../../components/admin/ImageUpload";
import StateSelect from "../../components/admin/StateSelect";
import {
  STATUS_OPTIONS,
  createProject,
  describeFailure,
  getProject,
  setProjectState,
  updateProject,
  type AdminProjectInput,
  type ContentState,
  type ProjectStatus,
} from "../../lib/adminProjects";

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

const EMPTY: AdminProjectInput = {
  name: "",
  category: "",
  status: "status_to_confirm",
  summary: "",
  overview: "",
  statusNote: "",
  imageUrl: "",
  focusAreas: [],
  links: [],
};

const SLUG_HINT =
  "Lowercase letters, numbers and dashes, for example my-new-app. It becomes the page address (/projects/my-new-app) and cannot be changed later.";

const sectionClass = "space-y-5 border border-line bg-surface/40 p-6";
const selectClass =
  "mt-2 w-full border border-line bg-canvas px-4 py-3 text-ivory focus:border-gold";
const smallButton = "text-sm text-mist underline transition-colors hover:text-gold";

function ProjectEditor({ id }: { id: string | undefined }) {
  const navigate = useNavigate();
  const location = useLocation();
  const creating = id === undefined;
  const justCreated = (location.state as { created?: boolean } | null)?.created === true;

  const [load, setLoad] = useState<LoadState>(creating ? { kind: "ready" } : { kind: "loading" });
  const [slug, setSlug] = useState("");
  const [state, setState] = useState<ContentState>("draft");
  const [values, setValues] = useState<AdminProjectInput>(EMPTY);
  const [saveStatus, setSaveStatus] = useState<Status>({ kind: "idle" });
  const [stateStatus, setStateStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    if (id === undefined) return;
    if (!/^\d{1,9}$/.test(id)) {
      setLoad({ kind: "missing" });
      return;
    }

    let active = true;
    void getProject(Number(id)).then((result) => {
      if (!active) return;
      if (result.ok) {
        const project = result.data;
        setSlug(project.slug);
        setState(project.state);
        setValues({
          name: project.name,
          category: project.category,
          status: project.status,
          summary: project.summary,
          overview: project.overview,
          statusNote: project.statusNote,
          imageUrl: project.imageUrl,
          focusAreas: project.focusAreas,
          links: project.links,
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

  function update<K extends keyof AdminProjectInput>(key: K, value: AdminProjectInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaveStatus({ kind: "saving" });

    if (creating) {
      const result = await createProject(slug.trim(), values);
      if (result.ok) {
        navigate(`/admin/projects/${result.data.id}`, { replace: true, state: { created: true } });
        return;
      }
      setSaveStatus({ kind: "error", message: describeFailure(result.status, result.message) });
      return;
    }

    const result = await updateProject(Number(id), values);
    if (result.ok) {
      setSaveStatus({ kind: "saved" });
    } else {
      setSaveStatus({ kind: "error", message: describeFailure(result.status, result.message) });
    }
  }

  async function onStateChange(next: ContentState) {
    setStateStatus({ kind: "saving" });
    const result = await setProjectState(Number(id), next);
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
        <h1 className="text-4xl">Project</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">
          {load.kind === "missing" ? "That project does not exist." : load.message}
        </p>
        <Link to="/admin/projects" className="mt-6 inline-block text-sm text-gold hover:text-ivory">
          Back to projects
        </Link>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <Link to="/admin/projects" className="text-sm text-mist transition-colors hover:text-gold">
        ← All projects
      </Link>
      <h1 className="mt-4 text-4xl sm:text-5xl">{creating ? "New project" : values.name || "Project"}</h1>

      {justCreated && (
        <p role="status" className="mt-4 border border-gold/40 p-4 text-sm text-gold">
          Project created as a draft. It is not public until you set its visibility to Published.
        </p>
      )}

      {!creating && (
        <section className={`${sectionClass} mt-8`}>
          <h2 className="text-2xl">Visibility</h2>
          <p className="text-sm text-mist">
            Only published projects appear on the website. Archived projects are hidden but kept.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <StateSelect
              id="project-state"
              value={state}
              disabled={stateStatus.kind === "saving"}
              onChange={(next) => void onStateChange(next)}
            />
            <p role="status" className="text-sm text-gold">
              {stateStatus.kind === "saved" && "Updated."}
              {stateStatus.kind === "error" && stateStatus.message}
            </p>
          </div>
          {state === "published" && (
            <Link to={`/projects/${slug}`} className="text-sm text-mist underline hover:text-gold">
              View on site
            </Link>
          )}
        </section>
      )}

      <form onSubmit={(e) => void onSave(e)} aria-label="Project details" className="mt-8 space-y-8">
        <section className={sectionClass}>
          <h2 className="text-2xl">Details</h2>

          {creating ? (
            <Field
              id="project-slug"
              label="Slug"
              hint={SLUG_HINT}
              value={slug}
              maxLength={60}
              onChange={setSlug}
            />
          ) : (
            <p className="text-sm text-mist">
              Page address: <span className="text-ivory">/projects/{slug}</span> (fixed)
            </p>
          )}

          <Field
            id="project-name"
            label="Name"
            value={values.name}
            maxLength={80}
            onChange={(v) => update("name", v)}
          />
          <Field
            id="project-category"
            label="Category"
            hint="For example Education Technology. Projects in the same category are grouped by the filter buttons."
            value={values.category}
            maxLength={60}
            onChange={(v) => update("category", v)}
          />

          <div>
            <label htmlFor="project-status" className="text-sm text-ivory/80">
              Status
            </label>
            <select
              id="project-status"
              value={values.status}
              onChange={(e) => update("status", e.target.value as ProjectStatus)}
              className={selectClass}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-relaxed text-mist">
              Shown publicly. Be honest: only choose Operational for something people can actually use.
            </p>
          </div>

          <Field
            id="project-summary"
            label="Summary"
            hint="Shown on project cards. Up to 500 characters."
            multiline
            rows={4}
            value={values.summary}
            maxLength={500}
            onChange={(v) => update("summary", v)}
          />
          <Field
            id="project-overview"
            label="Overview"
            hint="Shown on the project page. Up to 2000 characters."
            multiline
            rows={6}
            value={values.overview}
            maxLength={2000}
            onChange={(v) => update("overview", v)}
          />
          <Field
            id="project-status-note"
            label="Status note"
            hint="A short honest note about where the project stands."
            multiline
            rows={3}
            value={values.statusNote}
            maxLength={500}
            onChange={(v) => update("statusNote", v)}
          />
          <ImageUpload
            id="project-image"
            label="Screenshot"
            value={values.imageUrl}
            maxLength={500}
            onChange={(v) => update("imageUrl", v)}
          />
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl">Focus areas</h2>
          <p className="text-sm text-mist">Short phrases shown on the project page, in this order.</p>

          {values.focusAreas.length === 0 && <p className="text-sm text-mist">None yet.</p>}
          {values.focusAreas.map((area, index) => (
            <div key={index} className="space-y-2">
              <Field
                id={`focus-${index}`}
                label={`Focus area ${index + 1}`}
                value={area}
                maxLength={80}
                onChange={(v) =>
                  update(
                    "focusAreas",
                    values.focusAreas.map((item, i) => (i === index ? v : item)),
                  )
                }
              />
              <button
                type="button"
                className={smallButton}
                onClick={() =>
                  update(
                    "focusAreas",
                    values.focusAreas.filter((_, i) => i !== index),
                  )
                }
              >
                Remove focus area {index + 1}
              </button>
            </div>
          ))}

          <button
            type="button"
            disabled={values.focusAreas.length >= 12}
            onClick={() => update("focusAreas", [...values.focusAreas, ""])}
            className="border border-gold/60 px-5 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add a focus area
          </button>
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl">Links</h2>
          <p className="text-sm text-mist">Public links, for example a live website or a demo.</p>

          {values.links.length === 0 && <p className="text-sm text-mist">None yet.</p>}
          {values.links.map((link, index) => (
            <div key={index} className="space-y-4 border border-line p-4">
              <Field
                id={`link-label-${index}`}
                label="Label"
                placeholder="Visit website"
                value={link.label}
                maxLength={40}
                onChange={(v) =>
                  update(
                    "links",
                    values.links.map((item, i) => (i === index ? { ...item, label: v } : item)),
                  )
                }
              />
              <Field
                id={`link-url-${index}`}
                label="Web address"
                type="url"
                placeholder="https://"
                value={link.url}
                maxLength={500}
                onChange={(v) =>
                  update(
                    "links",
                    values.links.map((item, i) => (i === index ? { ...item, url: v } : item)),
                  )
                }
              />
              <button
                type="button"
                className={smallButton}
                onClick={() =>
                  update(
                    "links",
                    values.links.filter((_, i) => i !== index),
                  )
                }
              >
                Remove link {index + 1}
              </button>
            </div>
          ))}

          <button
            type="button"
            disabled={values.links.length >= 8}
            onClick={() => update("links", [...values.links, { label: "", url: "" }])}
            className="border border-gold/60 px-5 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add a link
          </button>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saveStatus.kind === "saving"}
            className="bg-gold px-6 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveStatus.kind === "saving" ? "Saving…" : creating ? "Create project" : "Save changes"}
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

export default function AdminProjectEdit() {
  const { id } = useParams();
  // The key restarts the editor when the address changes, for example after creating a project.
  return <ProjectEditor key={id ?? "new"} id={id} />;
}