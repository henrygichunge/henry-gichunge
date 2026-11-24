import { ArrowUpRight, Mail } from "lucide-react";
import { useSite } from "../hooks/useSiteContent";

const chip =
  "inline-flex items-center gap-1.5 border border-line px-3 py-1.5 text-xs tracking-wide text-ivory/80 transition-colors duration-300 hover:border-gold/60 hover:text-gold";

/** Your email and social links, from the admin. Shows nothing until at least one is saved. */
export default function ConnectLinks({
  className = "",
  label = "Connect",
}: {
  className?: string;
  label?: string;
}) {
  const { data } = useSite();
  const email = data?.contact.email ?? "";
  const socials = data?.socials ?? [];

  if (!email && socials.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="mr-1 text-[11px] uppercase tracking-[0.2em] text-mist">{label}</span>
      {email && (
        <a href={`mailto:${email}`} className={chip}>
          <Mail size={13} aria-hidden="true" /> Email
        </a>
      )}
      {socials.map((social) => (
        <a
          key={social.url}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={chip}
        >
          {social.label}
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}