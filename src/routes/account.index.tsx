import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wifi, Tv2, Phone, Shield, FileText, Settings, HeartPulse, Clock, Activity, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RecordHeader, StatCard, SkeletonCard, StatusBadge } from "@/components/site/PortalShell";

export const Route = createFileRoute("/account/")({
  component: AccountDashboard,
});

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function AccountDashboard() {
  const { user } = useAuth();

  const { data, isPending } = useQuery({
    queryKey: ["account-dashboard", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [profile, services, tickets] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("customer_services").select("*").eq("user_id", user!.id),
        supabase.from("support_tickets").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(3),
      ]);
      return {
        profile: profile.data,
        services: services.data ?? [],
        tickets: tickets.data ?? [],
      };
    },
  });

  if (isPending) return <SkeletonCard lines={6} />;

  const d = data!;
  const name = d.profile?.full_name?.split(" ")[0] ?? "there";
  const activeServices = d.services.filter(s => s.status === "active").length;
  const openTickets = d.tickets.filter(t => t.status !== "closed").length;
  const totalCost = d.services.reduce((acc, s) => acc + (Number(s.monthly_price) || 0), 0);

  return (
    <div className="space-y-8">
      <RecordHeader
        title={`${getGreeting()}, ${name}.`}
        subtitle="Here is what is happening with your Acsess account today."
        icon={<Activity className="size-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active Services" value={activeServices} icon={<Wifi className="size-5" />} iconBg="bg-primary/10" iconColor="text-primary" to="/account/services" />
        <StatCard label="Monthly Total" value={`$${totalCost.toFixed(2)}`} icon={<FileText className="size-5" />} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard label="Open Requests" value={openTickets} icon={<Clock className="size-5" />} iconBg={openTickets > 0 ? "bg-amber-100" : "bg-emerald-100"} iconColor={openTickets > 0 ? "text-amber-600" : "text-emerald-600"} to="/account/support" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Network Health */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Network Health</h2>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                 <HeartPulse className="size-6" />
               </div>
               <div>
                 <p className="font-bold text-slate-900">All Systems Operational</p>
                 <p className="text-sm text-slate-500 mt-0.5">Your services in {d.profile?.community ?? "your area"} are running smoothly.</p>
               </div>
             </div>
             <StatusBadge status="live" />
          </div>

          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-8">Recent Support Requests</h2>
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
             {d.tickets.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No recent requests.</div>
             ) : (
                <div className="divide-y divide-slate-200">
                  {d.tickets.map(t => (
                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                       <div>
                          <p className="text-sm font-semibold text-slate-900">{t.subject}</p>
                          <p className="text-xs text-slate-500 mt-1">{new Date(t.created_at).toLocaleDateString("en-AU")} · {t.reference}</p>
                       </div>
                       <StatusBadge status={t.status ?? "open"} />
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
           <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Quick Links</h2>
           <div className="grid gap-3">
             <Link to="/account/services" className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-primary/50 transition-colors">
                <Wifi className="size-5 text-primary" />
                <span className="font-medium text-slate-700">Manage Services</span>
             </Link>
             <Link to="/account/support" className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-primary/50 transition-colors">
                <AlertTriangle className="size-5 text-amber-500" />
                <span className="font-medium text-slate-700">Report an Issue</span>
             </Link>
             <Link to="/account/profile" className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-primary/50 transition-colors">
                <Settings className="size-5 text-slate-500" />
                <span className="font-medium text-slate-700">Account Settings</span>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
