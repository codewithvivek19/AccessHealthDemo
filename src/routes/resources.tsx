import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { resourcesQuery } from "@/lib/content.functions";
import { PageHero, Section } from "@/components/site/Prose";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources and news — Acsess Health" },
      {
        name: "description",
        content:
          "News, updates and common questions about internet, television and telephone services in retirement villages and care communities.",
      },
      { property: "og:title", content: "Resources and news — Acsess Health" },
      {
        property: "og:description",
        content: "News, updates and answers to common resident and operator questions.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(resourcesQuery),
  component: Resources,
});

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Resources() {
  const { data: resources } = useSuspenseQuery(resourcesQuery);
  const articles = resources.filter((r) => r.kind !== "faq");
  const faqs = resources.filter((r) => r.kind === "faq");

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="News, updates and answers"
        intro="What's happening across the industry, plus straightforward answers to the questions residents and village teams ask us most."
      />

      <Section>
        <h2 className="text-2xl font-semibold">Latest news</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-sm border border-border p-7 transition-colors hover:border-primary"
            >
              {formatDate(item.published_at) && (
                <p className="eyebrow text-primary">{formatDate(item.published_at)}</p>
              )}
              <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 flex-1 text-muted-foreground">{item.excerpt}</p>
              {item.external_url && (
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-6 inline-flex items-center gap-2 font-medium text-primary hover:underline"
                >
                  Read the article
                  <ExternalLink className="size-4" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </article>
          ))}
        </div>
      </Section>

      {faqs.length > 0 && (
        <Section muted>
          <h2 className="text-2xl font-semibold">Common questions</h2>
          <div className="mt-8 divide-y divide-border rounded-sm border border-border bg-background">
            {faqs.map((faq) => (
              <details key={faq.id} className="group p-7">
                <summary className="cursor-pointer list-none text-lg font-semibold marker:hidden">
                  {faq.title}
                </summary>
                <div className="mt-4 space-y-4 text-muted-foreground">
                  {(faq.body ?? faq.excerpt ?? "").split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
