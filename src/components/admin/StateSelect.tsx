import type { ContentState } from "../../lib/adminProjects";

const options: { value: ContentState; label: string }[] = [
  { value: "draft", label: "Draft (hidden)" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived (hidden)" },
];

export default function StateSelect({
  id,
  value,
  onChange,
  disabled = false,
  label = "Visibility",
}: {
  id: string;
  value: ContentState;
  onChange: (value: ContentState) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <select
      id={id}
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as ContentState)}
      className="border border-line bg-canvas px-3 py-2 text-sm text-ivory focus:border-gold disabled:opacity-60"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}