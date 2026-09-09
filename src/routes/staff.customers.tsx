import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Mail, Phone, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge, SkeletonCard, EmptyState, RecordHeader, DataTable } from "@/components/site/PortalShell";

export const Route = createFileRoute("/staff/customers")({
  component: StaffCustomers,
});

function StaffCustomers() {
  const [term, setTerm] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["staff-customers"],
    queryFn: async () => {
      const [profiles, services] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("customer_services").select("*"),
      ]);
      if (profiles.error) throw profiles.error;
      return { profiles: profiles.data ?? [], services: services.data ?? [] };
    },
  });

  const q = term.trim().toLowerCase();
  const profiles = (data?.profiles ?? []).filter((p) =>
    !q ? true : [p.full_name, p.email, p.community, p.address].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
  );

  if (isPending) return <div className="space-y-4"><div className="h-10 w-72 animate-pulse rounded bg-slate-200" /><SkeletonCard lines={5} /></div>;

  return (
    <div className="space-y-6">
      <RecordHeader
        title="Customers"
        subtitle={`${profiles.length} total records`}
        icon={<Users className="size-5" />}
        actions={
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search" value={term} onChange={(e) => setTerm(e.target.value)}
              placeholder="Search customers..."
              className="w-full rounded border border-slate-300 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        }
      />

      <DataTable
        data={profiles}
        columns={[
          {
            header: "Name",
            accessor: (r) => (
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary uppercase">
                  {(r.full_name ?? r.email ?? "?").charAt(0)}
                </div>
                <span className="font-semibold text-slate-900">{r.full_name ?? "Unnamed"}</span>
              </div>
            )
          },
          {
            header: "Contact",
            accessor: (r) => (
              <div className="space-y-0.5">
                {r.email && <div className="flex items-center gap-1 text-slate-600"><Mail className="size-3" /> {r.email}</div>}
                {r.phone && <div className="flex items-center gap-1 text-slate-600"><Phone className="size-3" /> {r.phone}</div>}
              </div>
            )
          },
          {
            header: "Location",
            accessor: (r) => (
              r.community ? <div className="flex items-center gap-1 text-slate-600"><MapPin className="size-3" /> {r.community}</div> : <span className="text-slate-400">-</span>
            )
          },
          {
            header: "Services",
            accessor: (r) => {
              const svcs = (data?.services ?? []).filter((s) => s.user_id === r.id);
              if (!svcs.length) return <span className="text-slate-400">None</span>;
              return (
                <div className="flex flex-col gap-1">
                  {svcs.map(s => (
                    <div key={s.id} className="flex items-center gap-2">
                      <StatusBadge status={s.status ?? "active"} />
                      <span className="text-[11px] text-slate-600 truncate max-w-[120px]">{s.service_name}</span>
                    </div>
                  ))}
                </div>
              );
            }
          }
        ]}
      />
    </div>
  );
}
