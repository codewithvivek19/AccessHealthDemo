import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/site/Prose";
import { MEDIA } from "@/lib/media";

export const Route = createFileRoute("/retirement-living")({
  head: () => ({
    meta: [
      { title: "Retirement living — Acsess Health" },
      {
        name: "description",
        content:
          "How Acsess Health supports retirement village operators and residents with one managed network for internet, TV, telephone and safety technology.",
      },
      { property: "og:title", content: "Retirement living — Acsess Health" },
      {
        property: "og:description",
        content:
          "One managed network for internet, TV, telephone and safety technology across your village.",
      },
    ],
  }),
  component: RetirementLiving,
});

const OPERATOR = [
  "A single point of contact for every connected service on site",
  "Infrastructure designed to be reused as technology changes",
  "Coverage for common areas, staff systems and back-of-house",
  "Reporting on services, faults and resident tickets",
  "Staged upgrades that don't disrupt residents",
];

const RESIDENT = [
  "Internet that is ready the day you move in",
  "Television with the channels you already know",
  "A home phone number you can keep",
  "Plain-language help, without being handed between departments",
  "Support that has time for the question you think is silly",
];

const DEVELOPER = [
  "Early engagement during the design and DA stage",
  "Infrastructure spec that complies with NBN Co and Telstra requirements",
  "Coordination with builders, electricians and cabling contractors",
  "Staged commissioning aligned to construction milestones",
  "Handover to the operator with full documentation",
];

function RetirementLiving() {
  return (
    <>
      <PageHero
        eyebrow="Retirement living"
        title="Technology that fades into the background"
        intro="Residents shouldn't have to think about how the internet arrives, and operators shouldn't have to chase four different contractors. We design village networks so both are true."
      />

      <Section className="a-community-story">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <img
            src={MEDIA.village}
            alt="Residents enjoying an Australian retirement village community"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
          <div>
            <SectionHeading
              eyebrow="The problem we solve"
              title="Villages are small towns with big expectations"
              intro="A modern village carries resident internet, streaming television, nurse call, lifts, access control, staff Wi-Fi and business systems — often over cabling installed for a very different era."
            />
            <p className="mt-6 text-lg text-muted-foreground">
              We start with what is already in the ground, then design one network that can carry
              everything, with capacity left for whatever comes next.
            </p>
          </div>
        </div>
      </Section>

      <Section muted className="a-community-audiences">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-sm border border-border bg-background p-8">
            <p className="eyebrow text-primary">For operators</p>
            <h2 className="mt-3 text-2xl font-semibold">Fewer contracts, clearer accountability</h2>
            <ul className="mt-6 space-y-3">
              {OPERATOR.map((item) => (
                <li key={item} className="flex gap-3 text-lg">
                  <Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-sm border border-border bg-background p-8">
            <p className="eyebrow text-primary">For residents</p>
            <h2 className="mt-3 text-2xl font-semibold">Connected, without the runaround</h2>
            <ul className="mt-6 space-y-3">
              {RESIDENT.map((item) => (
                <li key={item} className="flex gap-3 text-lg">
                  <Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-sm border border-border bg-background p-8">
            <p className="eyebrow text-primary">For developers and project teams</p>
            <h2 className="mt-3 text-2xl font-semibold">Connectivity built into the design</h2>
            <ul className="mt-6 space-y-3">
              {DEVELOPER.map((item) => (
                <li key={item} className="flex gap-3 text-lg">
                  <Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <section className="a-survey">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-20 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-ink-foreground)] sm:text-4xl">
              Book a site survey
            </h2>
            <p className="mt-4 text-lg text-[color:var(--color-ink-muted)]">
              We'll walk the village, look at what's there, and tell you plainly what it would take
              to bring it up to standard.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-sm bg-primary px-7 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
          >
            Request a survey
          </Link>
        </div>
      </section>
    </>
  );
}
