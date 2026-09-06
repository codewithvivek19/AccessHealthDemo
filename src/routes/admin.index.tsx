import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCards } from "@/components/site/PortalShell";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data, isPending } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [profiles, orgs, sites, projects, tickets, enquiries] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("organisations").select("id"),
        supabase.from("sites").select("id, dwellings"),
        supabase.from("projects").select("id, status"),
        supabase.from("support_tickets").select("id, status"),
        supabase.from("enquiries").select("id"),
      ]);
      return {
        profiles: profiles.data?.length ?? 0,
        orgs: orgs.data?.length ?? 0,
        dwellings: (sites.data ?? []).reduce((s, r) => s + (r.dwellings ?? 0), 0),
        sites: sites.data?.length ?? 0,
        projects: projects.data?.length ?? 0,
        openTickets: (tickets.data ?? []).filter((t) => t.status !== "closed").length,
        enquiries: enquiries.data?.length ?? 0,
      };
    },
  });

  if (isPending) return <p className="text-brand-dark/60">Loading…</p>;

  return (
    <div className="space-y-8">
      <StatCards
        items={[
          { label: "Customer accounts", value: data?.profiles ?? 0 },
          { label: "Organisations", value: data?.orgs ?? 0 },
          { label: "Sites", value: data?.sites ?? 0, hint: `${data?.dwellings ?? 0} dwellings` },
          { label: "Projects", value: data?.projects ?? 0 },
        ]}
      />
      <StatCards
        items={[
          { label: "Open support requests", value: data?.openTickets ?? 0 },
          { label: "Website enquiries", value: data?.enquiries ?? 0 },
        ]}
      />
    </div>
  );
}
