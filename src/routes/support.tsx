import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Phone, LifeBuoy } from "lucide-react";
import { resourcesQuery } from "@/lib/content.functions";
import { PageHero, Section } from "@/components/site/Prose";
import { CONTACT } from "@/lib/site";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Acsess Health" },
      {
        name: "description",
        content:
          "Get help with your Acsess Health internet, television or telephone service. Try the quick fixes, call 1300 736 785, or log a request in your account.",
      },
      { property: "og:title", content: "Support — Acsess Health" },
      {
        property: "og:description",
        content: "Quick fixes, phone support and online support requests for Acsess customers.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(resourcesQuery),
  component: Support,
});

const STEPS = [
  ["Check the lights", "On your modem, look for a steady (not flashing) power and internet light."],
  [
    "Turn it off, count to thirty",
    "Unplug the modem at the wall, wait thirty seconds, plug it back in and give it two minutes.",
  ],
  [
    "Try another device",
    "If a second phone or tablet also can't connect, it's the service rather than the device.",
  ],
  [
    "Still stuck? Call us",
    "We can see your connection from our end and often fix it while you're on the phone.",
  ],
];

function Support() {
  const { data: resources } = useSuspenseQuery(resourcesQuery);
  const faqs = resources.filter((r) => r.kind === "faq");

  return (
    <>
      <PageHero
        eyebrow="Support"
        title="A little help. A real person."
        intro="Most problems are solved in a few minutes. Start here, and if it's still not right, we're a phone call away."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={CONTACT.phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-7 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
          >
            <Phone className="size-5" aria-hidden />
            Call {CONTACT.phone}
          </a>
          <Link
            to="/account/support"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-border bg-background px-7 py-4 text-lg font-medium transition-colors hover:border-primary hover:text-primary"
          >
            <LifeBuoy className="size-5" aria-hidden />
            Log a request online
          </Link>
        </div>
      </PageHero>

      <Section className="a-help-steps">
        <h2 className="text-2xl font-semibold">Before you call: four things to try</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-2">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="flex gap-5 rounded-sm border border-border p-7">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {faqs.length > 0 && (
        <Section muted>
          <h2 className="text-2xl font-semibold">Frequently asked</h2>
          <div className="a-faq-list mt-8">
            {faqs.map((faq) => (
              <details key={faq.id} className="p-7">
                <summary className="cursor-pointer list-none text-lg font-semibold">
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
