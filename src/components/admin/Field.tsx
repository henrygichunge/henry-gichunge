const inputClass =
  "mt-2 w-full border border-line bg-canvas px-4 py-3 text-ivory placeholder:text-mist/60 focus:border-gold";

export default function Field({
  id,
  label,
  value,
  onChange,
  hint,
  multiline = false,
  rows = 4,
  type = "text",
  maxLength,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  type?: "text" | "email" | "url" | "tel";
  maxLength?: number;
  autoComplete?: string;
  placeholder?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="text-sm text-ivory/80">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-describedby={hintId}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          maxLength={maxLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-describedby={hintId}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
      {hint && (
        <p id={hintId} className="mt-2 text-xs leading-relaxed text-mist">
          {hint}
        </p>
      )}
    </div>
  );
}