import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge, SkeletonCard, EmptyState, RecordHeader, DataTable } from "@/components/site/PortalShell";

export const Route = createFileRoute("/admin/organisations")({
  component: AdminOrganisations,
});

function AdminOrganisations() {
  const { data, isPending } = useQuery({
    queryKey: ["admin-organisations"],
    queryFn: async () => {
      const [orgs, members] = await Promise.all([
        supabase.from("organisations").select("*").order("name"),
        supabase.from("organisation_members").select("organisation_id, user_id"),
      ]);
      if (orgs.error) throw orgs.error;
      return { orgs: orgs.data ?? [], members: members.data ?? [] };
    },
  });

  if (isPending) return <SkeletonCard lines={5} />;

  return (
    <div className="space-y-6">
      <RecordHeader
        title="Organisations"
        subtitle="Manage operators, developers and partners"
        icon={<Building2 className="size-5" />}
      />

      {!data?.orgs.length ? (
        <EmptyState icon={<Building2 className="size-7" />} title="No organisations yet" description="Organisations will appear here once created." />
      ) : (
        <DataTable
          data={data.orgs}
          columns={[
            {
              header: "Organisation Name",
              accessor: (r) => <span className="font-semibold text-slate-900">{r.name}</span>
            },
            {
              header: "Type",
              accessor: (r) => <StatusBadge status={r.kind ?? "partner"} />
            },
            {
              header: "Members",
              accessor: (r) => {
                const count = (data.members ?? []).filter((m) => m.organisation_id === r.id).length;
                return (
                   <span className="flex items-center gap-1.5 text-slate-600">
                     <Users className="size-3.5" />
                     {count} user{count !== 1 ? "s" : ""}
                   </span>
                );
              }
            },
            {
              header: "Contact Email",
              accessor: (r) => <span className="text-slate-600">{r.contact_email ?? "-"}</span>
            }
          ]}
        />
      )}
    </div>
  );
}
