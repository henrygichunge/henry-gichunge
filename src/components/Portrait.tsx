interface PortraitProps {
  src?: string;
  alt: string;
}

export default function Portrait({ src, alt }: PortraitProps) {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <div className="absolute inset-0 translate-x-4 translate-y-4 border border-gold-deep/60" aria-hidden="true" />
      <div className="relative aspect-[4/5] overflow-hidden border border-gold/40 bg-surface">
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 400 500" className="h-full w-full" role="img" aria-label="Portrait placeholder">
            <circle cx="200" cy="190" r="72" className="fill-line" />
            <path d="M60 500c0-95 62-150 140-150s140 55 140 150z" className="fill-line" />
            <text x="200" y="470" textAnchor="middle" fontSize="13" letterSpacing="3" className="fill-mist">
              PHOTO PLACEHOLDER
            </text>
          </svg>
        )}
      </div>
    </div>
  );
}