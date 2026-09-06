import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeading } from "@/components/site/Prose";
import { MEDIA } from "@/lib/media";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Acsess Health" },
      {
        name: "description",
        content:
          "Acsess Health is an Australian telecommunications service provider specialising in retirement villages, aged care and healthcare communities.",
      },
      { property: "og:title", content: "About Acsess Health" },
      {
        property: "og:description",
        content:
          "An Australian telecommunications service provider specialising in retirement, aged care and healthcare communities.",
      },
    ],
  }),
  component: About,
});

const VALUES = [
  ["Plain language", "We explain what we're doing without hiding behind acronyms."],
  ["Patience", "Our support is built around people who may not be comfortable with technology."],
  ["Longevity", "We design infrastructure to last, not to be ripped out in three years."],
  ["Accountability", "One provider, one number, no finger-pointing."],
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="An Australian provider built around care communities"
        intro="Acsess Health works with retirement village operators, aged care providers and healthcare campuses across Australia, delivering the connectivity their residents, staff and clinical systems depend on."
      />

      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              We are a telecommunications service provider, not a reseller with a call centre. We
              design the networks, we install them, and we stay on to run them.
            </p>
            <p className="text-muted-foreground">
              That matters in a village. When a resident's television stops working the day before
              their family visits, they need someone who knows the site, not a script. When an
              operator is commissioning a new stage, they need a partner who understands
              construction timelines as well as fibre.
            </p>
            <p className="text-muted-foreground">
              Our work spans resident internet and Wi-Fi, Foxtel and MATV television, telephone
              services, in-building mobile coverage, thermal imaging and facial recognition — all
              carried over infrastructure we designed to work together.
            </p>
          </div>
          <img
            src={MEDIA.technician}
            alt="An Acsess team member helping a resident with their connected services"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        </div>
      </Section>

      <Section muted>
        <SectionHeading eyebrow="How we work" title="What you can expect from us" />
        <div className="mt-12 grid gap-px overflow-hidden rounded-sm bg-border sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(([title, body]) => (
            <div key={title} className="bg-background p-7">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 rounded-sm border border-border p-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold">Want to know whether we're a fit?</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Tell us about your community and we'll give you a straight answer.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-sm bg-primary px-7 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
          >
            Contact us
          </Link>
        </div>
      </Section>
    </>
  );
}
