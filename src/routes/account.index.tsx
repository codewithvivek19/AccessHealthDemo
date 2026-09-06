import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CONTACT } from "@/lib/site";

export const Route = createFileRoute("/account/")({
  component: AccountOverview,
});

function AccountOverview() {
  const { user } = useAuth();

  const { data, isPending } = useQuery({
    queryKey: ["account-overview", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [profile, services, tickets, documents] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("customer_services").select("*").eq("user_id", user!.id),
        supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase.from("documents").select("id").eq("user_id", user!.id),
      ]);
      return {
        profile: profile.data,
        services: services.data ?? [],
        tickets: tickets.data ?? [],
        documentCount: documents.data?.length ?? 0,
      };
    },
  });

  if (isPending) return <p className="text-lg text-muted-foreground">Loading…</p>;

  const openTickets = (data?.tickets ?? []).filter((t) => t.status !== "closed").length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Hello{data?.profile?.full_name ? `, ${data.profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {data?.profile?.community
            ? `Your services at ${data.profile.community}.`
            : "Here's a summary of your account."}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: "Active services", value: data?.services.length ?? 0, to: "/account/services" as const },
          { label: "Open support requests", value: openTickets, to: "/account/support" as const },
          { label: "Documents", value: data?.documentCount ?? 0, to: "/account/documents" as const },
        ].map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-sm border border-border p-7 transition-colors hover:border-primary"
          >
            <p className="text-4xl font-semibold text-primary">{card.value}</p>
            <p className="mt-2 text-lg text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="text-2xl font-semibold">Recent support requests</h2>
        {data?.tickets.length ? (
          <ul className="mt-5 divide-y divide-border rounded-sm border border-border">
            {data.tickets.map((ticket) => (
              <li key={ticket.id} className="flex flex-wrap items-center justify-between gap-3 p-6">
                <div>
                  <p className="text-lg font-medium">{ticket.subject}</p>
                  <p className="text-muted-foreground">
                    {ticket.reference} · {new Date(ticket.created_at).toLocaleDateString("en-AU")}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-4 py-1.5 font-medium capitalize">
                  {ticket.status?.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-lg text-muted-foreground">
            Nothing open right now. If something isn't working,{" "}
            <Link to="/account/support" className="font-medium text-primary hover:underline">
              log a request
            </Link>{" "}
            or call {CONTACT.phone}.
          </p>
        )}
      </section>
    </div>
  );
}
