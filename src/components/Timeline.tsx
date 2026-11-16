import type { TimelineItem } from "../data/content";

export default function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-mist">Nothing to show yet.</p>;
  }

  return (
    <ol className="space-y-10 border-l border-gold-deep/50 pl-8">
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`} className="relative">
          <span
            className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full border border-gold bg-canvas"
            aria-hidden="true"
          />
          <p className="text-xs uppercase tracking-[0.25em] text-gold">{item.period}</p>
          <h3 className="mt-2 text-2xl">{item.title}</h3>
          <p className="mt-1 text-sm text-ivory/70">{item.organisation}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">{item.description}</p>
          {item.placeholder && (
            <span className="mt-3 inline-block border border-dashed border-gold-deep px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold-deep">
              Placeholder
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}