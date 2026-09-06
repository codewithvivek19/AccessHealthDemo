import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { NAV } from "@/lib/site";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const ctaTo = session ? "/account" : "/auth";
  const ctaLabel = session ? "My account" : "Sign in";

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-brand-cream/90 shadow-sm backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:bg-brand-dark focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative flex h-16 items-center md:h-20">
          {/* Desktop left links */}
          <nav
            aria-label="Main"
            className="animate-fade-down stagger-1 hidden items-center gap-8 xl:flex"
          >
            {NAV.slice(0, 3).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm tracking-wide whitespace-nowrap text-brand-dark uppercase transition-opacity hover:opacity-70"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Centered logo */}
          <div className="animate-fade-down stagger-2 absolute left-1/2 -translate-x-1/2">
            <Logo />
          </div>

          {/* Desktop right links + CTA */}
          <div className="animate-fade-down stagger-3 ml-auto hidden items-center gap-8 xl:flex">
            {NAV.slice(3).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm tracking-wide whitespace-nowrap text-brand-dark uppercase transition-opacity hover:opacity-70"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={ctaTo}
              className="inline-flex items-center rounded-full bg-brand-dark px-5 py-2.5 text-sm tracking-wide text-white uppercase transition-colors hover:bg-brand-green"
            >
              {ctaLabel}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="relative z-50 ml-auto flex h-10 w-10 flex-col items-center justify-center gap-0 xl:hidden"
          >
            <span
              aria-hidden
              className={`absolute top-[12px] h-[2px] w-6 rounded bg-brand-dark transition-all duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${
                open ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              aria-hidden
              className={`absolute top-[19px] h-[2px] w-6 rounded bg-brand-dark transition-all duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${
                open ? "-translate-y-[2px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-brand-cream transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] xl:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav
          aria-label="Mobile"
          className={`flex h-full flex-col items-center justify-center gap-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-y-0 opacity-100 delay-100" : "-translate-y-8 opacity-0"
          }`}
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="text-3xl tracking-tight text-brand-dark"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to={ctaTo}
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex items-center rounded-full bg-brand-dark px-8 py-3.5 text-lg tracking-wide text-white"
          >
            {ctaLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
