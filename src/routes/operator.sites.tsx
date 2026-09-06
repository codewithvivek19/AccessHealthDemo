import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pill } from "@/components/site/PortalShell";

export const Route = createFileRoute("/operator/sites")({
  component: OperatorSites,
});

function OperatorSites() {
  const { data, isPending } = useQuery({
    queryKey: ["operator-sites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-light tracking-tight text-brand-dark">Villages</h1>
      <p className="mt-2 text-lg text-brand-dark/70">
        Every site we look after for your organisation and what's connected there.
      </p>

      {isPending && <p className="mt-8 text-brand-dark/60">Loading…</p>}
      {!isPending && !data?.length && (
        <p className="mt-8 text-brand-dark/60">No villages linked yet.</p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {data?.map((s) => (
          <article key={s.id} className="rounded-2xl border border-brand-dark/10 p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl text-brand-dark">{s.name}</h2>
              <Pill>{s.status}</Pill>
            </div>
            <p className="mt-1 text-brand-dark/70">
              {[s.address, s.suburb, s.state].filter(Boolean).join(", ")}
            </p>
            <p className="mt-1 text-brand-dark/60">{s.dwellings} dwellings</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.services.map((name) => (
                <Pill key={name}>{name}</Pill>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
