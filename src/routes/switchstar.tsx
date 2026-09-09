import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { productQuery, type SpecItem } from "@/lib/content.functions";
import { Section } from "@/components/site/Prose";
import { MEDIA } from "@/lib/media";

export const Route = createFileRoute("/switchstar")({
  head: () => ({
    meta: [
      { title: "SWITCH STAR — automatic cut-off power outlet | Acsess Health" },
      {
        name: "description",
        content:
          "SWITCH STAR is an Australian-designed double power outlet with an automatic cut-off timer, helping reduce the risk of appliances being left switched on.",
      },
      { property: "og:title", content: "SWITCH STAR — automatic cut-off power outlet" },
      {
        property: "og:description",
        content:
          "An Australian-designed double power outlet with an automatic cut-off timer for safer independent living.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productQuery("switchstar")),
  component: SwitchStar,
});

function SwitchStar() {
  const { data: product } = useSuspenseQuery(productQuery("switchstar"));
  const specs = (product?.specifications ?? []) as SpecItem[];

  return (
    <>
      <section className="a-switch-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="reveal-up">
            <p className="eyebrow text-primary">Australian designed product</p>
            <h1 className="mt-4 text-4xl font-light tracking-tight sm:text-6xl">
              {product?.name ?? "SWITCH STAR"}
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
              {product?.tagline ??
                "A double power outlet that switches itself off, for peace of mind in independent living."}
            </p>
            <Link
              to="/contact"
              className="mt-9 inline-flex items-center rounded-sm bg-primary px-7 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
            >
              Enquire about SWITCH STAR
            </Link>
          </div>
          <img
            src={MEDIA.switchStar}
            alt="The SWITCH STAR double power outlet with automatic cut-off timer"
            loading="lazy"
            className="w-full rounded-sm bg-background object-contain p-8"
          />
        </div>
      </section>

      <Section className="a-service-detail">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="max-w-2xl space-y-5 text-lg leading-relaxed">
            {(product?.description ?? "").split("\n\n").map((para, i) => (
              <p key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>
                {para}
              </p>
            ))}
          </div>
          {specs.length > 0 && (
            <aside className="rounded-sm border border-border bg-secondary p-8">
              <h2 className="text-xl font-semibold">Specifications</h2>
              <dl className="mt-5 divide-y divide-border">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-6 py-3">
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd className="text-right font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 flex gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                Installation must be carried out by a licensed electrician.
              </p>
            </aside>
          )}
        </div>
      </Section>
    </>
  );
}
