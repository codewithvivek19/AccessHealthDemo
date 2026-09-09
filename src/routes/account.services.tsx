import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  MapPin,
  MessageSquare,
  Phone,
  Tv,
  Wifi,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  EmptyState,
  ErrorState,
  RecordHeader,
  SkeletonCard,
  StatusBadge,
} from "@/components/site/PortalShell";
import { money, shortDate } from "@/components/portal/format";
export const Route = createFileRoute("/account/services")({ component: AccountServices });
function AccountServices() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const query = useQuery({
    queryKey: ["portal-subscriptions", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_services")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (query.isPending) return <SkeletonCard lines={7} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const services = query.data.filter((s) => filter === "all" || s.status === filter);
  return (
    <>
      <RecordHeader
        title="Your subscriptions."
        subtitle="Everything you’re connected to. Every detail in one place."
        actions={
          <div className="p-segments">
            {["all", "active"].map((value) => (
              <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
                {value === "all" ? "All services" : "Active"}
              </button>
            ))}
          </div>
        }
      />
      <div className="p-subscription-grid">
        {services.map((s) => (
          <article key={s.id} className="p-panel p-subscription">
            <div className="p-subscription-top">
              <span className="p-service-icon">
                {/phone|voice|telephone/i.test(s.service_name) ? (
                  <Phone />
                ) : /tv|television|foxtel/i.test(s.service_name) ? (
                  <Tv />
                ) : (
                  <Wifi />
                )}
              </span>
              <StatusBadge status={s.status} />
            </div>
            <div className="p-subscription-title">
              <p>ACSESS SERVICE</p>
              <h2>{s.service_name}</h2>
              <span>{s.plan ?? "Contact us for your plan details"}</span>
            </div>
            <div className="p-subscription-cost">
              <strong>{money(s.monthly_price)}</strong>
              {s.monthly_price != null && <span>/ month</span>}
            </div>
            <dl className="p-subscription-details">
              <div>
                <dt>
                  <MapPin size={15} />
                  Service location
                </dt>
                <dd>{s.location ?? "Not recorded"}</dd>
              </div>
              <div>
                <dt>
                  <CalendarDays size={15} />
                  Connected since
                </dt>
                <dd>{shortDate(s.started_on)}</dd>
              </div>
              <div>
                <dt>
                  <CreditCard size={15} />
                  Billing currency
                </dt>
                <dd>AUD</dd>
              </div>
            </dl>
            <div className="p-subscription-actions">
              <Link
                to="/account/support"
                search={{ service: s.service_name, new: true }}
                className="p-button p-button-secondary"
              >
                <MessageSquare size={15} />
                Get help with this service
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!services.length && (
        <EmptyState
          icon={<Wifi />}
          title={
            filter === "active" ? "No active subscriptions." : "Your next connection starts here."
          }
          description="Once a service is linked to your account, you can see its plan, price, and support history here."
          action={{ label: "Talk to Acsess", to: "/contact" }}
        />
      )}
      <div className="p-plan-help">
        <div>
          <h3>Thinking about a change?</h3>
          <p>Talk to our team about your plan, moving home, or adding another service.</p>
        </div>
        <Link to="/account/support" search={{ new: true }} className="p-text-link">
          Let’s find the right fit
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </>
  );
}
