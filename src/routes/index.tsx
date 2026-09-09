import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { servicesQuery, resourcesQuery, type Service } from "@/lib/content.functions";
import { Section, SectionHeading } from "@/components/site/Prose";
import { Reveal } from "@/components/site/Reveal";
import { MEDIA } from "@/lib/media";
import bentoInternet from "@/assets/site/bento-internet.jpg";
import bentoTv from "@/assets/site/bento-tv.jpg";
import bentoPhone from "@/assets/site/bento-phone.jpg";
import bentoThermal from "@/assets/site/bento-thermal.jpg";
import bentoMobile from "@/assets/site/bento-mobile.jpg";
import bentoFace from "@/assets/site/bento-face.jpg";

const BENTO_IMAGES: Record<string, string> = {
  "village-internet": bentoInternet,
  "matv-foxtel": bentoTv,
  telephone: bentoPhone,
  "thermal-imaging": bentoThermal,
  "das-mobile-coverage": bentoMobile,
  "facial-recognition": bentoFace,
};

function BentoCard({
  service,
  image,
  large = false,
}: {
  service: Service;
  image?: string | undefined;
  large?: boolean;
}) {
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="group relative flex h-full flex-col justify-end overflow-hidden rounded-2xl bg-[#07100c] ring-1 ring-white/10"
    >
      <div className={large ? "aspect-[16/10] w-full" : "aspect-[4/5] w-full"}>
        {image && (
          <img
            src={image}
            alt=""
            loading="lazy"
            aria-hidden
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent p-6 pt-16">
        <p className="text-xs uppercase tracking-[0.18em] text-[#8fe8b6]">{service.category}</p>
        <h3 className="mt-1.5 text-lg font-medium text-white sm:text-xl">{service.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">{service.summary}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#8fe8b6]">
          Learn more
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acsess Health — Connectivity for retirement living communities" },
      {
        name: "description",
        content:
          "Acsess Health designs, builds and supports internet, TV, telephone and safety technology for Australian retirement villages, aged care and healthcare communities.",
      },
      { property: "og:title", content: "Acsess Health — Connectivity for retirement living" },
      {
        property: "og:description",
        content:
          "Internet, Foxtel and MATV, telephone, mobile coverage and safety technology for Australian retirement and care communities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(resourcesQuery),
    ]),
  component: Home,
});

const FOCUS = [
  {
    title: "One network, whole village",
    points: [
      "Resident internet and village Wi-Fi",
      "Television, telephone and back-of-house",
      "A single managed design",
      "One number when something breaks",
    ],
  },
  {
    title: "Built for care settings",
    points: [
      "Independent living and aged care",
      "Hospitals and healthcare campuses",
      "Reliability first, jargon last",
      "Staged works, residents stay online",
    ],
  },
  {
    title: "Supported by real people",
    points: [
      "Australian help desk",
      "Resident-friendly explanations",
      "Village manager escalation",
      "Proactive network monitoring",
    ],
  },
  {
    title: "Operator-grade visibility",
    points: [
      "Services listed per village",
      "Support requests and history",
      "Documents in one place",
      "Clear monthly reporting",
    ],
  },
];

const STEPS = [
  ["Site survey", "We walk the village and map coverage, cabling, risers and existing services."],
  ["Design and quote", "A clear plan covering resident services, common areas and back-of-house."],
  ["Install", "Staged works that keep residents connected throughout."],
  ["Support", "Ongoing monitoring, resident help desk and operator reporting."],
];

const TESTIMONIALS = [
  {
    quote:
      "One number to call for internet, TV and phones — and they actually answer. It has taken a real load off our team.",
    name: "Village manager",
    handle: "Retirement community, QLD",
  },
  {
    quote:
      "The internet just works, and when my phone line needed a hand, someone was onto it the same day.",
    name: "Resident",
    handle: "Acsess-connected village",
  },
  {
    quote:
      "Having a single contractor responsible for everything — from the cable in the ground to the handset on the wall — made commissioning so much simpler.",
    name: "Village developer",
    handle: "New development, NSW",
  },
];

function Home() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: resources } = useSuspenseQuery(resourcesQuery);
  const newsItems = (resources ?? []).filter((r) => r.kind !== "faq").slice(0, 3);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative -mt-16 h-screen min-h-[700px] w-full overflow-hidden bg-brand-cream md:-mt-20">
        <div className="absolute inset-0">
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260820_010308_b1636845-4c15-4ab6-b0c9-9a29bfb0c6e3.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover object-bottom"
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start px-6 pt-28 md:pt-36 lg:px-8">
          <Link
            to="/contact"
            className="animate-fade-up stagger-3 mb-5 inline-flex items-center gap-2 rounded-full border border-brand-dark/15 bg-white/60 px-4 py-2 backdrop-blur-sm transition-colors hover:bg-white/80 md:mb-6"
          >
            <span className="text-sm text-brand-dark">
              Proudly Australian-owned — connecting communities since 2004.
            </span>
            <ArrowRight className="size-3.5 text-brand-dark" aria-hidden />
          </Link>

          <h1 className="animate-fade-up stagger-4 max-w-4xl text-left font-helvetica-neue text-3xl leading-[1.05] tracking-tight text-brand-dark sm:text-4xl md:text-5xl lg:text-6xl">
            Connectivity retirement communities
            <br className="hidden sm:block" /> can rely on.
          </h1>

          <div className="animate-fade-up stagger-5 mt-8 w-full md:mt-10">
            <p className="mb-6 text-left font-helvetica-neue text-xs uppercase tracking-[0.25em] text-brand-dark/50 md:mb-8">
              Backed by
            </p>
            <div className="animate-fade-up stagger-6 flex flex-wrap items-center justify-start gap-6 md:gap-12 lg:gap-16">
              <span className="font-playfair text-lg whitespace-nowrap text-brand-dark/80 md:text-xl lg:text-2xl">
                Foxtel
              </span>
              <span className="font-oswald text-lg uppercase whitespace-nowrap text-brand-dark/80 md:text-xl lg:text-2xl">
                Telstra
              </span>
              <span className="font-montserrat text-lg whitespace-nowrap text-brand-dark/80 md:text-xl lg:text-2xl">
                NBN Co
              </span>
              <span className="font-roboto-slab text-lg uppercase whitespace-nowrap text-brand-dark/80 md:text-xl lg:text-2xl">
                Lendlease
              </span>
              <span className="font-raleway text-lg whitespace-nowrap text-brand-dark/80 md:text-xl lg:text-2xl">
                Property Council
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 01 Focus areas ───────────────────────────────── */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="text-[18px] font-normal">01 — Why Acsess</p>
              <p className="mt-4 max-w-sm text-[color:var(--color-muted-foreground)]">
                Villages often juggle an internet provider, a TV contractor, a phone system and a
                safety installer. We bring them together under one design, one install and one
                support number.
              </p>
            </Reveal>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8">
            {FOCUS.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="border-t border-border pt-[10px]">
                  <h3 className="text-xl font-normal tracking-[-0.02em]">{item.title}</h3>
                  <ul className="mt-4 flex flex-col gap-[3px] text-[color:var(--color-muted-foreground)]">
                    {item.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 02 Services ──────────────────────────────────── */}
      <Section muted>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow="02 — Services"
            title="From the fibre in the ground to the remote in a resident's hand."
          />
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-[2px] border border-border px-6 py-3.5 font-medium transition-colors hover:border-primary hover:text-primary"
          >
            See More
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          {services.slice(0, 2).map((service, i) => (
            <Reveal key={service.id} delay={i * 0.06}>
              <BentoCard service={service} image={BENTO_IMAGES[service.slug]} large />
            </Reveal>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(2).map((service, i) => (
            <Reveal key={service.id} delay={i * 0.06}>
              <BentoCard service={service} image={BENTO_IMAGES[service.slug]} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── 03 How we work ───────────────────────────────── */}
      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="03 — How we work"
              title="Designed, installed and maintained by one team."
              intro="We survey the site, design the network, install it, then stay on as your service provider — so nobody is left arguing about whose cable it is."
            />
            <ol className="mt-12">
              {STEPS.map(([title, body], i) => (
                <Reveal key={title} delay={i * 0.08}>
                  <li className="flex gap-6 border-t border-border py-6">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-normal tracking-[-0.02em]">{title}</h3>
                      <p className="mt-2 text-muted-foreground">{body}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
          <Reveal delay={0.1}>
            <img
              src={MEDIA.technician}
              alt="An Acsess team member helping a resident with their connected services"
              loading="lazy"
              className="rounded-[2px] object-cover"
            />
          </Reveal>
        </div>
      </Section>

      {/* ── 04 SwitchStar ────────────────────────────────── */}
      <section className="ink-section grain relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-0 size-[32rem] rounded-full bg-[color:var(--color-primary)] opacity-[0.08] blur-[140px]"
        />
        <div className="relative mx-auto max-w-[1600px] px-5 py-20 lg:px-10 lg:py-28">
          <Reveal className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8fe8b6]">
                04 — Australian designed product
              </p>
              <h2 className="mt-6 text-[2.2rem] font-light leading-[1.05] tracking-[-0.03em] text-[color:var(--color-ink-foreground)] sm:text-5xl">
                SWITCH STAR
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
                A double power outlet that switches itself off — automatically cutting power after
                eight hours to reduce the fire risk from mobility devices, e-bikes and scooters
                left charging overnight.
              </p>
              <ul className="mt-8 space-y-3 text-[color:var(--color-ink-muted)]">
                {[
                  "Australian-designed double GPO",
                  "Automatic 8-hour charging cut-off",
                  "10A × 2, white and black finishes",
                  "Manufactured to Australian electrical standards",
                ].map((spec) => (
                  <li key={spec} className="flex items-center gap-3">
                    <span className="size-1.5 shrink-0 rounded-full bg-[#8fe8b6]" aria-hidden />
                    {spec}
                  </li>
                ))}
              </ul>
              <Link
                to="/switchstar"
                className="mt-10 inline-flex items-center gap-2 rounded-[2px] bg-primary px-7 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
              >
                Learn about SWITCH STAR
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <img
                src={MEDIA.switchStar}
                alt="The SWITCH STAR double power outlet with automatic 8-hour cut-off"
                loading="lazy"
                className="max-h-80 w-full max-w-sm object-contain lg:max-h-96"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 05 Testimonials ──────────────────────────────── */}
      <Section muted>
        <SectionHeading
          eyebrow="05 — What people say"
          title="Trusted by the people who live and work in our communities."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-[2px] border border-border bg-background p-8">
                <svg
                  aria-hidden
                  className="size-7 text-primary opacity-40"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.95.78-2.99.68-1.04 1.68-1.83 3-2.37l-1.06-1.94c-1.7.7-3.1 1.87-4.18 3.51C5.1 10.59 4.56 12.3 4.56 14.1c0 1.47.39 2.67 1.17 3.59.78.93 1.82 1.39 3.12 1.39 1.06 0 1.97-.35 2.73-1.06.76-.7 1.14-1.63 1.14-2.76l-.49.5zm9.96 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.95.78-2.99.68-1.04 1.68-1.83 3-2.37l-1.06-1.94c-1.7.7-3.1 1.87-4.18 3.51-1.08 1.64-1.62 3.35-1.62 5.15 0 1.47.39 2.67 1.17 3.59.78.93 1.82 1.39 3.12 1.39 1.06 0 1.97-.35 2.73-1.06.76-.7 1.14-1.63 1.14-2.76l-.49.5z" />
                </svg>
                <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-foreground">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-8 border-t border-border pt-6">
                  <p className="font-semibold">{t.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.handle}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── 06 Latest news ───────────────────────────────── */}
      {newsItems.length > 0 && (
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading
              eyebrow="06 — Latest news"
              title="What's happening at Acsess."
            />
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 rounded-[2px] border border-border px-6 py-3.5 font-medium transition-colors hover:border-primary hover:text-primary"
            >
              All news
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {newsItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.06}>
                <article className="flex h-full flex-col rounded-[2px] border border-border bg-background p-8 transition-colors hover:border-primary">
                  {item.published_at && (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      {new Date(item.published_at).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  <h3 className="mt-3 flex-1 text-xl font-normal tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-muted-foreground">{item.excerpt}</p>
                  {item.external_url && (
                    <a
                      href={item.external_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      Read the article
                      <svg
                        aria-hidden
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15,3 21,3 21,9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="ink-section grain relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/3 size-[36rem] rounded-full bg-[color:var(--color-primary)] opacity-[0.14] blur-[150px]"
        />
        <div className="relative mx-auto max-w-[1600px] px-5 py-24 lg:px-10 lg:py-32">
          <Reveal className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
            <h2 className="max-w-3xl text-[2.25rem] font-light leading-[1.05] tracking-[-0.03em] text-[color:var(--color-ink-foreground)] sm:text-5xl lg:text-[4rem]">
              Planning a new village, or replacing tired infrastructure?
            </h2>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-[2px] bg-primary px-7 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
            >
              Start a conversation
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
