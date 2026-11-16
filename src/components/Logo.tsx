import { Link } from "react-router-dom";

export function Monogram({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="HG monogram">
      <rect x="2" y="2" width="60" height="60" rx="4" className="fill-canvas stroke-gold" strokeWidth="1.5" />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="600"
        className="fill-ivory"
      >
        H<tspan className="fill-gold">G</tspan>
      </text>
    </svg>
  );
}

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Henry Gichunge — home">
      <Monogram />
      <span className="hidden font-serif text-xl tracking-wide sm:block">Henry Gichunge</span>
    </Link>
  );
}