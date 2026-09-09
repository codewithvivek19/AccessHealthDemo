import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Users,
  Wifi,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DataTable,
  EmptyState,
  ErrorState,
  RecordHeader,
  SkeletonCard,
  StatusBadge,
} from "@/components/site/PortalShell";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { initials, money, shortDate } from "@/components/portal/format";
export const Route = createFileRoute("/staff/customers")({ component: StaffCustomers });
function StaffCustomers() {
  const { user } = useAuth();
  const [term, setTerm] = useState("");
  const [community, setCommunity] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["portal-customers", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });
  const detail = useQuery({
    queryKey: ["portal-customer-detail", user?.id, selectedId],
    enabled: Boolean(selectedId && user),
    queryFn: async () => {
      const [services, tickets] = await Promise.all([
        supabase.from("customer_services").select("*").eq("user_id", selectedId!),
        supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", selectedId!)
          .order("updated_at", { ascending: false })
          .limit(10),
      ]);
      if (services.error) throw services.error;
      if (tickets.error) throw tickets.error;
      return { services: services.data, tickets: tickets.data };
    },
  });
  if (query.isPending) return <SkeletonCard lines={8} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const selected = query.data.find((p) => p.id === selectedId);
  const profiles = query.data.filter(
    (p) =>
      (community === "all" || p.community === community) &&
      [p.full_name, p.email, p.phone, p.community, p.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term.toLowerCase()),
  );
  const communities = [
    ...new Set(query.data.map((p) => p.community).filter((v): v is string => Boolean(v))),
  ].sort();
  return (
    <>
      <RecordHeader
        title="Customer directory"
        subtitle="People first. Every connection in context."
        actions={
          <span className="p-directory-count">
            <Users size={16} />
            {query.data.length} recent profiles
          </span>
        }
      />
      <section className="p-panel">
        <div className="p-toolbar">
          <label className="p-search-field">
            <Search size={15} />
            <input
              aria-label="Search customers"
              placeholder="Name, email, or community…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </label>
          <select
            className="p-status-select"
            aria-label="Filter community"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
          >
            <option value="all">All communities</option>
            {communities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <DataTable
          data={profiles}
          onRowClick={(p) => setSelectedId(p.id)}
          columns={[
            {
              header: "Customer",
              sortValue: (p) => p.full_name ?? "",
              accessor: (p) => (
                <span className="p-inline-person">
                  <span className="p-customer-avatar">{initials(p.full_name ?? p.email)}</span>
                  <span>
                    {p.full_name ?? "Unnamed customer"}
                    <span className="p-subtext">{p.email ?? "No email recorded"}</span>
                  </span>
                </span>
              ),
            },
            {
              header: "Community",
              sortValue: (p) => p.community ?? "",
              accessor: (p) => p.community ?? "Not recorded",
            },
            { header: "Phone", accessor: (p) => p.phone ?? "Not recorded" },
            {
              header: "Joined",
              sortValue: (p) => p.created_at,
              accessor: (p) => shortDate(p.created_at),
            },
            { header: "", accessor: () => <ArrowUpRight size={15} className="text-slate-400" /> },
          ]}
        />
      </section>
      <Sheet
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <SheetContent className="portal-popup p-record-sheet">
          {selected && (
            <>
              <div className="p-profile-cover">
                <span className="p-large-avatar">
                  {initials(selected.full_name ?? selected.email)}
                </span>
                <span className="p-record-type">CUSTOMER RECORD</span>
                <SheetTitle>{selected.full_name ?? "Customer"}</SheetTitle>
                <SheetDescription>{selected.email ?? "No email recorded"}</SheetDescription>
                <div className="p-profile-actions">
                  {selected.email && (
                    <a className="p-button p-button-secondary" href={`mailto:${selected.email}`}>
                      <Mail size={14} />
                      Email
                    </a>
                  )}
                  {selected.phone && (
                    <a className="p-button p-button-secondary" href={`tel:${selected.phone}`}>
                      <Phone size={14} />
                      Call
                    </a>
                  )}
                </div>
              </div>
              <dl className="p-detail-grid">
                <div>
                  <dt>Community</dt>
                  <dd>{selected.community ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selected.phone ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{selected.address ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Customer since</dt>
                  <dd>{shortDate(selected.created_at)}</dd>
                </div>
              </dl>
              <div className="p-sheet-section">
                <h3>
                  <Wifi size={16} />
                  Subscriptions
                </h3>
                {detail.isPending ? (
                  <SkeletonCard />
                ) : detail.isError ? (
                  <ErrorState retry={() => void detail.refetch()} />
                ) : detail.data.services.length ? (
                  detail.data.services.map((s) => (
                    <div className="p-sheet-record" key={s.id}>
                      <div>
                        <strong>{s.service_name}</strong>
                        <p>
                          {s.plan ?? "Plan not recorded"} · {money(s.monthly_price)}/month
                        </p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  ))
                ) : (
                  <p className="p-subtext">No linked subscriptions.</p>
                )}
              </div>
              <div className="p-sheet-section">
                <h3>
                  <MessageSquare size={16} />
                  Recent support
                </h3>
                {detail.data?.tickets.length ? (
                  detail.data.tickets.map((t) => (
                    <Link
                      className="p-sheet-record"
                      to="/staff"
                      search={{ ticket: t.id }}
                      key={t.id}
                    >
                      <div>
                        <strong>{t.subject}</strong>
                        <p>
                          {t.reference} · {shortDate(t.updated_at)}
                        </p>
                      </div>
                      <StatusBadge status={t.status} />
                    </Link>
                  ))
                ) : (
                  <p className="p-subtext">No recent support requests.</p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
