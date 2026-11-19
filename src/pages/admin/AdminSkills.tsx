import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import Field from "../../components/admin/Field";
import { getSkills, saveSkills, type SkillGroupValues } from "../../lib/adminBackground";
import { describeFailure } from "../../lib/adminProjects";
import { skillGroups as builtInSkills } from "../../data/content";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signedOut" }
  | { kind: "error"; message: string };

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

const MAX_GROUPS = 8;
const MAX_SKILLS = 15;

const inputClass = "w-full border border-line bg-canvas px-3 py-2 text-ivory focus:border-gold";
const smallButton = "text-sm text-mist underline transition-colors hover:text-gold";
const outlineButton =
  "border border-gold/60 px-5 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminSkills() {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [groups, setGroups] = useState<SkillGroupValues[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    let active = true;
    void getSkills().then((result) => {
      if (!active) return;
      if (result.ok) {
        setGroups(result.data.groups);
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

  function setGroupTitle(groupIndex: number, title: string) {
    setGroups((list) => list.map((g, i) => (i === groupIndex ? { ...g, title } : g)));
  }

  function setSkill(groupIndex: number, skillIndex: number, value: string) {
    setGroups((list) =>
      list.map((g, i) =>
        i === groupIndex ? { ...g, items: g.items.map((s, j) => (j === skillIndex ? value : s)) } : g,
      ),
    );
  }

  function addSkill(groupIndex: number) {
    setGroups((list) => list.map((g, i) => (i === groupIndex ? { ...g, items: [...g.items, ""] } : g)));
  }

  function removeSkill(groupIndex: number, skillIndex: number) {
    setGroups((list) =>
      list.map((g, i) =>
        i === groupIndex ? { ...g, items: g.items.filter((_, j) => j !== skillIndex) } : g,
      ),
    );
  }

  function addGroup() {
    setGroups((list) => [...list, { title: "", items: [""] }]);
  }

  function removeGroup(groupIndex: number) {
    setGroups((list) => list.filter((_, i) => i !== groupIndex));
  }

  function startFromWebsite() {
    setGroups(builtInSkills.map((g) => ({ title: g.title, items: [...g.items] })));
    setStatus({ kind: "idle" });
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setStatus({ kind: "saving" });
    const result = await saveSkills(groups);
    if (result.ok) {
      setStatus({ kind: "saved" });
    } else {
      setStatus({ kind: "error", message: describeFailure(result.status, result.message) });
    }
  }

  if (load.kind === "loading") return <PageLoader />;
  if (load.kind === "signedOut") return <Navigate to="/admin/login" replace />;
  if (load.kind === "error") {
    return (
      <Container className="max-w-3xl py-16 sm:py-24">
        <h1 className="text-4xl">Skills</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">{load.message}</p>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Admin</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Skills</h1>
      <p className="mt-4 text-sm leading-relaxed text-mist">
        Shown on the About and CV pages as groups of short skill names. Saving replaces the whole list. A
        group with no skills is hidden on the website. If you save an empty list, the website goes back to
        its built-in sample skills.
      </p>

      {groups.length === 0 && (
        <div className="mt-6 space-y-4 border border-dashed border-gold-deep p-5">
          <p className="text-sm text-mist">
            No skills are saved yet, so the website currently shows built-in sample skills written as a
            draft. Copy them here to correct them, or add your own from scratch.
          </p>
          <button type="button" onClick={startFromWebsite} className={outlineButton}>
            Start from the website&rsquo;s current skills
          </button>
        </div>
      )}

      <form onSubmit={(e) => void onSave(e)} aria-label="Skills" className="mt-8 space-y-6">
        {groups.map((group, groupIndex) => (
          <section key={groupIndex} className="space-y-4 border border-line bg-surface/40 p-6">
            <Field
              id={`group-title-${groupIndex}`}
              label={`Group ${groupIndex + 1} title`}
              placeholder="Technology"
              value={group.title}
              maxLength={40}
              onChange={(v) => setGroupTitle(groupIndex, v)}
            />

            <ul className="space-y-3">
              {group.items.map((skill, skillIndex) => (
                <li key={skillIndex} className="flex items-center gap-3">
                  <input
                    type="text"
                    aria-label={`Group ${groupIndex + 1} skill ${skillIndex + 1}`}
                    value={skill}
                    maxLength={40}
                    onChange={(e) => setSkill(groupIndex, skillIndex, e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    aria-label={`Remove skill ${skillIndex + 1} from group ${groupIndex + 1}`}
                    onClick={() => removeSkill(groupIndex, skillIndex)}
                    className={smallButton}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                disabled={group.items.length >= MAX_SKILLS}
                onClick={() => addSkill(groupIndex)}
                className={outlineButton}
              >
                Add a skill
              </button>
              <button type="button" onClick={() => removeGroup(groupIndex)} className={smallButton}>
                Remove group {groupIndex + 1}
              </button>
            </div>
          </section>
        ))}

        <button
          type="button"
          disabled={groups.length >= MAX_GROUPS}
          onClick={addGroup}
          className={outlineButton}
        >
          Add a group
        </button>

        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <button
            type="submit"
            disabled={status.kind === "saving"}
            className="bg-gold px-6 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.kind === "saving" ? "Saving…" : "Save skills"}
          </button>
          <p role="status" className="text-sm text-gold">
            {status.kind === "saved" && "Saved. The public site updates within a minute or two."}
            {status.kind === "error" && status.message}
          </p>
        </div>
      </form>
    </Container>
  );
}