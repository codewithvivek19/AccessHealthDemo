import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { serviceQuery } from "@/lib/content.functions";
import { PageHero, Section } from "@/components/site/Prose";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const service = await context.queryClient.ensureQueryData(serviceQuery(params.slug));
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Service not found — Acsess Health" }, { name: "robots", content: "noindex" }] };
    }
    const { service } = loaderData;
    return {
      meta: [
        { title: `${service.name} — Acsess Health` },
        { name: "description", content: service.summary ?? "" },
        { property: "og:title", content: `${service.name} — Acsess Health` },
        { property: "og:description", content: service.summary ?? "" },
      ],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data: service } = useSuspenseQuery(serviceQuery(slug));
  if (!service) return null;

  const highlights = (service.highlights ?? []) as string[];

  return (
    <>
      <PageHero eyebrow={service.category ?? "Service"} title={service.name} intro={service.summary ?? undefined} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="max-w-2xl space-y-5 text-lg leading-relaxed">
            {(service.body ?? "").split("\n\n").map((para, i) => (
              <p key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>
                {para}
              </p>
            ))}
          </div>

          <aside className="rounded-sm border border-border bg-secondary p-8">
            {highlights.length > 0 && (
              <>
                <h2 className="text-xl font-semibold">What's included</h2>
                <ul className="mt-5 space-y-3">
                  {highlights.map((h) => (
                    <li key={h} className="flex gap-3">
                      <Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Link
              to="/contact"
              className="mt-8 inline-flex w-full items-center justify-center rounded-sm bg-primary px-6 py-3.5 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
            >
              Enquire about this service
            </Link>
          </aside>
        </div>

        <Link to="/services" className="mt-14 inline-flex items-center gap-2 font-medium text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden />
          All services
        </Link>
      </Section>
    </>
  );
}
