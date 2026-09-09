import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu } from "lucide-react";
import { Logo } from "./Logo";
import { NAV } from "@/lib/site";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { session } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const accountTo = session ? "/account" : "/auth";
  return (
    <header className={`a-header ${scrolled ? "a-header-scrolled" : ""}`}>
      <a href="#main" className="a-skip">
        Skip to content
      </a>
      <div className="a-header-inner">
        <Logo className="a-logo" />
        <nav className="a-desktop-nav" aria-label="Main navigation">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={pathname.startsWith(item.to) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="a-header-actions">
          <Link to={accountTo} className="a-account-link">
            {session ? "My account" : "Sign in"}
          </Link>
          <Link to="/contact" className="a-button a-button-small">
            Let’s talk{" "}
            <span>
              <ArrowUpRight size={18} />
            </span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="a-menu-button" aria-label="Open navigation">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent className="a-mobile-menu">
              <SheetTitle>Explore Acsess</SheetTitle>
              <SheetDescription>Connectivity for your community.</SheetDescription>
              <nav aria-label="Mobile navigation">
                {NAV.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                    {item.label}
                    <ArrowUpRight size={20} />
                  </Link>
                ))}
                <Link to="/contact" onClick={() => setOpen(false)}>
                  Contact us
                  <ArrowUpRight size={20} />
                </Link>
                <Link to={accountTo} onClick={() => setOpen(false)}>
                  {session ? "My account" : "Sign in"}
                  <ArrowUpRight size={20} />
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
