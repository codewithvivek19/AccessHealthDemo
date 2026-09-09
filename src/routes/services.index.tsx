import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ServiceCard } from "@/components/site/ServiceCard";
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
        eyebrow="Our services"
        title="The everyday. All connected."
        intro="The network in the ground. The services in each home. The people who answer your call. Everything your community needs, considered together."
      />
      <Section>
        <div className="a-service-grid">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </Section>
    </>
  );
}
