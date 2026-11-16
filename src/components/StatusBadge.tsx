import type { ProjectStatus } from "../data/site";

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const live = status === "Operational";
  return (
    <span
      className={`inline-block px-3 py-1 text-[11px] font-medium uppercase tracking-widest ${
        live ? "bg-gold text-canvas" : "border border-gold/50 text-gold"
      }`}
    >
      {status}
    </span>
  );
}