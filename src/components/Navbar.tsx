import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { site } from "../data/site";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm tracking-wide transition-colors duration-300 hover:text-gold ${
    isActive ? "text-gold" : "text-ivory/80"
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {site.nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/contact"
            className="border border-gold/60 px-5 py-2 text-sm text-gold transition-colors duration-300 hover:bg-gold hover:text-canvas"
          >
            Contact
          </NavLink>
        </nav>

        <button
          type="button"
          className="p-2 text-ivory md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-line bg-canvas md:hidden" aria-label="Mobile">
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-4 sm:px-8">
            {[...site.nav, { label: "Contact", to: "/contact" }].map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={close}
                  className={({ isActive }) =>
                    `block border-b border-line/50 py-4 font-serif text-2xl ${
                      isActive ? "text-gold" : "text-ivory"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}