import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
      <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">{title}</h2>
      {intro && <p className="mt-5 leading-relaxed text-mist">{intro}</p>}
    </div>
  );
}

export function ButtonLink({
  to,
  children,
  variant = "primary",
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-300";
  const styles =
    variant === "primary"
      ? "bg-gold text-canvas hover:bg-ivory"
      : "border border-gold/50 text-ivory hover:border-gold hover:text-gold";
  return (
    <Link to={to} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}