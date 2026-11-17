export function CardGridSkeleton({
  count = 3,
  label = "Loading",
}: {
  count?: number;
  label?: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-80 animate-pulse border border-line bg-surface/40" aria-hidden="true" />
      ))}
    </div>
  );
}

export function TextSkeleton({
  lines = 3,
  label = "Loading",
  className = "",
}: {
  lines?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-4 animate-pulse bg-line/60 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}