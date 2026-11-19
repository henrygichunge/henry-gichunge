import { useRef, useState, type ChangeEvent } from "react";
import Field from "./Field";
import { uploadImage } from "../../lib/media";

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done" }
  | { kind: "error"; message: string };

const buttonClass =
  "border border-gold/60 px-5 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold disabled:cursor-not-allowed disabled:opacity-50";

export default function ImageUpload({
  id,
  label,
  value,
  onChange,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  /** Accepted so this can replace a plain Field; the text shown below is used instead. */
  hint?: string;
  type?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [previewFailed, setPreviewFailed] = useState(false);

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setStatus({ kind: "working" });
    const result = await uploadImage(file);
    if (result.ok) {
      setPreviewFailed(false);
      onChange(result.url);
      setStatus({ kind: "done" });
    } else {
      setStatus({ kind: "error", message: result.message });
    }
  }

  return (
    <div className="space-y-3">
      <Field
        id={id}
        label={label}
        type="url"
        hint="Upload a photo below, or paste a web address starting with https://. Uploading does not save the page: tap Save afterwards."
        value={value}
        maxLength={maxLength}
        onChange={(v) => {
          setPreviewFailed(false);
          onChange(v);
        }}
      />

      {value && !previewFailed && (
        <img
          src={value}
          alt=""
          onError={() => setPreviewFailed(true)}
          className="max-h-48 w-auto max-w-full border border-line object-contain"
        />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={status.kind === "working"}
          onClick={() => inputRef.current?.click()}
          className={buttonClass}
        >
          {status.kind === "working" ? "Uploading…" : "Upload image"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              setStatus({ kind: "idle" });
              onChange("");
            }}
            className="text-sm text-mist underline transition-colors hover:text-gold"
          >
            Remove image
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          aria-label={`${label}: choose a file`}
          onChange={(e) => void onPick(e)}
        />
      </div>

      <p role="status" className="text-sm text-gold">
        {status.kind === "done" && "Uploaded. Tap Save to publish it."}
        {status.kind === "error" && status.message}
      </p>
    </div>
  );
}