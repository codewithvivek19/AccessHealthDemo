import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { CONTACT } from "@/lib/site";
import { Landscape } from "./Landscape";

export function SiteFooter() {
  return (
    <footer className="a-footer">
      <Landscape />
      <div className="a-footer-wash" />
      <div className="a-container a-footer-content">
        <div className="a-footer-invitation">
          <span className="a-label">A better connected tomorrow</span>
          <h2>
            Good connections.
            <br />
            Even better communities.
          </h2>
          <p>
            From the first site survey to everyday support.
            <br />
            Let’s build something that works for your people.
          </p>
          <Link to="/contact" className="a-button">
            Start a conversation{" "}
            <span>
              <ArrowUpRight size={20} />
            </span>
          </Link>
        </div>
        <div className="a-footer-grid">
          <div className="a-footer-brand">
            <Logo className="a-footer-logo" />
            <p>
              Australian telecommunications for the places people call home. Connecting retirement
              and care communities since 2004.
            </p>
            <a className="a-footer-phone" href={CONTACT.phoneHref}>
              {CONTACT.phone}
              <ArrowUpRight size={24} />
            </a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </div>
          <nav aria-label="Footer services">
            <h3>What we do</h3>
            <Link to="/services">Connected services</Link>
            <Link to="/retirement-living">Retirement living</Link>
            <Link to="/switchstar">SWITCH STAR</Link>
          </nav>
          <nav aria-label="Footer company">
            <h3>Get to know us</h3>
            <Link to="/about">About Acsess</Link>
            <Link to="/resources">News & resources</Link>
            <Link to="/contact">Contact us</Link>
          </nav>
          <nav aria-label="Footer help">
            <h3>Here to help</h3>
            <Link to="/support">Service support</Link>
            <Link to="/account">Your account</Link>
            <Link to="/account/support">Raise a request</Link>
            <p>{CONTACT.hours}</p>
          </nav>
        </div>
        <div className="a-footer-bottom">
          <p>© {new Date().getFullYear()} Acsess Health</p>
          <p>Proudly Australian owned & operated.</p>
          <a href="#main">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
