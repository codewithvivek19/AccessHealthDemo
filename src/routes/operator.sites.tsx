import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge, SkeletonCard, EmptyState, RecordHeader, DataTable } from "@/components/site/PortalShell";

export const Route = createFileRoute("/operator/sites")({
  component: OperatorSites,
});

function OperatorSites() {
  const { data, isPending } = useQuery({
    queryKey: ["operator-sites"],
    queryFn: async () => {
      const [sites, tickets] = await Promise.all([
        supabase.from("sites").select("*").order("name"),
        supabase.from("support_tickets").select("id, site_id, status"),
      ]);
      if (sites.error) throw sites.error;
      return { sites: sites.data ?? [], tickets: tickets.data ?? [] };
    },
  });

  if (isPending) return <SkeletonCard lines={6} />;

  return (
    <div className="space-y-6">
      <RecordHeader
        title="Villages"
        subtitle={`${data?.sites.length ?? 0} sites managed`}
        icon={<Building className="size-5" />}
      />

      {!data?.sites.length ? (
        <EmptyState icon={<MapPin className="size-7" />} title="No villages yet" description="Contact Acsess to link villages." />
      ) : (
        <DataTable
          data={data.sites}
          columns={[
            {
              header: "Village Name",
              accessor: (r) => <span className="font-semibold text-slate-900">{r.name}</span>
            },
            {
              header: "Location",
              accessor: (r) => <span className="text-slate-600">{[r.address, r.suburb, r.state].filter(Boolean).join(", ")}</span>
            },
            {
              header: "Size",
              accessor: (r) => <span className="text-slate-600">{r.dwellings} dwellings</span>
            },
            {
              header: "Services Available",
              accessor: (r) => r.services?.length ? (
                <div className="flex flex-wrap gap-1">
                  {r.services.map((s: string) => <span key={s} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase font-semibold">{s}</span>)}
                </div>
              ) : <span className="text-slate-400">-</span>
            },
            {
              header: "Open Requests",
              accessor: (r) => {
                const count = (data.tickets ?? []).filter(t => t.site_id === r.id && t.status !== "closed").length;
                return count > 0 ? <span className="text-amber-600 font-bold">{count}</span> : <span className="text-slate-400">0</span>;
              }
            },
            {
              header: "Status",
              accessor: (r) => <StatusBadge status={r.status ?? "live"} />
            }
          ]}
        />
      )}
    </div>
  );
}
