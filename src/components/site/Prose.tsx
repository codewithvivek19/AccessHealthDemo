import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { ShaderBackground } from "./ShaderBackground";

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
    <section className="relative overflow-hidden border-b border-border bg-[#03120e]">
      <ShaderBackground className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative mx-auto max-w-[1600px] px-5 py-20 lg:px-10 lg:py-28">
        <Reveal className="max-w-4xl">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8fe8b6]">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-6 text-[2.6rem] font-light leading-[1.03] tracking-[-0.03em] text-ink-foreground sm:text-6xl lg:text-[4.5rem]">
            {title}
          </h1>
          {intro && (
            <p className="mt-7 max-w-2xl text-xl leading-relaxed text-ink-muted">{intro}</p>
          )}
          {children && <div className="mt-9">{children}</div>}
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
    <section className={`${muted ? "bg-secondary" : "bg-background"} ${className}`}>
      <div className="mx-auto max-w-[1600px] px-5 py-20 lg:px-10 lg:py-28">{children}</div>
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
    <Reveal className="max-w-3xl">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      )}
      <h2 className="mt-5 text-[2rem] font-light leading-[1.08] tracking-[-0.03em] sm:text-5xl">
        {title}
      </h2>
      {intro && <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{intro}</p>}
    </Reveal>
  );
}
