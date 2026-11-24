import { Link } from "react-router-dom";
import { Container } from "./ui";
import { Monogram } from "./Logo";
import ConnectLinks from "./ConnectLinks";
import { site } from "../data/site";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface/40">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Monogram size={44} />
            <p className="mt-5 font-serif text-2xl">{site.name}</p>
            <p className="mt-2 text-sm text-gold">{site.taglineWords.join(". ")}.</p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-mist">
              {[...site.nav, { label: "Contact", to: "/contact" }].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="transition-colors hover:text-gold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <ConnectLinks label="Connect" />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-mist sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.fullName}. All rights reserved.
          </p>
          <p>{site.domain}</p>
        </div>
      </Container>
    </footer>
  );
}