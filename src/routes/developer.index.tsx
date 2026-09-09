import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, MapPin, Users, CheckCircle2, ArrowRight, Clock, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard, StatusBadge, SkeletonCard, EmptyState, PageHeader } from "@/components/site/PortalShell";

export const Route = createFileRoute("/developer/")({
  component: DeveloperOverview,
});

const PHASES = ["planning", "design", "construction", "commissioning", "live"] as const;
type Phase = typeof PHASES[number];

const PHASE_COLOUR: Record<Phase, string> = {
  planning: "bg-violet-500",
  design: "bg-blue-500",
  construction: "bg-amber-500",
  commissioning: "bg-orange-500",
  live: "bg-emerald-500",
};

function phaseIndex(status: string): number {
  const idx = PHASES.indexOf(status as Phase);
  return idx === -1 ? 0 : idx;
}

function DeveloperOverview() {
  const { data, isPending } = useQuery({
    queryKey: ["developer-overview"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  if (isPending) return <div className="grid gap-4 sm:grid-cols-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  const sites = data ?? [];
  const live = sites.filter((s) => s.status === "live");
  const inProgress = sites.filter((s) => s.status !== "live");

  return (
    <div className="space-y-8">
      <PageHeader title="Projects" subtitle="Network builds Acsess is delivering for your organisation." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total projects" value={sites.length} icon={<Briefcase className="size-5" />} iconBg="bg-primary/10" iconColor="text-primary" to="/developer/sites" />
        <StatCard label="Live" value={live.length} icon={<CheckCircle2 className="size-5" />} iconBg="bg-emerald-500/10" iconColor="text-emerald-600" />
        <StatCard label="In progress" value={inProgress.length} icon={<Clock className="size-5" />} iconBg="bg-amber-500/10" iconColor="text-amber-600" />
      </div>

      {!sites.length ? (
        <EmptyState icon={<Briefcase className="size-7" />} title="No projects yet" description="Contact Acsess to set up your first network build project." />
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All projects</h2>
            <Link to="/developer/sites" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">Site details <ArrowRight className="size-3" /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sites.map((s) => {
              const pIdx = phaseIndex(s.status ?? "planning");
              const pct = Math.round(((pIdx + 1) / PHASES.length) * 100);
              return (
                <article key={s.id} className="rounded-xl border border-border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" aria-hidden />
                        {[s.suburb, s.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <StatusBadge status={s.status ?? "planning"} />
                  </div>

                  {/* Phase timeline */}
                  <div className="mt-5">
                    <div className="flex justify-between mb-2">
                      {PHASES.map((phase, idx) => (
                        <div key={phase} className="flex flex-col items-center gap-1" style={{ width: `${100 / PHASES.length}%` }}>
                          <div className={`size-3 rounded-full border-2 ${idx <= pIdx ? `${PHASE_COLOUR[phase]} border-transparent` : "border-border bg-background"}`} aria-hidden />
                          <span className="hidden text-[10px] text-muted-foreground capitalize sm:block">{phase}</span>
                        </div>
                      ))}
                    </div>
                    <div className="relative h-1.5 rounded-full bg-secondary">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                        aria-label={`${pct}% complete`}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="size-3.5" />{s.dwellings} dwellings</span>
                    {s.services && s.services.length > 0 && (
                      <span>{s.services.slice(0, 2).join(", ")}{s.services.length > 2 ? ` +${s.services.length - 2}` : ""}</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
