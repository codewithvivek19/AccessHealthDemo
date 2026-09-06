import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { servicesQuery, type Service } from "@/lib/content.functions";
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
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
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

function Home() {
  const { data: services } = useSuspenseQuery(servicesQuery);

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
