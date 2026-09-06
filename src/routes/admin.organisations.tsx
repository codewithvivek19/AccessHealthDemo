import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pill } from "@/components/site/PortalShell";

export const Route = createFileRoute("/admin/organisations")({
  component: AdminOrganisations,
});

function AdminOrganisations() {
  const { data, isPending } = useQuery({
    queryKey: ["admin-organisations"],
    queryFn: async () => {
      const [orgs, sites, members] = await Promise.all([
        supabase.from("organisations").select("*").order("name"),
        supabase.from("sites").select("id, name, organisation_id, status, dwellings"),
        supabase.from("organisation_members").select("organisation_id, user_id, title"),
      ]);
      if (orgs.error) throw orgs.error;
      return { orgs: orgs.data ?? [], sites: sites.data ?? [], members: members.data ?? [] };
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-light tracking-tight text-brand-dark">Organisations</h1>
      <p className="mt-2 text-lg text-brand-dark/70">
        Village operators and property developers, and the sites they own.
      </p>

      {isPending && <p className="mt-8 text-brand-dark/60">Loading…</p>}

      <div className="mt-8 space-y-6">
        {data?.orgs.map((org) => {
          const sites = data.sites.filter((s) => s.organisation_id === org.id);
          const members = data.members.filter((m) => m.organisation_id === org.id);
          return (
            <article key={org.id} className="rounded-2xl border border-brand-dark/10 p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-light tracking-tight text-brand-dark">
                    {org.name}
                  </h2>
                  <p className="mt-1 text-brand-dark/60">
                    {[org.contact_email, `${members.length} people`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Pill>{org.kind}</Pill>
              </div>
              <ul className="mt-5 space-y-2">
                {sites.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3">
                    <span className="text-brand-dark">{s.name}</span>
                    <span className="flex items-center gap-3 text-brand-dark/60">
                      {s.dwellings} dwellings
                      <Pill>{s.status}</Pill>
                    </span>
                  </li>
                ))}
                {!sites.length && <li className="text-brand-dark/60">No sites yet.</li>}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
