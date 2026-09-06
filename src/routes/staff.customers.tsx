import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pill } from "@/components/site/PortalShell";

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
    !q
      ? true
      : [p.full_name, p.email, p.community, p.address]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
  );

  return (
    <div>
      <h1 className="text-3xl font-light tracking-tight text-brand-dark">Customers</h1>
      <p className="mt-2 text-lg text-brand-dark/70">
        Look up a customer while you have them on the phone.
      </p>

      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search by name, email or village…"
        aria-label="Search customers"
        className="mt-6 w-full max-w-md rounded-full border border-brand-dark/15 px-5 py-3 text-brand-dark focus:border-brand-green focus:outline-none"
      />

      {isPending && <p className="mt-8 text-brand-dark/60">Loading…</p>}
      {!isPending && !profiles.length && (
        <p className="mt-8 text-brand-dark/60">No customers match that search.</p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {profiles.map((p) => {
          const services = (data?.services ?? []).filter((s) => s.user_id === p.id);
          return (
            <article key={p.id} className="rounded-2xl border border-brand-dark/10 p-6">
              <h2 className="text-xl text-brand-dark">{p.full_name ?? "Unnamed customer"}</h2>
              <p className="mt-1 text-brand-dark/70">
                {[p.email, p.phone].filter(Boolean).join(" · ") || "No contact details"}
              </p>
              <p className="mt-1 text-brand-dark/60">
                {[p.community, p.address].filter(Boolean).join(" — ") || "No address on file"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {services.length ? (
                  services.map((s) => <Pill key={s.id}>{s.service_name}</Pill>)
                ) : (
                  <span className="text-brand-dark/50">No services linked</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
