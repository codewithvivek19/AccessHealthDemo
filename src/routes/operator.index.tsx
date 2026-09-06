import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pill, StatCards } from "@/components/site/PortalShell";

export const Route = createFileRoute("/operator/")({
  component: OperatorOverview,
});

function OperatorOverview() {
  const { data, isPending } = useQuery({
    queryKey: ["operator-overview"],
    queryFn: async () => {
      const [sites, tickets] = await Promise.all([
        supabase.from("sites").select("*").order("name"),
        supabase.from("support_tickets").select("*").not("site_id", "is", null),
      ]);
      if (sites.error) throw sites.error;
      return { sites: sites.data ?? [], tickets: tickets.data ?? [] };
    },
  });

  if (isPending) return <p className="text-brand-dark/60">Loading…</p>;

  const sites = data?.sites ?? [];
  const tickets = data?.tickets ?? [];

  return (
    <div className="space-y-10">
      <StatCards
        items={[
          { label: "Villages", value: sites.length },
          {
            label: "Dwellings connected",
            value: sites.reduce((sum, s) => sum + (s.dwellings ?? 0), 0),
          },
          { label: "Live sites", value: sites.filter((s) => s.status === "live").length },
          {
            label: "Open requests",
            value: tickets.filter((t) => t.status !== "closed").length,
          },
        ]}
      />

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl font-light tracking-tight text-brand-dark">Your villages</h2>
          <Link to="/operator/sites" className="text-sm tracking-wide text-brand-green uppercase">
            View all
          </Link>
        </div>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {sites.slice(0, 4).map((s) => (
            <article key={s.id} className="rounded-2xl border border-brand-dark/10 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl text-brand-dark">{s.name}</h3>
                <Pill>{s.status}</Pill>
              </div>
              <p className="mt-1 text-brand-dark/60">
                {[s.suburb, s.state].filter(Boolean).join(", ")} · {s.dwellings} dwellings
              </p>
            </article>
          ))}
          {!sites.length && (
            <p className="text-brand-dark/60">No villages linked to your organisation yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
