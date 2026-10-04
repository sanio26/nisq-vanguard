import { Menu, X } from "lucide-react";
import { useState } from "react";
import CopilotWidget from "./CopilotWidget";

const navigation = [
  { label: "Solutions", href: "/solutions" },
  { label: "Campus", href: "/campus" },
  { label: "Academy", href: "/academy" },
  { label: "Innovation", href: "/innovation" },
  { label: "Intelligence", href: "/intelligence" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a
            href="/"
            className="brand"
            aria-label="NISQ Vanguard home"
          >
            <span className="brand-mark">NV</span>

            <span className="brand-text">
              <strong>NISQ VANGUARD</strong>
              <small>DEFENCE TECHNOLOGIES</small>
            </span>
          </a>

          <nav
            className="desktop-nav"
            aria-label="Main navigation"
          >
            {navigation.map((item) => (
              <a
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href="/contact"
            className="header-cta"
          >
            BOOK A CONSULTATION <span>→</span>
          </a>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() =>
              setMobileOpen((current) => !current)
            }
            aria-label={
              mobileOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>

        {mobileOpen && (
          <nav
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            {navigation.map((item) => (
              <a
                href={item.href}
                key={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <a
              href="/contact"
              onClick={() => setMobileOpen(false)}
            >
              BOOK A CONSULTATION →
            </a>
          </nav>
        )}
      </header>

      <CopilotWidget />
    </>
  );
}