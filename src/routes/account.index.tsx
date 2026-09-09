import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  FileText,
  LifeBuoy,
  MessageSquare,
  Plus,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  EmptyState,
  ErrorState,
  RecordHeader,
  SkeletonCard,
  StatCard,
  StatusBadge,
} from "@/components/site/PortalShell";
import { money, shortDate } from "@/components/portal/format";
export const Route = createFileRoute("/account/")({ component: AccountDashboard });
function AccountDashboard() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["portal-account-overview", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [profile, services, tickets, open, documents] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("customer_services").select("*").eq("user_id", user!.id),
        supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", user!.id)
          .order("updated_at", { ascending: false })
          .limit(4),
        supabase
          .from("support_tickets")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .neq("status", "closed"),
        supabase
          .from("documents")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id),
      ]);
      for (const response of [profile, services, tickets, open, documents])
        if (response.error) throw response.error;
      return {
        profile: profile.data,
        services: services.data ?? [],
        tickets: tickets.data ?? [],
        open: open.count ?? 0,
        documents: documents.count ?? 0,
      };
    },
  });
  if (query.isPending) return <SkeletonCard lines={8} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const d = query.data;
  const active = d.services.filter((s) => s.status === "active");
  const allPriced = active.every((s) => s.monthly_price != null);
  return (
    <>
      <RecordHeader
        title={`Hello${d.profile?.full_name ? `, ${d.profile.full_name.split(" ")[0]}` : " there"}.`}
        subtitle="Your services, thoughtfully connected."
        actions={
          <Link to="/account/support" search={{ new: true }} className="p-button">
            <MessageSquare size={16} />
            Let’s talk
          </Link>
        }
      />
      <div className="p-stats p-stats-three">
        <StatCard
          label="Active subscriptions"
          value={active.length}
          icon={<Wifi />}
          hint="Your connected services"
          to="/account/services"
        />
        <StatCard
          label="Monthly service total"
          value={
            allPriced
              ? money(active.reduce((sum, s) => sum + (s.monthly_price ?? 0), 0))
              : "To be confirmed"
          }
          icon={<CreditCard />}
          hint="Active plan prices · AUD"
        />
        <StatCard
          label="Open support requests"
          value={d.open}
          icon={<LifeBuoy />}
          hint={d.open ? "We’ll keep the conversation moving" : "Here whenever you need us"}
          to="/account/support"
        />
      </div>
      <div className="p-two-column">
        <div className="p-stack">
          <section className="p-panel">
            <div className="p-panel-heading">
              <div>
                <h2>Your subscriptions</h2>
                <p>{d.profile?.community ?? "Services linked to your account"}</p>
              </div>
              <Link to="/account/services">
                View all
                <ArrowUpRight size={15} />
              </Link>
            </div>
            {d.services.length ? (
              d.services.slice(0, 4).map((s) => (
                <Link to="/account/services" key={s.id} className="p-row p-service-row">
                  <span className="p-service-icon">
                    <Wifi />
                  </span>
                  <div className="p-row-text">
                    <strong>{s.service_name}</strong>
                    <p>{s.plan ?? "Plan details available from Acsess"}</p>
                  </div>
                  <div className="p-service-price">
                    <strong>{money(s.monthly_price)}</strong>
                    <span>per month</span>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              ))
            ) : (
              <EmptyState
                icon={<Wifi />}
                title="Ready when you are."
                description="Your subscriptions will appear here once they’re linked to your account."
                action={{ label: "Get connected", to: "/contact" }}
              />
            )}
          </section>
          <section className="p-panel">
            <div className="p-panel-heading">
              <div>
                <h2>Recent conversations</h2>
                <p>A little clarity, every step of the way.</p>
              </div>
              <Link to="/account/support">
                View support
                <ArrowUpRight size={15} />
              </Link>
            </div>
            {d.tickets.length ? (
              d.tickets.map((t) => (
                <Link key={t.id} to="/account/support" search={{ ticket: t.id }} className="p-row">
                  <span className="p-service-icon">
                    <MessageSquare />
                  </span>
                  <div className="p-row-text">
                    <strong>{t.subject}</strong>
                    <p>
                      {t.reference} · Updated {shortDate(t.updated_at)}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </Link>
              ))
            ) : (
              <EmptyState
                icon={<MessageSquare />}
                title="A fresh start."
                description="No support requests yet. If something comes up, we’re just a message away."
                action={{ label: "Start a conversation", to: "/account/support" }}
              />
            )}
          </section>
        </div>
        <div className="p-stack">
          <section className="p-concierge">
            <div className="p-concierge-top">
              <span>PERSONAL SUPPORT</span>
              <MessageSquare size={22} strokeWidth={1.3} />
            </div>
            <h2>
              Real people.
              <br />
              Right here.
            </h2>
            <p>From a quick question to getting connected, your Acsess team is here to help.</p>
            <Link to="/account/support" search={{ new: true }}>
              How can we help?
              <ArrowRight size={17} />
            </Link>
            <div className="p-concierge-phone">
              <span>Or give us a call</span>
              <a href="tel:1300736785">1300 736 785</a>
            </div>
          </section>
          <section className="p-panel">
            <div className="p-panel-heading">
              <h2>Account essentials</h2>
            </div>
            <Link className="p-row" to="/account/documents">
              <FileText size={18} className="text-slate-400" />
              <div className="p-row-text">
                <strong>Your documents</strong>
                <p>
                  {d.documents} document{d.documents === 1 ? "" : "s"} in your library
                </p>
              </div>
              <ArrowUpRight size={15} className="text-slate-400" />
            </Link>
            <Link className="p-row" to="/account/profile">
              <ShieldCheck size={18} className="text-slate-400" />
              <div className="p-row-text">
                <strong>Profile & preferences</strong>
                <p>Keep your contact details up to date</p>
              </div>
              <ArrowUpRight size={15} className="text-slate-400" />
            </Link>
            <div className="p-aside-note">
              <strong>Something not looking right?</strong>If a service or document is missing,
              contact us and we’ll help link it to your account.
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
