import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import Field from "../../components/admin/Field";
import {
  getProfile,
  saveContact,
  saveProfile,
  saveSocials,
  type AdminContact,
  type AdminProfile as ProfileValues,
  type AdminSocial,
  type ApiResult,
} from "../../lib/adminData";

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signedOut" }
  | { kind: "error"; message: string };

const IDLE: Status = { kind: "idle" };
const MAX_SOCIALS = 10;

function Card({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <section className="border border-line bg-surface/40 p-6">
      <h2 className="text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-mist">{intro}</p>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function SaveBar({ status }: { status: Status }) {
  return (
    <div className="flex flex-wrap items-center gap-4 pt-2">
      <button
        type="submit"
        disabled={status.kind === "saving"}
        className="bg-gold px-6 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.kind === "saving" ? "Saving…" : "Save"}
      </button>
      <p role="status" className="text-sm">
        {status.kind === "saved" && <span className="text-gold">Saved. The public site updates within a minute or two.</span>}
        {status.kind === "error" && <span className="text-gold">{status.message}</span>}
      </p>
    </div>
  );
}

export default function AdminProfile() {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [profile, setProfile] = useState<ProfileValues>({
    fullName: "",
    intro: "",
    biography: "",
    mission: "",
    portraitUrl: "",
  });
  const [contact, setContact] = useState<AdminContact>({ email: "", phone: "", location: "" });
  const [socials, setSocials] = useState<AdminSocial[]>([]);

  const [profileStatus, setProfileStatus] = useState<Status>(IDLE);
  const [contactStatus, setContactStatus] = useState<Status>(IDLE);
  const [socialsStatus, setSocialsStatus] = useState<Status>(IDLE);

  useEffect(() => {
    let active = true;
    void getProfile().then((result) => {
      if (!active) return;
      if (result.ok) {
        setProfile(result.data.profile);
        setContact(result.data.contact);
        setSocials(result.data.socials);
        setLoad({ kind: "ready" });
      } else if (result.status === 401) {
        setLoad({ kind: "signedOut" });
      } else if (result.status === 503) {
        setLoad({
          kind: "error",
          message: "The admin service is not available here. It works only on the live site.",
        });
      } else {
        setLoad({ kind: "error", message: result.message });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function submit(
    event: FormEvent,
    save: () => Promise<ApiResult<unknown>>,
    setStatus: (status: Status) => void,
  ) {
    event.preventDefault();
    setStatus({ kind: "saving" });
    const result = await save();
    if (result.ok) {
      setStatus({ kind: "saved" });
    } else if (result.status === 401) {
      setStatus({ kind: "error", message: "Your session has expired. Please sign in again." });
    } else {
      setStatus({ kind: "error", message: result.message });
    }
  }

  if (load.kind === "loading") return <PageLoader />;
  if (load.kind === "signedOut") return <Navigate to="/admin/login" replace />;
  if (load.kind === "error") {
    return (
      <Container className="max-w-3xl py-16 sm:py-24">
        <h1 className="text-4xl">Profile</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">{load.message}</p>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Admin</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Profile and contact</h1>

      <div className="mt-10 space-y-8">
        <form
          onSubmit={(e) => void submit(e, () => saveProfile(profile), setProfileStatus)}
          aria-label="Website profile"
        >
          <Card
            title="Website profile"
            intro="Shown on the homepage, About page and CV page."
          >
            <Field
              id="profile-full-name"
              label="Full name"
              hint="Used as the title of the CV page."
              value={profile.fullName}
              maxLength={120}
              onChange={(v) => setProfile((p) => ({ ...p, fullName: v }))}
            />
            <Field
              id="profile-intro"
              label="Introduction"
              hint="Shown under your name on the homepage. Up to 600 characters."
              multiline
              rows={4}
              value={profile.intro}
              maxLength={600}
              onChange={(v) => setProfile((p) => ({ ...p, intro: v }))}
            />
            <Field
              id="profile-biography"
              label="Biography"
              hint="Separate paragraphs with a blank line. Shown on the About page and homepage."
              multiline
              rows={10}
              value={profile.biography}
              maxLength={8000}
              onChange={(v) => setProfile((p) => ({ ...p, biography: v }))}
            />
            <Field
              id="profile-mission"
              label="Personal mission"
              hint="One or two sentences, shown on the About page."
              multiline
              rows={3}
              value={profile.mission}
              maxLength={500}
              onChange={(v) => setProfile((p) => ({ ...p, mission: v }))}
            />
            <Field
              id="profile-portrait"
              label="Portrait address"
              type="url"
              hint="A web address starting with https://, or leave empty for the placeholder. Photo uploads come in a later batch."
              value={profile.portraitUrl}
              maxLength={500}
              onChange={(v) => setProfile((p) => ({ ...p, portraitUrl: v }))}
            />
            <SaveBar status={profileStatus} />
          </Card>
        </form>

        <form
          onSubmit={(e) => void submit(e, () => saveContact(contact), setContactStatus)}
          aria-label="Contact details"
        >
          <Card
            title="Contact details"
            intro="Shown publicly on the Contact page. Leave a field empty to show &quot;To be added&quot;."
          >
            <Field
              id="contact-email"
              label="Email"
              type="email"
              autoComplete="off"
              value={contact.email}
              maxLength={254}
              onChange={(v) => setContact((c) => ({ ...c, email: v }))}
            />
            <Field
              id="contact-phone"
              label="Phone"
              type="tel"
              autoComplete="off"
              value={contact.phone}
              maxLength={40}
              onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
            />
            <Field
              id="contact-location"
              label="Location"
              autoComplete="off"
              value={contact.location}
              maxLength={120}
              onChange={(v) => setContact((c) => ({ ...c, location: v }))}
            />
            <SaveBar status={contactStatus} />
          </Card>
        </form>

        <form
          onSubmit={(e) => void submit(e, () => saveSocials(socials), setSocialsStatus)}
          aria-label="Social links"
        >
          <Card
            title="Social links"
            intro="Shown on the Contact page. The order here is the order shown. Saving replaces the whole list."
          >
            {socials.length === 0 && <p className="text-sm text-mist">No social links yet.</p>}

            {socials.map((social, index) => (
              <div key={index} className="space-y-4 border border-line p-4">
                <Field
                  id={`social-label-${index}`}
                  label="Label"
                  placeholder="LinkedIn"
                  value={social.label}
                  maxLength={40}
                  onChange={(v) =>
                    setSocials((list) => list.map((s, i) => (i === index ? { ...s, label: v } : s)))
                  }
                />
                <Field
                  id={`social-url-${index}`}
                  label="Web address"
                  type="url"
                  placeholder="https://"
                  value={social.url}
                  maxLength={500}
                  onChange={(v) =>
                    setSocials((list) => list.map((s, i) => (i === index ? { ...s, url: v } : s)))
                  }
                />
                <button
                  type="button"
                  onClick={() => setSocials((list) => list.filter((_, i) => i !== index))}
                  className="text-sm text-mist underline transition-colors hover:text-gold"
                >
                  Remove this link
                </button>
              </div>
            ))}

            <button
              type="button"
              disabled={socials.length >= MAX_SOCIALS}
              onClick={() => setSocials((list) => [...list, { label: "", url: "" }])}
              className="border border-gold/60 px-5 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add a link
            </button>

            <SaveBar status={socialsStatus} />
          </Card>
        </form>
      </div>
    </Container>
  );
}