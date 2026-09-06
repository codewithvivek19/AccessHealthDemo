import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { servicesQuery } from "@/lib/content.functions";
import { PageHero, Section } from "@/components/site/Prose";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — Acsess Health" },
      {
        name: "description",
        content:
          "Village internet, Foxtel and MATV television, telephone services, thermal imaging, mobile coverage and facial recognition for Australian retirement and care communities.",
      },
      { property: "og:title", content: "Services — Acsess Health" },
      {
        property: "og:description",
        content:
          "Internet, television, telephone, mobile coverage and safety technology for retirement and care communities.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  component: ServicesIndex,
});

function ServicesIndex() {
  const { data: services } = useSuspenseQuery(servicesQuery);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything a connected community needs"
        intro="We deliver the whole stack — the network in the ground, the services in each home, and the people who answer the phone when something needs attention."
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.id}
              to="/services/$slug"
              params={{ slug: service.slug }}
              className="group flex flex-col rounded-sm border border-border p-8 transition-colors hover:border-primary"
            >
              <p className="eyebrow text-primary">{service.category}</p>
              <h2 className="mt-3 text-2xl font-semibold">{service.name}</h2>
              <p className="mt-3 flex-1 text-lg text-muted-foreground">{service.summary}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-medium text-primary">
                Learn more
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
