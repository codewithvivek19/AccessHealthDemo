import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Building2, MapPin, MessageSquare, Users, Wifi } from "lucide-react";
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
export const Route = createFileRoute("/operator/")({ component: OperatorOverview });
function OperatorOverview() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["portal-operator-overview", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [sites, tickets] = await Promise.all([
        supabase.from("sites").select("*").order("name"),
        supabase.from("support_tickets").select("id, site_id, status").not("site_id", "is", null),
      ]);
      if (sites.error) throw sites.error;
      if (tickets.error) throw tickets.error;
      return { sites: sites.data, tickets: tickets.data };
    },
  });
  if (query.isPending) return <SkeletonCard lines={8} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const d = query.data;
  const requests = (id: string) =>
    d.tickets.filter((t) => t.site_id === id && t.status !== "closed").length;
  return (
    <>
      <RecordHeader
        title="Your communities"
        subtitle="A considered view of every connection."
        actions={
          <Link to="/operator/requests" className="p-button p-button-secondary">
            <MessageSquare size={15} />
            View requests
            <ArrowUpRight size={14} />
          </Link>
        }
      />
      <div className="p-stats">
        <StatCard
          label="Community sites"
          value={d.sites.length}
          icon={<MapPin />}
          hint="In your accessible portfolio"
        />
        <StatCard
          label="Commissioned sites"
          value={d.sites.filter((s) => s.status === "live").length}
          icon={<Wifi />}
          hint="Sites marked as live"
        />
        <StatCard
          label="Total dwellings"
          value={d.sites.reduce((n, s) => n + s.dwellings, 0)}
          icon={<Users />}
          hint="Across your listed communities"
        />
        <StatCard
          label="Open requests"
          value={d.tickets.filter((t) => t.status !== "closed").length}
          icon={<MessageSquare />}
          hint="Requests in the accessible view"
          to="/operator/requests"
        />
      </div>
      <section className="p-panel">
        <div className="p-panel-heading">
          <div>
            <h2>Village portfolio</h2>
            <p>Services, locations, and requests in one view.</p>
          </div>
          <Link to="/operator/sites">
            Site directory
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <DataTable
          data={d.sites}
          columns={[
            {
              header: "Community",
              sortValue: (s) => s.name,
              accessor: (s) => (
                <span className="p-inline-person">
                  <span className="p-service-icon">
                    <Building2 />
                  </span>
                  <span>
                    {s.name}
                    <span className="p-subtext">
                      {[s.suburb, s.state].filter(Boolean).join(", ")}
                    </span>
                  </span>
                </span>
              ),
            },
            { header: "Dwellings", sortValue: (s) => s.dwellings, accessor: (s) => s.dwellings },
            { header: "Services", accessor: (s) => s.services?.length ?? 0 },
            {
              header: "Open requests",
              accessor: (s) => (
                <Link to="/operator/requests" className="p-text-link">
                  {requests(s.id)}
                </Link>
              ),
            },
            { header: "Site stage", accessor: (s) => <StatusBadge status={s.status} /> },
          ]}
        />
      </section>
      <div className="p-plan-help">
        <div>
          <h3>One team for your whole community.</h3>
          <p>Planning an upgrade or need help with a village-wide issue?</p>
        </div>
        <a href="tel:1300736785" className="p-text-link">
          Call 1300 736 785
          <ArrowUpRight size={15} />
        </a>
      </div>
    </>
  );
}
