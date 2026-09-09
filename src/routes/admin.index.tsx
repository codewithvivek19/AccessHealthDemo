import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Building2, MapPin, LifeBuoy, Globe, InboxIcon, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard, SkeletonCard, StatusBadge, PageHeader } from "@/components/site/PortalShell";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data, isPending } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [profiles, orgs, sites, tickets, enquiries, resources] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("organisations").select("id"),
        supabase.from("sites").select("id, status, name, suburb, state").order("name"),
        supabase.from("support_tickets").select("id, status, subject, created_at, priority").order("created_at", { ascending: false }).limit(6),
        supabase.from("enquiries").select("id").order("created_at", { ascending: false }),
        supabase.from("resources").select("id, is_published"),
      ]);
      return {
        userCount: profiles.data?.length ?? 0,
        orgCount: orgs.data?.length ?? 0,
        siteCount: sites.data?.length ?? 0,
        sites: sites.data ?? [],
        openTickets: (tickets.data ?? []).filter((t) => t.status !== "closed").length,
        recentTickets: tickets.data ?? [],
        enquiryCount: enquiries.data?.length ?? 0,
        publishedCount: (resources.data ?? []).filter((r) => r.is_published).length,
        draftCount: (resources.data ?? []).filter((r) => !r.is_published).length,
      };
    },
  });

  if (isPending) return <div className="grid gap-4 sm:grid-cols-3">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  const d = data!;

  return (
    <div className="space-y-8">
      <PageHeader title="Admin overview" subtitle="A live view of the entire Acsess platform." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Users" value={d.userCount} icon={<Users className="size-5" />} iconBg="bg-blue-500/10" iconColor="text-blue-600" to="/admin/people" />
        <StatCard label="Organisations" value={d.orgCount} icon={<Building2 className="size-5" />} iconBg="bg-violet-500/10" iconColor="text-violet-600" to="/admin/organisations" />
        <StatCard label="Sites" value={d.siteCount} icon={<MapPin className="size-5" />} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard label="Open tickets" value={d.openTickets} icon={<LifeBuoy className="size-5" />} iconBg={d.openTickets > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"} iconColor={d.openTickets > 0 ? "text-amber-600" : "text-emerald-600"} />
        <StatCard label="Enquiries" value={d.enquiryCount} icon={<InboxIcon className="size-5" />} iconBg="bg-slate-500/10" iconColor="text-slate-500" />
        <StatCard label="Published content" value={d.publishedCount} icon={<Globe className="size-5" />} iconBg="bg-emerald-500/10" iconColor="text-emerald-600" to="/admin/content" {...(d.draftCount > 0 ? { hint: `${d.draftCount} hidden` } : {})} />
      </div>

      {/* Recent tickets */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent support tickets</h2>
          <Link to="/staff" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">Open desk <ArrowRight className="size-3" /></Link>
        </div>
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          {d.recentTickets.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No recent tickets.</div>
          )}
          {d.recentTickets.map((t, i) => (
            <div key={t.id} className={`flex items-center gap-4 px-5 py-4 ${i < d.recentTickets.length - 1 ? "border-b border-border" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{t.subject}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("en-AU")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {t.priority && t.priority !== "normal" && (
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${t.priority === "urgent" ? "border-red-200 bg-red-500/10 text-red-700" : "border-orange-200 bg-orange-500/10 text-orange-700"}`}>{t.priority}</span>
                )}
                <StatusBadge status={t.status ?? "open"} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
