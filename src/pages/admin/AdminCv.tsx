import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Navigate } from "react-router-dom";
import { Container } from "../../components/ui";
import PageLoader from "../../components/PageLoader";
import { getCv, saveCv, uploadCv } from "../../lib/documents";
import { describeFailure } from "../../lib/adminProjects";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signedOut" }
  | { kind: "error"; message: string };

type Status =
  | { kind: "idle" }
  | { kind: "working"; text: string }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

const buttonClass =
  "border border-gold/60 px-5 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminCv() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    let active = true;
    void getCv().then((result) => {
      if (!active) return;
      if (result.ok) {
        setUrl(result.data.url);
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

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setStatus({ kind: "working", text: "Uploading…" });
    const uploaded = await uploadCv(file);
    if (!uploaded.ok) {
      setStatus({ kind: "error", message: uploaded.message });
      return;
    }

    setStatus({ kind: "working", text: "Saving…" });
    const saved = await saveCv(uploaded.url);
    if (saved.ok) {
      setUrl(uploaded.url);
      setStatus({
        kind: "done",
        message: "CV uploaded and saved. The CV page updates within a minute or two.",
      });
    } else {
      setStatus({ kind: "error", message: describeFailure(saved.status, saved.message) });
    }
  }

  async function onRemove() {
    if (!window.confirm("Remove the CV from the website? The file stays in Cloudinary.")) return;

    setStatus({ kind: "working", text: "Removing…" });
    const saved = await saveCv("");
    if (saved.ok) {
      setUrl("");
      setStatus({ kind: "done", message: "CV removed. The CV page updates within a minute or two." });
    } else {
      setStatus({ kind: "error", message: describeFailure(saved.status, saved.message) });
    }
  }

  if (load.kind === "loading") return <PageLoader />;
  if (load.kind === "signedOut") return <Navigate to="/admin/login" replace />;
  if (load.kind === "error") {
    return (
      <Container className="max-w-3xl py-16 sm:py-24">
        <h1 className="text-4xl">CV</h1>
        <p className="mt-6 border border-dashed border-gold-deep p-4 text-sm text-mist">{load.message}</p>
      </Container>
    );
  }

  const working = status.kind === "working";

  return (
    <Container className="max-w-3xl py-12 sm:py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Admin</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">CV</h1>
      <p className="mt-4 text-sm leading-relaxed text-mist">
        Upload your CV as a PDF, up to 5 MB. It becomes the download button on the CV page. The file is
        public: anyone with its link can open it, so leave out your home address and anything private.
      </p>

      <section className="mt-8 space-y-5 border border-line bg-surface/40 p-6">
        <h2 className="text-2xl">Current CV</h2>

        {url ? (
          <p className="text-sm text-mist">
            A CV is published.{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline transition-colors hover:text-ivory"
            >
              Open it
            </a>
          </p>
        ) : (
          <p className="text-sm text-mist">
            No CV is published, so the download button on the CV page is switched off.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={working}
            onClick={() => inputRef.current?.click()}
            className={buttonClass}
          >
            {status.kind === "working" ? status.text : url ? "Replace PDF" : "Upload PDF"}
          </button>
          {url && (
            <button
              type="button"
              disabled={working}
              onClick={() => void onRemove()}
              className="text-sm text-mist underline transition-colors hover:text-gold disabled:opacity-50"
            >
              Remove CV
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            aria-label="Choose a PDF file"
            onChange={(e) => void onPick(e)}
          />
        </div>

        <p role="status" className="text-sm text-gold">
          {status.kind === "done" && status.message}
          {status.kind === "error" && status.message}
        </p>
      </section>
    </Container>
  );
}