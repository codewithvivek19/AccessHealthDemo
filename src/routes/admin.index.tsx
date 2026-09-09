import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Building2,
  Globe,
  MapPin,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DataTable,
  EmptyState,
  ErrorState,
  RecordHeader,
  SkeletonCard,
  StatCard,
  StatusBadge,
} from "@/components/site/PortalShell";
import { shortDate } from "@/components/portal/format";
export const Route = createFileRoute("/admin/")({ component: AdminOverview });
function AdminOverview() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["portal-admin-overview", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [people, orgs, siteCount, sites, tickets, open, progress, closed, team] =
        await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("organisations").select("id", { count: "exact", head: true }),
          supabase.from("sites").select("id", { count: "exact", head: true }),
          supabase
            .from("sites")
            .select("id, name, suburb, state, status, dwellings")
            .order("name")
            .limit(4),
          supabase
            .from("support_tickets")
            .select("id, subject, reference, status, priority, updated_at")
            .order("updated_at", { ascending: false })
            .limit(6),
          supabase
            .from("support_tickets")
            .select("id", { count: "exact", head: true })
            .eq("status", "open"),
          supabase
            .from("support_tickets")
            .select("id", { count: "exact", head: true })
            .eq("status", "in_progress"),
          supabase
            .from("support_tickets")
            .select("id", { count: "exact", head: true })
            .eq("status", "closed"),
          supabase.from("user_roles").select("user_id, role").in("role", ["staff", "admin"]),
        ]);
      for (const r of [people, orgs, siteCount, sites, tickets, open, progress, closed, team])
        if (r.error) throw r.error;
      return {
        people: people.count ?? 0,
        orgs: orgs.count ?? 0,
        siteCount: siteCount.count ?? 0,
        sites: sites.data ?? [],
        tickets: tickets.data ?? [],
        open: open.count ?? 0,
        progress: progress.count ?? 0,
        closed: closed.count ?? 0,
        team: new Set(team.data?.map((r) => r.user_id)).size,
      };
    },
  });
  if (query.isPending) return <SkeletonCard lines={8} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const d = query.data;
  const total = d.open + d.progress + d.closed;
  const openAngle = total ? (d.open / total) * 360 : 0;
  const progressAngle = total ? ((d.open + d.progress) / total) * 360 : 0;
  return (
    <>
      <RecordHeader
        title="Company overview"
        subtitle="The bigger picture. Down to the details that matter."
        actions={
          <Link to="/admin/people" className="p-button p-button-secondary">
            <Users size={16} />
            Manage people
            <ArrowUpRight size={14} />
          </Link>
        }
      />
      <div className="p-stats">
        <StatCard
          label="People"
          value={d.people}
          icon={<Users />}
          hint="Registered accounts"
          to="/admin/people"
        />
        <StatCard
          label="Organisations"
          value={d.orgs}
          icon={<Building2 />}
          hint="Operators & developers"
          to="/admin/organisations"
        />
        <StatCard
          label="Community sites"
          value={d.siteCount}
          icon={<MapPin />}
          hint="Across your portfolio"
          to="/operator/sites"
        />
        <StatCard
          label="Open & in progress"
          value={d.open + d.progress}
          icon={<MessageSquare />}
          hint="Requests awaiting resolution"
          to="/staff"
        />
      </div>
      <div className="p-two-column">
        <div className="p-stack">
          <section className="p-panel">
            <div className="p-panel-heading">
              <div>
                <h2>Latest service activity</h2>
                <p>Recently updated customer requests</p>
              </div>
              <Link to="/staff">
                Open service desk
                <ArrowUpRight size={15} />
              </Link>
            </div>
            <DataTable
              data={d.tickets}
              columns={[
                {
                  header: "Request",
                  accessor: (r) => (
                    <Link to="/staff" search={{ ticket: r.id }} className="p-record-link">
                      {r.subject}
                      <span className="p-subtext">{r.reference}</span>
                    </Link>
                  ),
                  sortValue: (r) => r.subject,
                },
                { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
                {
                  header: "Updated",
                  accessor: (r) => shortDate(r.updated_at),
                  sortValue: (r) => r.updated_at,
                },
              ]}
            />
          </section>
          <section className="p-panel">
            <div className="p-panel-heading">
              <div>
                <h2>Your communities</h2>
                <p>Sites in the Acsess portfolio</p>
              </div>
              <Link to="/operator/sites">
                View portfolio
                <ArrowUpRight size={15} />
              </Link>
            </div>
            {d.sites.length ? (
              d.sites.map((s) => (
                <Link to="/operator/sites" className="p-row" key={s.id}>
                  <span className="p-service-icon">
                    <Building2 />
                  </span>
                  <div className="p-row-text">
                    <strong>{s.name}</strong>
                    <p>
                      {[s.suburb, s.state].filter(Boolean).join(", ")} · {s.dwellings} dwellings
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              ))
            ) : (
              <EmptyState
                icon={<Building2 />}
                title="Room to grow."
                description="Your community sites will appear here."
              />
            )}
          </section>
        </div>
        <div className="p-stack">
          <section className="p-panel">
            <div className="p-panel-heading">
              <div>
                <h2>Support at a glance</h2>
                <p>Requests by current status</p>
              </div>
            </div>
            <div className="p-donut-wrap">
              <div
                className="p-donut"
                role="img"
                aria-label={`${d.open} open, ${d.progress} in progress, ${d.closed} closed requests`}
                style={{
                  background: total
                    ? `conic-gradient(#779fce 0deg ${openAngle}deg, #c4d5e9 ${openAngle}deg ${progressAngle}deg, #e8edf3 ${progressAngle}deg 360deg)`
                    : "#edf0f5",
                }}
              >
                <div>
                  <strong>{total}</strong>
                  <span>Total requests</span>
                </div>
              </div>
            </div>
            <div className="p-chart-legend">
              {[
                { label: "Open", value: d.open, color: "#779fce" },
                { label: "In progress", value: d.progress, color: "#c4d5e9" },
                { label: "Closed", value: d.closed, color: "#e8edf3" },
              ].map((v) => (
                <div key={v.label}>
                  <span style={{ background: v.color }} />
                  <span>{v.label}</span>
                  <strong>{v.value}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="p-panel">
            <div className="p-panel-heading">
              <h2>Company controls</h2>
              <Settings2 size={16} className="text-slate-400" />
            </div>
            <Link className="p-row" to="/admin/people">
              <ShieldCheck size={18} className="text-slate-400" />
              <div className="p-row-text">
                <strong>Team & access</strong>
                <p>
                  {d.team} team member{d.team === 1 ? "" : "s"} with internal access
                </p>
              </div>
              <ArrowUpRight size={15} className="text-slate-400" />
            </Link>
            <Link className="p-row" to="/admin/content">
              <Globe size={18} className="text-slate-400" />
              <div className="p-row-text">
                <strong>Website content</strong>
                <p>Services, resources, and products</p>
              </div>
              <ArrowUpRight size={15} className="text-slate-400" />
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
