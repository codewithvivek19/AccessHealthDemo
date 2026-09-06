import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pill } from "@/components/site/PortalShell";

export const Route = createFileRoute("/operator/requests")({
  component: OperatorRequests,
});

function OperatorRequests() {
  const { data, isPending } = useQuery({
    queryKey: ["operator-requests"],
    queryFn: async () => {
      const [tickets, sites] = await Promise.all([
        supabase
          .from("support_tickets")
          .select("*")
          .not("site_id", "is", null)
          .order("created_at", { ascending: false }),
        supabase.from("sites").select("id, name"),
      ]);
      if (tickets.error) throw tickets.error;
      return { tickets: tickets.data ?? [], sites: sites.data ?? [] };
    },
  });

  const siteName = (id: string | null) =>
    data?.sites.find((s) => s.id === id)?.name ?? "Unknown village";

  return (
    <div>
      <h1 className="text-3xl font-light tracking-tight text-brand-dark">Resident requests</h1>
      <p className="mt-2 text-lg text-brand-dark/70">
        Support requests raised at your villages, and where each one is up to.
      </p>

      {isPending && <p className="mt-8 text-brand-dark/60">Loading…</p>}
      {!isPending && !data?.tickets.length && (
        <p className="mt-8 text-brand-dark/60">No requests at your villages right now.</p>
      )}

      <ul className="mt-8 divide-y divide-brand-dark/10 rounded-2xl border border-brand-dark/10">
        {data?.tickets.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="text-lg text-brand-dark">{t.subject}</p>
              <p className="mt-1 text-brand-dark/60">
                {siteName(t.site_id)} · {t.reference} ·{" "}
                {new Date(t.created_at).toLocaleDateString("en-AU")}
              </p>
            </div>
            <Pill>{t.status.replace("_", " ")}</Pill>
          </li>
        ))}
      </ul>
    </div>
  );
}
