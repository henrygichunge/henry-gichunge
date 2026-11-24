interface PortraitProps {
  src?: string;
  alt: string;
}

/** Cloudinary pictures are requested at a size that suits the page, so phones download less. */
function sized(src: string, width: number): string {
  return src.replace("/image/upload/f_auto,q_auto/", `/image/upload/f_auto,q_auto,w_${width}/`);
}

/** Fills whatever width its parent gives it. */
export default function Portrait({ src, alt }: PortraitProps) {
  return (
    // The wrapper reserves room on the right and bottom so the offset frame never overflows the screen.
    <div className="w-full pb-2 pr-2 sm:pb-3 sm:pr-3">
      <div className="relative">
        <div
          className="absolute inset-0 translate-x-2 translate-y-2 border border-gold-deep/60 sm:translate-x-3 sm:translate-y-3"
          aria-hidden="true"
        />
        <div className="relative aspect-[4/5] overflow-hidden border border-gold/40 bg-surface">
          {src ? (
            <img
              src={sized(src, 700)}
              alt={alt}
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
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
    </div>
  );
}