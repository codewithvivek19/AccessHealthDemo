import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="a-page-hero">
      <div className="a-container">
        <Reveal>
          {eyebrow && <p className="a-label">{eyebrow}</p>}
          <h1>{title}</h1>
          {intro && <p className="a-page-intro">{intro}</p>}
          {children && <div className="a-page-actions">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}
export function Section({
  children,
  className = "",
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section className={`a-section ${muted ? "a-section-muted" : ""} ${className}`}>
      <div className="a-container">{children}</div>
    </section>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <Reveal className="a-section-heading">
      {eyebrow && <p className="a-label">{eyebrow}</p>}
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
    </Reveal>
  );
}
