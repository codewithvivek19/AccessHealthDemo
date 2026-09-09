import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, LifeBuoy, Users, Wifi, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard, StatusBadge, SkeletonCard, EmptyState, PageHeader } from "@/components/site/PortalShell";

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

  if (isPending) return <div className="grid gap-4 sm:grid-cols-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  const sites = data?.sites ?? [];
  const tickets = data?.tickets ?? [];
  const openTickets = tickets.filter((t) => t.status !== "closed");
  const liveSites = sites.filter((s) => s.status === "live");
  const totalDwellings = sites.reduce((s, r) => s + (r.dwellings ?? 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" subtitle="Your villages at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Villages" value={sites.length} icon={<MapPin className="size-5" />} iconBg="bg-primary/10" iconColor="text-primary" to="/operator/sites" />
        <StatCard label="Live sites" value={liveSites.length} icon={<Wifi className="size-5" />} iconBg="bg-emerald-500/10" iconColor="text-emerald-600" />
        <StatCard label="Dwellings connected" value={totalDwellings} icon={<Users className="size-5" />} iconBg="bg-blue-500/10" iconColor="text-blue-600" />
        <StatCard label="Open requests" value={openTickets.length} icon={<LifeBuoy className="size-5" />} iconBg={openTickets.length > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"} iconColor={openTickets.length > 0 ? "text-amber-600" : "text-emerald-600"} to="/operator/requests" />
      </div>

      {/* Village preview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your villages</h2>
          <Link to="/operator/sites" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">View all <ArrowRight className="size-3" /></Link>
        </div>
        {!sites.length ? (
          <EmptyState icon={<MapPin className="size-7" />} title="No villages yet" description="Villages linked to your organisation will appear here." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sites.slice(0, 4).map((s) => {
              const siteTickets = tickets.filter((t) => t.site_id === s.id && t.status !== "closed");
              return (
                <article key={s.id} className="rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/30 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`size-2.5 rounded-full shrink-0 ${s.status === "live" ? "bg-emerald-500" : s.status === "construction" ? "bg-amber-500" : "bg-slate-400"}`} aria-hidden />
                      <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                    </div>
                    <StatusBadge status={s.status ?? "live"} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{[s.suburb, s.state].filter(Boolean).join(", ")} · {s.dwellings} dwellings</p>
                  {siteTickets.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700">
                      <LifeBuoy className="size-3.5" aria-hidden />
                      {siteTickets.length} open request{siteTickets.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
