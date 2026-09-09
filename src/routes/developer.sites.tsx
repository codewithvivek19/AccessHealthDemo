import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CheckCircle2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge, SkeletonCard, EmptyState, RecordHeader } from "@/components/site/PortalShell";

export const Route = createFileRoute("/developer/sites")({
  component: DeveloperSites,
});

const PHASES = ["planning", "design", "construction", "commissioning", "live"] as const;
type Phase = typeof PHASES[number];

function SalesPath({ currentStatus }: { currentStatus: string }) {
  const pIdx = PHASES.indexOf((currentStatus as Phase) ?? "planning");
  const idx = pIdx === -1 ? 0 : pIdx;

  return (
    <div className="flex w-full items-center">
      {PHASES.map((phase, i) => {
        const isPast = i < idx;
        const isCurrent = i === idx;
        
        let bgClass = "bg-slate-100 text-slate-500 border-slate-200";
        if (isPast) bgClass = "bg-primary text-white border-primary";
        if (isCurrent) bgClass = "bg-primary/10 text-primary border-primary";

        return (
          <div key={phase} className="flex-1 flex items-center">
            <div className={`relative flex-1 flex items-center justify-center border-y border-l py-2 first:rounded-l-full last:rounded-r-full last:border-r ${bgClass}`}>
              <span className="text-xs font-semibold uppercase tracking-wider z-10 flex items-center gap-1.5">
                {isPast && <CheckCircle2 className="size-3" />}
                {phase}
              </span>
              {/* Chevron arrow styling for path */}
              {i < PHASES.length - 1 && (
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 text-white">
                  <ChevronRight className={`size-5 ${isPast ? "text-primary" : "text-slate-200"}`} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DeveloperSites() {
  const { data, isPending } = useQuery({
    queryKey: ["developer-sites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  if (isPending) return <SkeletonCard lines={8} />;

  return (
    <div className="space-y-6">
      <RecordHeader
        title="Project Sites"
        subtitle="Network builds Acsess is delivering for your organisation"
        icon={<Briefcase className="size-5" />}
      />

      {!data?.length ? (
        <EmptyState icon={<Briefcase className="size-7" />} title="No projects yet" description="Projects linked to your organisation will appear here." />
      ) : (
        <div className="space-y-6">
          {data.map((s) => (
            <div key={s.id} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{[s.address, s.suburb, s.state].filter(Boolean).join(", ")}</p>
                </div>
                <div className="flex gap-4 items-center">
                   <div className="text-right hidden sm:block">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Dwellings</p>
                      <p className="text-sm font-bold text-slate-900">{s.dwellings}</p>
                   </div>
                   <StatusBadge status={s.status ?? "planning"} />
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Project Lifecycle Stage</p>
                <SalesPath currentStatus={s.status ?? "planning"} />
                
                {s.services && s.services.length > 0 && (
                  <div className="mt-6">
                     <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Target Services</p>
                     <div className="flex gap-2">
                       {s.services.map((svc: string) => (
                         <span key={svc} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-xs font-medium">{svc}</span>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
