import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LifeBuoy, AlertCircle, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge, SkeletonCard, EmptyState, RecordHeader, DataTable } from "@/components/site/PortalShell";

export const Route = createFileRoute("/operator/requests")({
  component: OperatorRequests,
});

function OperatorRequests() {
  const [filterStatus, setFilterStatus] = useState("open");

  const { data, isPending } = useQuery({
    queryKey: ["operator-requests"],
    queryFn: async () => {
      const [tickets, sites] = await Promise.all([
        supabase.from("support_tickets").select("*").not("site_id", "is", null).order("created_at", { ascending: false }),
        supabase.from("sites").select("id, name"),
      ]);
      if (tickets.error) throw tickets.error;
      return { tickets: tickets.data ?? [], sites: sites.data ?? [] };
    },
  });

  const siteName = (id: string | null) => data?.sites.find((s) => s.id === id)?.name ?? "Unknown village";
  const visible = (data?.tickets ?? []).filter((t) => filterStatus === "all" ? true : t.status === filterStatus);

  if (isPending) return <SkeletonCard lines={5} />;

  return (
    <div className="space-y-6">
      <RecordHeader
        title="Resident Requests"
        subtitle="Support tickets raised at your villages"
        icon={<LifeBuoy className="size-5" />}
        actions={
          <div className="flex bg-slate-100 p-1 rounded-md">
            {[["all", "All"], ["open", "Open"], ["in_progress", "In Progress"], ["closed", "Closed"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterStatus(String(val))}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filterStatus === val ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      {!visible.length ? (
        <EmptyState icon={<LifeBuoy className="size-7" />} title={filterStatus === "open" ? "No open requests" : "Nothing here"} description="All quiet — no requests in this category." />
      ) : (
        <DataTable
          data={visible}
          columns={[
            {
              header: "Reference",
              accessor: (r) => <span className="font-mono text-xs">{r.reference}</span>
            },
            {
              header: "Subject",
              accessor: (r) => <span className="font-medium text-slate-900">{r.subject}</span>
            },
            {
              header: "Village",
              accessor: (r) => <span className="text-slate-600">{siteName(r.site_id)}</span>
            },
            {
              header: "Status",
              accessor: (r) => <StatusBadge status={r.status ?? "open"} />
            },
            {
              header: "Date Logged",
              accessor: (r) => <span className="text-slate-600">{new Date(r.created_at).toLocaleDateString("en-AU")}</span>
            }
          ]}
        />
      )}
    </div>
  );
}
