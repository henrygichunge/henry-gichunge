export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-gold"
        aria-hidden="true"
      />
      <span className="sr-only">Loading page</span>
    </div>
  );
}