import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wifi, Router, Phone, Tv2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SkeletonCard, EmptyState, RecordHeader, DataTable, StatusBadge } from "@/components/site/PortalShell";

export const Route = createFileRoute("/account/services")({
  component: AccountServices,
});

function svcIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("internet") || t.includes("broadband")) return <Wifi className="size-5" />;
  if (t.includes("phone") || t.includes("voice")) return <Phone className="size-5" />;
  if (t.includes("tv") || t.includes("entertainment")) return <Tv2 className="size-5" />;
  return <Router className="size-5" />;
}

function AccountServices() {
  const { user } = useAuth();

  const { data, isPending } = useQuery({
    queryKey: ["my-services", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("customer_services").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  if (isPending) return <SkeletonCard lines={6} />;

  return (
    <div className="space-y-6">
      <RecordHeader
        title="My Services"
        subtitle="Manage your active connections and plans"
        icon={<Wifi className="size-5" />}
      />

      {!data?.length ? (
        <EmptyState icon={<Wifi className="size-7" />} title="No active services" description="You don't have any Acsess services connected yet." />
      ) : (
         <div className="grid gap-6">
           {data.map((s) => (
             <div key={s.id} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center items-center md:w-64">
                   <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                     {svcIcon(s.service_name)}
                   </div>
                   <h3 className="text-center font-bold text-slate-900">{s.service_name}</h3>
                   <div className="mt-3"><StatusBadge status={s.status ?? "active"} /></div>
                </div>
                <div className="p-6 flex-1 grid sm:grid-cols-2 gap-6">
                   <div>
                     <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Plan</p>
                     <p className="text-sm font-medium text-slate-900">{s.plan}</p>
                   </div>
                   <div>
                     <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Monthly Cost</p>
                     <p className="text-sm font-medium text-slate-900">${s.monthly_price}</p>
                   </div>
                   <div>
                     <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Activation Date</p>
                     <p className="text-sm font-medium text-slate-900">{s.started_on ? new Date(s.started_on).toLocaleDateString("en-AU") : "-"}</p>
                   </div>

                </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
}
