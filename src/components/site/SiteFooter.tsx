import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { CONTACT, NAV } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="ink-section">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo className="inline-flex rounded-[2px] bg-background px-3 py-2" />
            <p className="mt-5 text-[color:var(--color-ink-muted)]">
              An Australian telecommunication service provider, keeping retirement villages, aged
              care, hospitals and healthcare communities connected since 2004.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-10 gap-y-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink-foreground)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink-foreground)]"
            >
              Contact
            </Link>
          </nav>

          <div className="text-[color:var(--color-ink-muted)]">
            <p className="eyebrow text-[color:var(--color-ink-foreground)]">Talk to us</p>
            <a
              href={CONTACT.phoneHref}
              className="mt-3 block text-2xl font-semibold text-[color:var(--color-ink-foreground)]"
            >
              {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="mt-2 block hover:underline">
              {CONTACT.email}
            </a>
            <p className="mt-2 text-sm">{CONTACT.hours}</p>
          </div>
        </div>

        <div className="hairline-ink mt-12 flex flex-col gap-2 pt-6 text-sm text-[color:var(--color-ink-muted)] sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Acsess Health. All rights reserved.</p>
          <p>Proudly Australian owned and operated.</p>
        </div>
      </div>
    </footer>
  );
}
