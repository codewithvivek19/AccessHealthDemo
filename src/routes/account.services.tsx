import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/account/services")({
  component: MyServices,
});

function MyServices() {
  const { user } = useAuth();
  const { data, isPending } = useQuery({
    queryKey: ["my-services", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_services")
        .select("*")
        .eq("user_id", user!.id)
        .order("started_on", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">My services</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Everything Acsess currently provides at your address.
      </p>

      {isPending && <p className="mt-8 text-lg text-muted-foreground">Loading…</p>}

      {!isPending && !data?.length && (
        <p className="mt-8 text-lg text-muted-foreground">
          We don't have any services linked to this account yet.{" "}
          <Link to="/contact" className="font-medium text-primary hover:underline">
            Get in touch
          </Link>{" "}
          and we'll connect them.
        </p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {data?.map((service) => (
          <article key={service.id} className="rounded-sm border border-border p-7">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold">{service.service_name}</h2>
              <span className="rounded-full bg-primary/10 px-3.5 py-1 font-medium capitalize text-primary">
                {service.status}
              </span>
            </div>
            <dl className="mt-5 space-y-2 text-lg">
              {service.plan && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd className="text-right font-medium">{service.plan}</dd>
                </div>
              )}
              {service.location && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="text-right font-medium">{service.location}</dd>
                </div>
              )}
              {service.monthly_price != null && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Monthly</dt>
                  <dd className="text-right font-medium">
                    ${Number(service.monthly_price).toFixed(2)}
                  </dd>
                </div>
              )}
              {service.started_on && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Connected</dt>
                  <dd className="text-right font-medium">
                    {new Date(service.started_on).toLocaleDateString("en-AU")}
                  </dd>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
